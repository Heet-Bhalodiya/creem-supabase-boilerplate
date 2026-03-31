'use server'

import { createClient } from '@/lib/supabase/server'
import { CreemService } from '@/lib/creem/client'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/supabase/types'

export type PricingPlan = Database['public']['Tables']['pricing_plans']['Row']

// Manually sync a subscription from Creem API to database
// Used when webhooks aren't configured or failed
export async function syncSubscriptionToDatabase(subscriptionId: string) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    console.error(' [SYNC] Not authenticated')
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Fetch subscription from Creem API
    const subscription = await CreemService.getSubscription(subscriptionId)

    if (!subscription) {
      console.error(' [SYNC] Subscription not found:', subscriptionId)
      return { success: false, error: 'Subscription not found' }
    }

    // Verify the subscription belongs to this user
    if (subscription.customer?.email !== user.email) {
      console.error(' [SYNC] Subscription does not belong to user:', {
        subscriptionEmail: subscription.customer?.email,
        userEmail: user.email
      })
      return { success: false, error: 'Subscription does not belong to this user' }
    }

    // Store subscription in database (same format as webhook handler)
    const subscriptionData = {
      user_id: user.id,
      creem_subscription_id: subscription.id as string,
      creem_customer_id: subscription.customer.id,
      creem_product_id: subscription.product?.id || '',
      status: subscription.status || 'active',
      current_period_start: subscription.current_period_start || new Date().toISOString(),
      current_period_end: subscription.current_period_end || new Date().toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      canceled_at: subscription.canceled_at || null,
      updated_at: new Date().toISOString()
    }

    const { error: upsertError, data: insertedData } = await supabase
      .from('creem_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'creem_subscription_id'
      })
      .select()

    if (upsertError) {
      console.error(' [SYNC] Failed to store subscription:', upsertError)
      return { success: false, error: 'Failed to store subscription in database' }
    }

    return { success: true, subscription: insertedData[0] }
  } catch (error) {
    console.error(' [SYNC] Error syncing subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Create checkout session with Creem
export async function createCheckoutSession(productId: string, isUpgrade = false) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile for customer info
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Use different success URL for upgrades vs new subscriptions
  const successUrl = isUpgrade ? `${baseUrl}/user/billing?upgraded=true` : `${baseUrl}/billing/success`

  try {
    // Ensure there is an active plan mapped to this Creem product.
    const { data: plan } = await supabase
      .from('pricing_plans')
      .select('id, is_active')
      .eq('creem_product_id', productId)
      .single()

    if (!plan || !plan.is_active) {
      return { success: false, error: 'Selected plan is unavailable' }
    }

    const checkout = await CreemService.createCheckout({
      productId,
      customerEmail: user.email!,
      successUrl,
      requestId: `${isUpgrade ? 'upgrade' : 'order'}_${user.id}_${Date.now()}`,
      units: 1,
      metadata: {
        userId: user.id,
        userEmail: user.email!,
        userName: profile?.full_name || user.email!,
        isUpgrade: isUpgrade.toString()
      }
    })

    return { success: true, url: checkout.checkout_url }
  } catch (error) {
    console.error('Failed to create checkout:', error)
    return { success: false, error: 'Failed to create checkout session' }
  }
}

// Get customer subscriptions
export async function getCustomerSubscriptions() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Get subscriptions and manually join with pricing_plans
    const { data: dbSubscriptions, error: dbError } = await supabase
      .from('creem_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Fetch all active pricing plans for matching
    const { data: pricingPlans } = await supabase
      .from('pricing_plans')
      .select('creem_product_id, name, price, currency, interval, description')
      .eq('is_active', true)

    if (dbError) {
      console.error(' [SUBSCRIPTIONS] Database error:', dbError)
    }

    // Format subscriptions with plan data for UI
    const formattedSubs =
      dbSubscriptions?.map(sub => {
        // Find matching plan by creem_product_id
        const plan = pricingPlans?.find(p => p.creem_product_id === sub.creem_product_id)

        return {
          ...sub,
          plan_name: plan?.name || 'Unknown Plan',
          plan_price: plan?.price || 0,
          plan_currency: plan?.currency || 'USD',
          plan_interval: plan?.interval || 'month',
          plan_description: plan?.description || ''
        }
      }) || []

    return { success: true, subscriptions: formattedSubs }
  } catch (error) {
    console.error(' [SUBSCRIPTIONS] Failed to get subscriptions:', error)
    console.error(' [SUBSCRIPTIONS] Error details:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return { success: false, error: 'Failed to get subscriptions', subscriptions: [] }
  }
}

// Pause subscription
export async function pauseSubscription(subscriptionId: string) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const subscription = await CreemService.pauseSubscription(subscriptionId)

    revalidatePath('/user/billing')
    revalidatePath('/admin/billing')

    return { success: true, subscription }
  } catch (error) {
    console.error('Failed to pause subscription:', error)
    return { success: false, error: 'Failed to pause subscription' }
  }
}

// Resume subscription
export async function resumeSubscription(subscriptionId: string) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const subscription = await CreemService.resumeSubscription(subscriptionId)

    revalidatePath('/user/billing')
    revalidatePath('/admin/billing')

    return { success: true, subscription }
  } catch (error) {
    console.error('Failed to resume subscription:', error)
    return { success: false, error: 'Failed to resume subscription' }
  }
}

// Get customer billing portal URL
export async function getCustomerBillingPortalUrl() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Try to get customer by email
    const customer = await CreemService.getCustomerByEmail(user.email!)

    if (!customer) {
      return { success: false, error: 'Customer not found' }
    }

    const url = await CreemService.getCustomerBillingPortalUrl(customer.id)

    return { success: true, url }
  } catch (error) {
    console.error('Failed to get billing portal URL:', error)
    return { success: false, error: 'Failed to get billing portal URL' }
  }
}

// Get all pricing plans from database (for UI)
export async function getPricingPlans() {
  const supabase = await createClient()

  const { data, error } = await supabase.from('pricing_plans').select('*').order('sort_order', { ascending: true })

  if (error) throw error
  return data as PricingPlan[]
}

// Get active pricing plans (public) - for server-side rendering
export async function getActivePricingPlans(): Promise<PricingPlan[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch pricing plans:', error)
      return []
    }
    return ((data as PricingPlan[]) || []).map(plan => ({
      ...plan,
      payment_type: (plan.payment_type as 'subscription' | 'one_time') || 'subscription',
      interval:
        (plan.interval as 'month' | 'year' | 'one_time') ||
        ((plan.payment_type as 'subscription' | 'one_time') === 'one_time' ? 'one_time' : 'month')
    }))
  } catch (error) {
    console.error('Error fetching pricing plans:', error)
    return []
  }
}

// Create pricing plan (admin only)
export async function createPricingPlan(plan: Database['public']['Tables']['pricing_plans']['Insert']) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { data, error } = await supabase.from('pricing_plans').insert(plan).select().single()

  if (error) throw error

  revalidatePath('/admin/billing')
  revalidatePath('/')
  return data
}

// Update pricing plan (admin only)
export async function updatePricingPlan(id: string, plan: Partial<PricingPlan>) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { error } = await supabase.from('pricing_plans').update(plan).eq('id', id)

  if (error) throw error

  revalidatePath('/admin/billing')
  revalidatePath('/')
  return { success: true }
}

// Delete pricing plan (admin only)
export async function deletePricingPlan(id: string) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { error } = await supabase.from('pricing_plans').delete().eq('id', id)

  if (error) throw error

  revalidatePath('/admin/billing')
  revalidatePath('/')
  return { success: true }
}

// Real billing overview derived from Creem-backed tables.
export async function getAdminBillingOverview() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const [subscriptionsResult, paymentsResult] = await Promise.all([
    supabase.from('creem_subscriptions').select('status, created_at, canceled_at'),
    supabase.from('creem_payments').select('status, amount, currency, created_at')
  ])

  const subscriptions = subscriptionsResult.data || []
  const payments = paymentsResult.data || []

  const now = new Date()
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const successfulPayments = payments.filter(p => p.status === 'succeeded' || p.status === 'paid')
  const currentMonthRevenue = successfulPayments
    .filter(p => new Date(p.created_at) >= currentMonth)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const previousMonthRevenue = successfulPayments
    .filter(p => new Date(p.created_at) >= previousMonth && new Date(p.created_at) < currentMonth)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const monthlyGrowth =
    previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length
  const canceledThisMonth = subscriptions.filter(s => s.canceled_at && new Date(s.canceled_at) >= currentMonth).length
  const churnRate =
    activeSubscriptions + canceledThisMonth > 0
      ? (canceledThisMonth / (activeSubscriptions + canceledThisMonth)) * 100
      : 0

  const byMonth = new Map<string, { revenue: number; payments: number }>()
  for (const payment of successfulPayments) {
    const date = new Date(payment.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const current = byMonth.get(key) || { revenue: 0, payments: 0 }
    current.revenue += Number(payment.amount || 0)
    current.payments += 1
    byMonth.set(key, current)
  }

  return {
    totalRevenue: successfulPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    monthlyRevenue: currentMonthRevenue,
    activeSubscriptions,
    monthlyGrowth,
    churnRate,
    successfulPayments: successfulPayments.length,
    recentTrend: Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, values]) => ({
        month,
        revenue: values.revenue,
        payments: values.payments
      }))
  }
}

// Get billing configuration (admin only)
export async function getBillingConfig(): Promise<Array<{ key: string; value: string }>> {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { data, error } = await supabase.from('billing_config').select('*')

  if (error) throw error

  // Transform to array with key-value pairs
  return (data || []).map(item => ({
    key: item.key,
    value: String(item.value?.value || '')
  }))
}

// Update billing configuration (admin only)
export async function updateBillingConfig(key: string, value: string | number | boolean | Record<string, unknown>) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { error } = await supabase.from('billing_config').upsert(
    {
      key,
      value: { value },
      updated_by: user.id
    },
    {
      onConflict: 'key'
    }
  )

  if (error) throw error

  // Activity logging removed - table no longer exists

  revalidatePath('/admin/billing')
  return { success: true }
}

// Activity logging removed - table no longer exists

// Create discount via Creem API (admin only)
export async function createDiscount(params: {
  name: string
  code?: string
  type: 'percentage' | 'fixed'
  percentage?: number
  amount?: number
  currency?: string
  duration: 'forever' | 'once' | 'repeating'
  duration_in_months?: number
  max_redemptions?: number
  expiry_date?: string
  applies_to_products: string[]
}) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Get Creem API key from billing config
  const { data: configs } = await supabase.from('billing_config').select('*')

  const apiKeyConfig = configs?.find(c => c.key === 'creem_api_key')

  if (!apiKeyConfig?.value?.value) {
    return { success: false, error: 'Creem API key not configured' }
  }

  const apiKey = String(apiKeyConfig.value.value)

  // Auto-detect API URL based on key prefix (same as creem client)
  const apiUrl = apiKey.startsWith('creem_test_') ? 'https://test-api.creem.io' : 'https://api.creem.io'

  try {
    // Prepare request body matching Creem API docs exactly
    const requestBody: Record<string, unknown> = {
      name: params.name,
      type: params.type,
      duration: params.duration,
      applies_to_products: params.applies_to_products
    }

    // Add code if provided
    if (params.code) {
      requestBody.code = params.code
    }

    // Add percentage or amount based on type
    if (params.type === 'percentage' && params.percentage !== undefined) {
      requestBody.percentage = params.percentage
    } else if (params.type === 'fixed' && params.amount !== undefined) {
      requestBody.amount = params.amount // Amount in cents from form
      requestBody.currency = params.currency || 'USD'
    }

    // Add optional fields
    if (params.duration_in_months) {
      requestBody.duration_in_months = params.duration_in_months
    }
    if (params.expiry_date) {
      requestBody.expiry_date = params.expiry_date
    }
    if (params.max_redemptions) {
      requestBody.max_redemptions = params.max_redemptions
    }

    // Call Creem API to create discount code
    const response = await fetch(`${apiUrl}/v1/discounts`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()

    if (!response.ok) {
      return {
        success: false,
        error: `Creem API error (${response.status}): ${responseText}`
      }
    }

    const discount = JSON.parse(responseText)

    // Save discount to local database ONLY after Creem API success
    const { error: dbError } = await supabase.from('discount_codes').insert({
      code: discount.code,
      description: discount.name || null,
      discount_type: discount.type === 'percentage' ? 'percentage' : 'fixed_amount',
      discount_value: discount.type === 'percentage' ? discount.percentage : discount.amount || 0,
      currency: discount.currency || 'usd',
      max_uses: discount.max_redemptions || null,
      current_uses: discount.redeem_count || 0,
      expires_at: discount.expiry_date ? new Date(discount.expiry_date).toISOString() : null,
      is_active: discount.status === 'active',
      creem_discount_id: discount.id,
      discount_percentage: discount.type === 'percentage' ? discount.percentage : null,
      discount_amount: discount.type === 'fixed' ? discount.amount / 100 : null,
      used_count: discount.redeem_count || 0
    })

    if (dbError) {
      console.error('Failed to save discount to database:', dbError)
      // Discount created in Creem but failed to save locally
      // Still return success since the discount exists in Creem
    }

    revalidatePath('/admin/products/discounts')
    return { success: true, data: discount }
  } catch (error) {
    console.error('Error creating discount:', error)
    return { success: false, error: 'Failed to create discount' }
  }
}

// Delete discount via Creem API (admin only)
export async function deleteDiscount(discountId: string) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Get Creem API key from billing config
  const { data: configs } = await supabase.from('billing_config').select('*')

  const apiKeyConfig = configs?.find(c => c.key === 'creem_api_key')

  if (!apiKeyConfig?.value?.value) {
    return { success: false, error: 'Creem API key not configured' }
  }

  const apiKey = String(apiKeyConfig.value.value)

  // Auto-detect API URL based on key prefix
  const apiUrl = apiKey.startsWith('creem_test_') ? 'https://test-api.creem.io' : 'https://api.creem.io'

  try {
    // Call Creem API to delete discount - correct endpoint with /delete suffix
    const response = await fetch(`${apiUrl}/v1/discounts/${discountId}/delete`, {
      method: 'DELETE',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const responseText = await response.text()
      console.error('Creem API delete error:', response.status, responseText)
      return { success: false, error: `Failed to delete discount from Creem (${response.status})` }
    }

    // Remove from local database after Creem deletion succeeds
    const { error: dbError } = await supabase.from('discount_codes').delete().eq('creem_discount_id', discountId)

    if (dbError) {
      console.error('Failed to delete from database:', dbError)
      // Discount deleted from Creem but not from local DB
      // Still return success since it's gone from Creem
    }

    revalidatePath('/admin/products/discounts')
    return { success: true }
  } catch (error) {
    console.error('Error deleting discount:', error)
    return { success: false, error: 'Failed to delete discount' }
  }
}

// Sync discount usage from Creem API (admin only)
export async function syncDiscountUsage(discountId: string) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Get local discount record
  const { data: localDiscount } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('creem_discount_id', discountId)
    .single()

  if (!localDiscount) {
    return { success: false, error: 'Discount not found in database' }
  }

  // Get Creem API key from billing config
  const { data: configs } = await supabase.from('billing_config').select('*')

  const apiKeyConfig = configs?.find(c => c.key === 'creem_api_key')

  if (!apiKeyConfig?.value?.value) {
    return { success: false, error: 'Creem API key not configured' }
  }

  const apiKey = String(apiKeyConfig.value.value)

  // Auto-detect API URL based on key prefix
  const apiUrl = apiKey.startsWith('creem_test_') ? 'https://test-api.creem.io' : 'https://api.creem.io'

  try {
    // Fetch discount from Creem API
    const response = await fetch(`${apiUrl}/v1/discounts/${discountId}`, {
      headers: {
        'x-api-key': apiKey
      }
    })

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch discount from Creem' }
    }

    const discount = await response.json()

    // Update local database with Creem data
    const { error: updateError } = await supabase
      .from('discount_codes')
      .update({
        used_count: discount.redeem_count || 0,
        current_uses: discount.redeem_count || 0,
        is_active: discount.status === 'active'
      })
      .eq('creem_discount_id', discountId)

    if (updateError) {
      return { success: false, error: 'Failed to update local database' }
    }

    revalidatePath('/admin/products/discounts')
    return { success: true, data: discount }
  } catch (error) {
    console.error('Error syncing discount:', error)
    return { success: false, error: 'Failed to sync discount' }
  }
}

// Fetch all discounts from Creem API (admin only)
export async function getCreemDiscounts() {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Get Creem API key from billing config
  const { data: configs } = await supabase.from('billing_config').select('*')

  const apiKeyConfig = configs?.find(c => c.key === 'creem_api_key')

  if (!apiKeyConfig?.value?.value) {
    return { success: false, error: 'Creem API key not configured', discounts: [] }
  }

  const apiKey = String(apiKeyConfig.value.value)

  // Auto-detect API URL based on key prefix
  const apiUrl = apiKey.startsWith('creem_test_') ? 'https://test-api.creem.io' : 'https://api.creem.io'

  try {
    const response = await fetch(`${apiUrl}/v1/discounts`, {
      headers: {
        'x-api-key': apiKey
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch discounts:', response.status, await response.text())
      return { success: false, error: 'Failed to fetch discounts', discounts: [] }
    }

    const data = await response.json()

    // The API might return discounts directly or wrapped in a data property
    const discounts = Array.isArray(data) ? data : data.data || []

    return { success: true, discounts }
  } catch (error) {
    console.error('Error fetching discounts:', error)
    return { success: false, error: 'Failed to fetch discounts', discounts: [] }
  }
}

// Fetch product details from Creem API
export async function getCreemProduct(productId: string) {
  const supabase = await createClient()

  // Get Creem API key - try environment variable first, then database config
  let apiKey: string | undefined = process.env.CREEM_API_KEY

  if (!apiKey) {
    const { data: configs } = await supabase.from('billing_config').select('*')
    const apiKeyConfig = configs?.find(c => c.key === 'creem_api_key')
    apiKey = apiKeyConfig?.value?.value
  }

  if (!apiKey) {
    return null
  }

  // Auto-detect API URL based on key prefix
  const apiUrl = apiKey.startsWith('creem_test_') ? 'https://test-api.creem.io' : 'https://api.creem.io'

  try {
    const response = await fetch(`${apiUrl}/v1/products/${productId}`, {
      headers: {
        'x-api-key': apiKey
      }
    })

    if (!response.ok) {
      return null
    }

    const product = await response.json()
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Get user's subscription from Creem API
export async function getUserSubscription() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { success: false, subscription: null, error: 'Unauthorized' }

  try {
    // Get user's subscription from local database
    const { data: localSub } = await supabase
      .from('creem_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!localSub) {
      return { success: false, subscription: null, error: 'No active subscription found' }
    }

    return { success: true, subscription: localSub, error: null }
  } catch (error) {
    console.error('Error getting user subscription:', error)
    return { success: false, subscription: null, error: 'Failed to get subscription' }
  }
}

// Upgrade/downgrade subscription plan
export async function upgradeSubscription(newProductId: string) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Get user's current subscription
  const { subscription: currentSub } = await getUserSubscription()
  if (!currentSub) {
    return { success: false, error: 'No active subscription found' }
  }

  // Get Creem API key - try environment variable first, then database config
  let apiKey: string | undefined = process.env.CREEM_API_KEY

  if (!apiKey) {
    const { data: configs } = await supabase.from('billing_config').select('*')
    const apiKeyConfig = configs?.find(c => c.key === 'creem_api_key')
    apiKey = apiKeyConfig?.value?.value
  }

  if (!apiKey) {
    return { success: false, error: 'Creem API key not configured. Please contact support.' }
  }

  const apiUrl = apiKey.startsWith('creem_test_') ? 'https://test-api.creem.io' : 'https://api.creem.io'

  try {
    // Call Creem API to upgrade subscription
    const response = await fetch(`${apiUrl}/v1/subscriptions/${currentSub.creem_subscription_id}/upgrade`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: newProductId,
        update_behavior: 'proration-charge-immediately' // Charge/refund difference immediately
      })
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Creem upgrade error:', response.status, responseText)
      return { success: false, error: `Upgrade failed: ${responseText}` }
    }

    const updatedSubscription = JSON.parse(responseText)

    // Update local database (subscription.update webhook will also handle this)
    await supabase
      .from('creem_subscriptions')
      .update({
        creem_product_id: newProductId,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSub.id)

    revalidatePath('/user/billing')
    return { success: true, data: updatedSubscription }
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return { success: false, error: 'Failed to upgrade subscription' }
  }
}

// Cancel subscription
export async function cancelSubscription(mode: 'immediate' | 'scheduled' = 'scheduled') {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Get user's current subscription
  const { subscription: currentSub } = await getUserSubscription()
  if (!currentSub) {
    return { success: false, error: 'No active subscription found' }
  }

  // Get Creem API key - try environment variable first, then database config
  let apiKey: string | undefined = process.env.CREEM_API_KEY

  if (!apiKey) {
    const { data: configs } = await supabase.from('billing_config').select('*')
    const apiKeyConfig = configs?.find(c => c.key === 'creem_api_key')
    apiKey = apiKeyConfig?.value?.value
  }

  if (!apiKey) {
    return { success: false, error: 'Creem API key not configured. Please contact support.' }
  }

  const apiUrl = apiKey.startsWith('creem_test_') ? 'https://test-api.creem.io' : 'https://api.creem.io'

  try {
    // Call Creem API to cancel subscription
    const response = await fetch(`${apiUrl}/v1/subscriptions/${currentSub.creem_subscription_id}/cancel`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: mode // 'immediate' or 'scheduled' (cancel at period end)
      })
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Creem cancel error:', response.status, responseText)
      return { success: false, error: `Cancellation failed: ${responseText}` }
    }

    const cancelledSubscription = JSON.parse(responseText)

    // Update local database
    await supabase
      .from('creem_subscriptions')
      .update({
        status: mode === 'immediate' ? 'canceled' : 'scheduled_cancel',
        cancel_at_period_end: mode === 'scheduled',
        canceled_at: mode === 'immediate' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSub.id)

    revalidatePath('/user/billing')
    return { success: true, data: cancelledSubscription }
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return { success: false, error: 'Failed to cancel subscription' }
  }
}

// Generate customer portal link for self-service billing
export async function getCustomerPortalUrl() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized', url: null }

  // Get user's customer ID from their subscription
  const { subscription } = await getUserSubscription()
  if (!subscription?.creem_customer_id) {
    return { success: false, error: 'No customer ID found', url: null }
  }

  // Get Creem API configuration
  const { data: configs } = await supabase.from('billing_config').select('*')
  const apiKeyConfig = configs?.find(c => c.key === 'creem_api_key')

  if (!apiKeyConfig?.value?.value) {
    return { success: false, error: 'Creem API key not configured', url: null }
  }

  const apiKey = String(apiKeyConfig.value.value)
  const apiUrl = apiKey.startsWith('creem_test_') ? 'https://test-api.creem.io' : 'https://api.creem.io'

  try {
    // Call Creem API to generate customer portal link
    const response = await fetch(`${apiUrl}/v1/customers/billing`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_id: subscription.creem_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/billing`
      })
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Creem portal error:', response.status, responseText)
      return { success: false, error: `Portal generation failed: ${responseText}`, url: null }
    }

    const portalData = JSON.parse(responseText)

    return { success: true, error: null, url: portalData.url }
  } catch (error) {
    console.error('Error generating portal URL:', error)
    return { success: false, error: 'Failed to generate portal URL', url: null }
  }
}
