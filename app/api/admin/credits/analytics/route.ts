import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient()

    // Check if current user is admin
    const {
      data: { user: currentUser },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin permissions
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Try to use RPC function first, fallback to manual queries
    let analytics

    try {
      // First try the RPC function (if it exists)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_credits_analytics')

      if (!rpcError && rpcData) {
        analytics = rpcData
      } else {
        throw new Error('RPC function not available, using fallback queries')
      }
    } catch {
      // Manual analytics calculation as fallback
      const [walletsResult, transactionsResult] = await Promise.all([
        // Wallets analytics
        supabase
          .from('credits_wallets')
          .select('current_balance, lifetime_earned, lifetime_spent, last_activity, created_at'),

        // Recent transactions
        supabase
          .from('credit_transactions')
          .select('amount, transaction_type, created_at')
          .order('created_at', { ascending: false })
          .limit(1000)
      ])

      if (walletsResult.error || transactionsResult.error) {
        throw new Error('Failed to fetch analytics data')
      }

      const wallets = walletsResult.data || []
      const transactions = transactionsResult.data || []

      // Calculate analytics
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const todayTransactions = transactions.filter(
        (
          t: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ) => new Date(t.created_at) >= todayStart
      )

      const monthTransactions = transactions.filter(
        (
          t: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ) => new Date(t.created_at) >= monthStart
      )

      const creditsGrantedToday = todayTransactions
        .filter((t: any) => ['earned', 'refunded'].includes(t.transaction_type)) // eslint-disable-line @typescript-eslint/no-explicit-any
        .reduce((sum: number, t: any) => sum + t.amount, 0) // eslint-disable-line @typescript-eslint/no-explicit-any

      const creditsSpentToday = todayTransactions
        .filter((t: any) => t.transaction_type === 'spent') // eslint-disable-line @typescript-eslint/no-explicit-any
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) // eslint-disable-line @typescript-eslint/no-explicit-any

      const creditsGrantedThisMonth = monthTransactions
        .filter((t: any) => ['earned', 'refunded'].includes(t.transaction_type)) // eslint-disable-line @typescript-eslint/no-explicit-any
        .reduce((sum: number, t: any) => sum + t.amount, 0) // eslint-disable-line @typescript-eslint/no-explicit-any

      const creditsSpentThisMonth = monthTransactions
        .filter((t: any) => t.transaction_type === 'spent') // eslint-disable-line @typescript-eslint/no-explicit-any
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) // eslint-disable-line @typescript-eslint/no-explicit-any

      const recentActivityCount = transactions.filter(
        (
          t: any // eslint-disable-line @typescript-eslint/no-explicit-any
        ) => new Date(t.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length

      analytics = {
        total_wallets: wallets.length,
        active_wallets: wallets.filter((w: any) => w.current_balance > 0).length, // eslint-disable-line @typescript-eslint/no-explicit-any
        total_credits_distributed: wallets.reduce((sum: number, w: any) => sum + w.lifetime_earned, 0), // eslint-disable-line @typescript-eslint/no-explicit-any
        total_credits_spent: wallets.reduce((sum: number, w: any) => sum + w.lifetime_spent, 0), // eslint-disable-line @typescript-eslint/no-explicit-any
        total_credits_outstanding: wallets.reduce((sum: number, w: any) => sum + w.current_balance, 0), // eslint-disable-line @typescript-eslint/no-explicit-any
        avg_balance_per_user:
          wallets.length > 0
            ? wallets.reduce((sum: number, w: any) => sum + w.current_balance, 0) / wallets.length // eslint-disable-line @typescript-eslint/no-explicit-any
            : 0,
        credits_granted_today: creditsGrantedToday,
        credits_spent_today: creditsSpentToday,
        credits_granted_this_month: creditsGrantedThisMonth,
        credits_spent_this_month: creditsSpentThisMonth,
        top_spenders_count: wallets.filter((w: any) => w.lifetime_spent > 1000).length, // eslint-disable-line @typescript-eslint/no-explicit-any
        zero_balance_wallets: wallets.filter((w: any) => w.current_balance === 0).length, // eslint-disable-line @typescript-eslint/no-explicit-any
        high_balance_wallets: wallets.filter((w: any) => w.current_balance >= 1000).length, // eslint-disable-line @typescript-eslint/no-explicit-any
        recent_activity_count: recentActivityCount
      }
    }

    return NextResponse.json({
      success: true,
      analytics,
      calculated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Credits analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error while calculating analytics' }, { status: 500 })
  }
}
