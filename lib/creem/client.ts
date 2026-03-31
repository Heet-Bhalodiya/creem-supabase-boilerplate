export type Product = {
  id: string
  name: string
  description: string
  price: number
  currency: string
  billing_period: string
}

export type Checkout = {
  id: string
  checkout_url: string
  product_id: string
  status: string
}

export type Customer = {
  id: string
  email: string
  name?: string
}

export type Subscription = {
  id: string
  status: string
  customer: Customer
  product: Product
  current_period_start: string
  current_period_end: string
  cancel_at_period_end?: boolean
  canceled_at?: string
}

export interface BoilerplateProduct extends Product {
  features: string[]
  popular?: boolean
  badge?: string
}

type CheckoutParams = {
  product_id: string
  customer?: {
    id?: string
    email: string
  }
  success_url: string
  request_id?: string
  units?: number
  discount_code?: string
  metadata?: Record<string, unknown>
}

type SubscriptionCancelOptions = {
  mode?: 'scheduled' | 'immediate'
}

const CREEM_API_KEY = process.env.CREEM_API_KEY

if (!CREEM_API_KEY) {
  console.warn('CREEM_API_KEY environment variable is not set')
}

const CREEM_API_BASE_URL = CREEM_API_KEY?.startsWith('creem_test_')
  ? 'https://test-api.creem.io'
  : 'https://api.creem.io'

async function creemApiRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
  if (!CREEM_API_KEY) {
    throw new Error('Creem API key is not configured. Please set CREEM_API_KEY environment variable.')
  }

  const url = `${CREEM_API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': CREEM_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Creem API error (${response.status}): ${error}`)
  }

  return response.json()
}

export const creem = {
  checkouts: {
    create: async (params: CheckoutParams): Promise<Checkout> => {
      const body = {
        product_id: params.product_id,
        success_url: params.success_url,
        ...(params.request_id && { request_id: params.request_id }),
        ...(params.units && { units: params.units }),
        ...(params.discount_code && { discount_code: params.discount_code }),
        ...(params.customer && { customer: params.customer }),
        ...(params.metadata && { metadata: params.metadata })
      }

      return (await creemApiRequest('/v1/checkouts', {
        method: 'POST',
        body: JSON.stringify(body)
      })) as Checkout
    }
  },
  products: {
    list: async (): Promise<{ data: Product[] }> => {
      return (await creemApiRequest('/v1/products')) as { data: Product[] }
    },
    get: async (id: string): Promise<Product> => {
      return (await creemApiRequest(`/v1/products/${id}`)) as Product
    }
  },
  customers: {
    get: async (id: string): Promise<Customer> => {
      return (await creemApiRequest(`/v1/customers/${id}`)) as Customer
    },
    getByEmail: async (email: string): Promise<Customer> => {
      return (await creemApiRequest(`/v1/customers?email=${encodeURIComponent(email)}`)) as Customer
    },
    getBillingPortalUrl: async (id: string): Promise<{ customer_portal_link: string }> => {
      return (await creemApiRequest(`/v1/customers/billing`, {
        method: 'POST',
        body: JSON.stringify({ customer_id: id })
      })) as { customer_portal_link: string }
    }
  },
  subscriptions: {
    get: async (subscriptionId: string): Promise<Subscription> => {
      return (await creemApiRequest(`/v1/subscriptions/${subscriptionId}`)) as Subscription
    },
    cancel: async (id: string, options?: SubscriptionCancelOptions): Promise<Subscription> => {
      return (await creemApiRequest(`/v1/subscriptions/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify(options || {})
      })) as Subscription
    },
    pause: async (id: string): Promise<Subscription> => {
      return (await creemApiRequest(`/v1/subscriptions/${id}/pause`, {
        method: 'POST'
      })) as Subscription
    },
    resume: async (id: string): Promise<Subscription> => {
      return (await creemApiRequest(`/v1/subscriptions/${id}/resume`, {
        method: 'POST'
      })) as Subscription
    }
  },
  webhooks: {
    verify: (payload: string, signature: string, secret: string): boolean => {
      return signature === secret
    }
  }
}

export class CreemService {
  static async createCheckout({
    productId,
    customerEmail,
    customerId,
    successUrl,
    requestId,
    units,
    discountCode,
    metadata
  }: {
    productId: string
    customerEmail?: string
    customerId?: string
    successUrl: string
    requestId?: string
    units?: number
    discountCode?: string
    metadata?: Record<string, unknown>
  }): Promise<Checkout> {
    const checkout = await creem.checkouts.create({
      product_id: productId,
      customer: customerEmail
        ? {
            id: customerId,
            email: customerEmail
          }
        : undefined,
      success_url: successUrl,
      request_id: requestId,
      units,
      discount_code: discountCode,
      metadata
    })

    return checkout
  }

  static async getProducts(): Promise<Product[]> {
    const response = await creem.products.list()
    return response.data
  }

  static async getProduct(productId: string): Promise<Product> {
    return await creem.products.get(productId)
  }

  static async getCustomer(customerId: string): Promise<Customer> {
    return await creem.customers.get(customerId)
  }

  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    const customer = await creem.customers.getByEmail(email)
    return customer
  }

  static async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const subscription = await creem.subscriptions.get(subscriptionId)
      return subscription
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return null
    }
  }

  static async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<Subscription> {
    return await creem.subscriptions.cancel(subscriptionId, {
      mode: cancelAtPeriodEnd ? 'scheduled' : 'immediate'
    })
  }

  static async pauseSubscription(subscriptionId: string): Promise<Subscription> {
    return await creem.subscriptions.pause(subscriptionId)
  }

  static async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    return await creem.subscriptions.resume(subscriptionId)
  }

  static async getCustomerBillingPortalUrl(customerId: string): Promise<string> {
    const response = await creem.customers.getBillingPortalUrl(customerId)
    return response.customer_portal_link
  }

  static validateWebhookSignature(payload: string, signature: string): boolean {
    const secret = process.env.CREEM_WEBHOOK_SECRET!
    return creem.webhooks.verify(payload, signature, secret)
  }
}

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price / 100) // Convert cents to dollars
}

export function formatBillingPeriod(period: string): string {
  const periods: { [key: string]: string } = {
    'every-month': 'Monthly',
    'every-three-months': 'Quarterly',
    'every-six-months': 'Semi-Annual',
    'every-year': 'Yearly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  }
  return periods[period] || period
}
