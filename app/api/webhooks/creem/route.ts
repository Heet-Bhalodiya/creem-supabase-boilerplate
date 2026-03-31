import { Webhook } from '@creem_io/nextjs'
import { createServiceRoleClient } from '@/lib/supabase/server'

// Type guard helpers for webhook payload
type WebhookData = Record<string, unknown>

function getCustomerEmail(data: WebhookData): string | null {
  const customer = data.customer as WebhookData | undefined
  const nestedData = data.data as WebhookData | undefined
  const nestedCustomer = nestedData?.customer as WebhookData | undefined

  return (customer?.email || nestedCustomer?.email || null) as string | null
}

function getSubscriptionData(data: WebhookData) {
  const subscription = data.subscription || data.data || data
  return subscription as WebhookData
}

function getCustomerData(data: WebhookData) {
  const customer = data.customer || (data.data as WebhookData | undefined)?.customer
  return customer as WebhookData | undefined
}

function getProductData(data: WebhookData) {
  const product = data.product || (data.data as WebhookData | undefined)?.product
  return product as WebhookData | undefined
}

// Sync discount usage from webhook data
async function syncDiscountUsage(supabase: Awaited<ReturnType<typeof createServiceRoleClient>>, data: WebhookData) {
  // Check if discount was applied (discount code or ID in payment/subscription data)
  const subscription = data.subscription || data.data || data
  const discountCode = (subscription as Record<string, unknown>)?.discount_code as string | undefined
  const discountId = (subscription as Record<string, unknown>)?.discount_id as string | undefined

  if (!discountCode && !discountId) {
    return // No discount applied
  }

  // Find discount in our database
  const query = supabase.from('discount_codes').select('*')

  if (discountId) {
    query.eq('creem_discount_id', discountId)
  } else if (discountCode) {
    query.eq('code', discountCode)
  }

  const { data: discount, error } = await query.single()

  if (error || !discount) {
    console.warn('[WEBHOOK] Discount not found in database:', discountCode || discountId)
    return
  }

  // Increment usage count
  const { error: updateError } = await supabase
    .from('discount_codes')
    .update({
      used_count: discount.used_count + 1,
      current_uses: discount.current_uses + 1
    })
    .eq('id', discount.id)

  if (updateError) {
    console.error('[WEBHOOK] Failed to update discount usage:', updateError)
  }
}

// Grant credits based on subscription plan
async function grantSubscriptionCredits(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>,
  data: WebhookData
) {
  try {
    // Extract customer email and product info
    const customerEmail = getCustomerEmail(data)
    const product = getProductData(data)

    if (!customerEmail || !product) {
      console.warn('[WEBHOOK] Missing customer email or product data for credit grant')
      return
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single()

    if (profileError || !profile) {
      console.error('[WEBHOOK] User not found for credit grant:', customerEmail)
      return
    }

    // Find pricing plan by Creem product ID
    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('id, name, credits_per_cycle, grants_credits')
      .eq('creem_product_id', product.id)
      .single()

    if (planError || !plan || !plan.grants_credits || !plan.credits_per_cycle) {
      console.log('[WEBHOOK] No credits configured for this plan:', product.id)
      return
    }

    // Grant credits using the database function
    const { error: creditsError } = await supabase.rpc('update_credits_balance', {
      p_user_id: profile.id,
      p_amount: plan.credits_per_cycle,
      p_type: 'earned',
      p_description: `${plan.credits_per_cycle} credits from ${plan.name} subscription`,
      p_source: 'subscription',
      p_reference_id:
        ((data.subscription as Record<string, unknown>)?.id as string) ||
        ((data.data as Record<string, unknown>)?.id as string),
      p_metadata: {
        plan_name: plan.name,
        plan_id: plan.id,
        product_id: product.id,
        customer_email: customerEmail
      }
    })

    if (creditsError) {
      console.error('[WEBHOOK] Failed to grant subscription credits:', creditsError)
    }
  } catch (error) {
    console.error('[WEBHOOK] Error in grantSubscriptionCredits:', error)
  }
}

// Official Creem Webhook handler with automatic signature verification
// Docs: https://docs.creem.io/code/webhooks
export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  // Called when subscription becomes active (new subscription created)
  onSubscriptionActive: async data => {
    const supabase = createServiceRoleClient()

    const customerEmail = getCustomerEmail(data as unknown as WebhookData)
    if (!customerEmail) {
      console.error('[WEBHOOK] No customer email found in subscription event')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', customerEmail)
      .single()

    if (profileError || !profile) {
      console.error('[WEBHOOK] User not found:', customerEmail, profileError)
      return
    }

    // Extract subscription data
    const subscription = getSubscriptionData(data as unknown as WebhookData)
    const customer = getCustomerData(data as unknown as WebhookData)
    const product = getProductData(data as unknown as WebhookData)

    const subscriptionData = {
      user_id: profile.id,
      payment_email: customerEmail,
      creem_subscription_id: subscription.id as string,
      creem_customer_id: customer?.id as string,
      creem_product_id: (subscription.product_id ||
        (subscription.product as WebhookData | undefined)?.id ||
        '') as string,
      plan_name: (product?.name || 'Unknown Plan') as string,
      status: 'active',
      current_period_start: (subscription.current_period_start || new Date().toISOString()) as string,
      current_period_end: (subscription.current_period_end ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) as string,
      cancel_at_period_end: (subscription.cancel_at_period_end || false) as boolean,
      canceled_at: null,
      updated_at: new Date().toISOString()
    }

    const { error: upsertError } = await supabase
      .from('creem_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'creem_subscription_id'
      })
      .select()

    if (upsertError) {
      console.error('[WEBHOOK] Failed to upsert subscription:', upsertError)
    }

    await grantSubscriptionCredits(supabase, data as unknown as WebhookData)
    await syncDiscountUsage(supabase, data as unknown as WebhookData)
  },

  // Called when subscription payment is successful
  onSubscriptionPaid: async data => {
    const supabase = createServiceRoleClient()

    const customerEmail = getCustomerEmail(data as unknown as WebhookData)
    if (!customerEmail) {
      console.error('[WEBHOOK] No customer email found')
      return
    }

    const { data: profile } = await supabase.from('profiles').select('id').eq('email', customerEmail).single()

    if (!profile) {
      console.error('[WEBHOOK] User not found:', customerEmail)
      return
    }

    const payment = getSubscriptionData(data as unknown as WebhookData)
    const customer = getCustomerData(data as unknown as WebhookData)
    const product = getProductData(data as unknown as WebhookData)

    const paymentData = {
      user_id: profile.id,
      creem_payment_id: (payment.id || `pay_${Date.now()}`) as string,
      creem_customer_id: customer?.id as string | null,
      creem_product_id: product?.id as string | null,
      status: 'succeeded',
      amount: payment.amount ? Number(payment.amount) / 100 : product?.price ? Number(product.price) / 100 : 0,
      currency: (payment.currency || 'USD') as string,
      checkout_id: payment.checkout_id as string | null,
      metadata: {
        eventType: 'subscription.paid',
        paidAt: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }

    const { error: paymentError } = await supabase
      .from('creem_payments')
      .upsert(paymentData, {
        onConflict: 'creem_payment_id'
      })
      .select()

    if (paymentError) {
      console.error('[WEBHOOK] Failed to store payment:', paymentError)
    }

    // Don't grant credits here - only grant credits in onSubscriptionActive to avoid duplication
    await syncDiscountUsage(supabase, data as unknown as WebhookData)
  },

  onSubscriptionCanceled: async data => {
    const supabase = createServiceRoleClient()
    const subscription = getSubscriptionData(data as unknown as WebhookData)

    const { error } = await supabase
      .from('creem_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', subscription.id as string)

    if (error) {
      console.error('[WEBHOOK] Failed to update subscription:', error)
    }
  },

  onSubscriptionExpired: async data => {
    const supabase = createServiceRoleClient()
    const subscription = getSubscriptionData(data as unknown as WebhookData)

    const { error } = await supabase
      .from('creem_subscriptions')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', subscription.id as string)

    if (error) {
      console.error('❌ [WEBHOOK] Failed to update subscription:', error)
    }
  },

  onSubscriptionUpdate: async data => {
    const supabase = createServiceRoleClient()
    const subscription = getSubscriptionData(data as unknown as WebhookData)
    const product = getProductData(data as unknown as WebhookData)

    const { error } = await supabase
      .from('creem_subscriptions')
      .update({
        status: (subscription.status || 'active') as string,
        plan_name: product?.name ? (product.name as string) : undefined,
        current_period_start: subscription.current_period_start as string,
        current_period_end: subscription.current_period_end as string,
        cancel_at_period_end: (subscription.cancel_at_period_end || false) as boolean,
        updated_at: new Date().toISOString()
      })
      .eq('creem_subscription_id', subscription.id as string)

    if (error) {
      console.error('❌ [WEBHOOK] Failed to update subscription:', error)
    }
  },

  // Handle checkout completion (one-time purchases including credit products)
  onCheckoutCompleted: async data => {
    const supabase = createServiceRoleClient()

    const checkoutData = data as unknown as WebhookData
    const customerEmail = getCustomerEmail(checkoutData)

    if (!customerEmail) {
      console.error('[WEBHOOK] No customer email found in checkout event')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single()

    if (profileError || !profile) {
      console.error('[WEBHOOK] User not found for credit grant:', customerEmail)
      return
    }

    // Extract product data
    const product = getProductData(checkoutData)

    if (!product || !product.id) {
      console.error('[WEBHOOK] No product data in checkout event')
      return
    }

    // Store payment record
    const paymentData = {
      user_id: profile.id,
      creem_payment_id: (checkoutData.payment_id || checkoutData.id || `pay_${Date.now()}`) as string,
      creem_customer_id: getCustomerData(checkoutData)?.id as string | null,
      creem_product_id: product.id as string,
      status: 'succeeded',
      amount: checkoutData.amount ? Number(checkoutData.amount) / 100 : product.price ? Number(product.price) / 100 : 0,
      currency: (checkoutData.currency || 'USD') as string,
      checkout_id: checkoutData.id as string | null,
      metadata: {
        eventType: 'checkout.completed',
        completedAt: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }

    const { error: paymentError } = await supabase
      .from('creem_payments')
      .upsert(paymentData, {
        onConflict: 'creem_payment_id'
      })
      .select()

    if (paymentError) {
      console.error('[WEBHOOK] Failed to store payment:', paymentError)
    }

    // Check if this is a credit product
    const { data: creditProduct, error: productError } = await supabase
      .from('pricing_plans')
      .select('id, name, credits_per_cycle, grants_credits, payment_type')
      .eq('creem_product_id', product.id as string)
      .eq('payment_type', 'one_time')
      .eq('grants_credits', true)
      .single()

    if (productError || !creditProduct) {
      console.log('[WEBHOOK] Not a credit product or product not found:', product.id)
      return
    }

    if (!creditProduct.credits_per_cycle) {
      console.error('[WEBHOOK] Credit product has no credits_per_cycle:', creditProduct.id)
      return
    }

    // Grant credits using the database function
    const { error: creditsError } = await supabase.rpc('update_credits_balance', {
      p_user_id: profile.id,
      p_amount: creditProduct.credits_per_cycle,
      p_type: 'earned',
      p_description: `${creditProduct.credits_per_cycle} credits from ${creditProduct.name} purchase`,
      p_source: 'purchase',
      p_reference_id: paymentData.creem_payment_id,
      p_metadata: {
        product_name: creditProduct.name,
        product_id: creditProduct.id,
        creem_product_id: product.id,
        customer_email: customerEmail,
        amount_paid: paymentData.amount
      }
    })

    if (creditsError) {
      console.error('[WEBHOOK] Failed to grant credits for checkout:', creditsError)
    } else {
      console.log(`✅ [WEBHOOK] Granted ${creditProduct.credits_per_cycle} credits to ${customerEmail}`)
    }

    await syncDiscountUsage(supabase, checkoutData)
  }
})

// Handle GET requests for webhook verification
export async function GET() {
  return Response.json({
    status: 'active',
    message: 'Creem webhook endpoint is running'
  })
}
