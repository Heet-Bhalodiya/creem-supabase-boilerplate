'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CreditTransaction = {
  id: string
  wallet_id: string
  user_id: string
  type: 'earned' | 'spent' | 'refunded' | 'expired'
  amount: number
  balance_after: number
  description: string
  source: 'subscription' | 'purchase' | 'bonus' | 'refund' | 'usage' | 'expiration'
  reference_id?: string
  metadata: Record<string, unknown>
  created_at: string
}

export type CreditWallet = {
  id: string
  user_id: string
  balance: number
  total_earned: number
  total_spent: number
  created_at: string
  updated_at: string
}

// Get user's credit wallet
export async function getCreditWallet() {
  try {
    const supabase = await createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized', data: null }
    }

    const { data: wallet, error } = await supabase.from('credits_wallets').select('*').eq('user_id', user.id).single()

    if (error && error.code === 'PGRST116') {
      // Wallet doesn't exist, create one
      const { data: newWallet, error: createError } = await supabase
        .from('credits_wallets')
        .insert({
          user_id: user.id,
          balance: 0,
          total_earned: 0,
          total_spent: 0
        })
        .select()
        .single()

      if (createError) {
        return { success: false, error: `Failed to create wallet: ${createError.message}`, data: null }
      }

      return { success: true, data: newWallet as CreditWallet }
    }

    if (error) {
      return { success: false, error: `Failed to fetch wallet: ${error.message}`, data: null }
    }

    return { success: true, data: wallet as CreditWallet }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error', data: null }
  }
}

// Get credit transaction history
export async function getCreditTransactions(limit: number = 50, offset: number = 0) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: transactions, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return { success: true, data: transactions as CreditTransaction[] }
}

// Add credits to user (admin only or system)
export async function addCredits(params: {
  userId: string
  amount: number
  description: string
  source: 'subscription' | 'purchase' | 'bonus' | 'refund'
  referenceId?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if user is admin (for manual credit grants)
  if (params.source !== 'subscription') {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      throw new Error('Only admins can manually grant credits')
    }
  }

  try {
    // Call the database function to update credits atomically
    const { data, error } = await supabase.rpc('update_credits_balance', {
      p_user_id: params.userId,
      p_amount: params.amount,
      p_type: 'earned',
      p_description: params.description,
      p_source: params.source,
      p_reference_id: params.referenceId || null,
      p_metadata: params.metadata || {}
    })

    if (error) {
      console.error('Database function error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/user/billing')
    revalidatePath('/user/credits')
    revalidatePath('/admin/analytics')

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Add credits error:', error)
    return { success: false, error: 'Failed to add credits' }
  }
}

// Spend credits (usage-based actions)
export async function spendCredits(params: {
  amount: number
  description: string
  source: 'usage'
  referenceId?: string // Action ID, generation ID, etc.
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  try {
    // Call the database function to spend credits atomically
    const { data, error } = await supabase.rpc('update_credits_balance', {
      p_user_id: user.id,
      p_amount: params.amount,
      p_type: 'spent',
      p_description: params.description,
      p_source: params.source,
      p_reference_id: params.referenceId || null,
      p_metadata: params.metadata || {}
    })

    if (error) {
      console.error('Database function error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/user/billing')
    revalidatePath('/user/credits')

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Spend credits error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to spend credits'
    return { success: false, error: errorMessage }
  }
}

// Check if user has sufficient credits
export async function hasCredits(amount: number) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return { success: false, hasCredits: false, balance: 0 }

  const { data: wallet } = await supabase.from('credits_wallets').select('balance').eq('user_id', user.id).single()

  const balance = wallet?.balance || 0
  return {
    success: true,
    hasCredits: balance >= amount,
    balance
  }
}

// Get all credit wallets (admin only)
export async function getAllCreditWallets(limit: number = 50, offset: number = 0) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    throw new Error('Admin access required')
  }

  const { data: wallets, error } = await supabase
    .from('credits_wallets')
    .select(
      `
      *,
      profiles!credits_wallets_user_id_fkey (
        email,
        role
      )
    `
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch wallets: ${error.message}`)
  }

  return { success: true, data: wallets }
}

// Get credit statistics (admin only)
export async function getCreditStats() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    throw new Error('Admin access required')
  }

  // Get aggregated stats
  const { data: stats, error } = await supabase.from('credits_wallets').select('balance, total_earned, total_spent')

  if (error) {
    throw new Error(`Failed to fetch stats: ${error.message}`)
  }

  const totals = stats.reduce(
    (acc, wallet) => ({
      totalBalance: acc.totalBalance + wallet.balance,
      totalEarned: acc.totalEarned + wallet.total_earned,
      totalSpent: acc.totalSpent + wallet.total_spent,
      walletCount: acc.walletCount + 1
    }),
    { totalBalance: 0, totalEarned: 0, totalSpent: 0, walletCount: 0 }
  )

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from('credit_transactions')
    .select(
      `
      *,
      profiles!credit_transactions_user_id_fkey (email)
    `
    )
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    success: true,
    data: {
      ...totals,
      recentTransactions: recentTransactions || []
    }
  }
}
