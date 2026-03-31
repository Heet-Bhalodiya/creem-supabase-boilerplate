'use server'

import { createClient } from '@/lib/supabase/server'

export type UserPayment = {
  id: string
  amount: number
  currency: string
  status: string
  creem_product_id: string | null
  creem_customer_id: string | null
  checkout_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export async function getUserPayments(): Promise<UserPayment[]> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('[PAYMENTS] Auth error:', authError)
    return []
  }

  const { data: payments, error } = await supabase
    .from('creem_payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[PAYMENTS] Database error:', error)
    return []
  }

  return (payments || []) as UserPayment[]
}

export async function getPaymentDetails(paymentId: string): Promise<UserPayment | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('[PAYMENT DETAILS] Auth error:', authError)
    return null
  }

  const { data: payment, error } = await supabase
    .from('creem_payments')
    .select('*')
    .eq('id', paymentId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('[PAYMENT DETAILS] Database error:', error)
    return null
  }

  return payment as UserPayment
}

export async function getUserPaymentStats(): Promise<{
  totalPaid: number
  totalPayments: number
  successfulPayments: number
  failedPayments: number
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('[PAYMENT STATS] Auth error:', authError)
    return {
      totalPaid: 0,
      totalPayments: 0,
      successfulPayments: 0,
      failedPayments: 0
    }
  }

  const { data: payments, error } = await supabase
    .from('creem_payments')
    .select('amount, status, currency')
    .eq('user_id', user.id)

  if (error || !payments) {
    console.error('[PAYMENT STATS] Error fetching payments:', error)
    return {
      totalPaid: 0,
      totalPayments: 0,
      successfulPayments: 0,
      failedPayments: 0
    }
  }

  const successfulPayments = payments.filter(p => p.status === 'succeeded' || p.status === 'paid')
  const failedPayments = payments.filter(p => p.status === 'failed')
  const totalPaid = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  const stats = {
    totalPaid,
    totalPayments: payments.length,
    successfulPayments: successfulPayments.length,
    failedPayments: failedPayments.length
  }

  return stats
}
