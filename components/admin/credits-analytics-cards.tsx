'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, TrendingDown, Users, DollarSign, Activity, Calendar, Target } from 'lucide-react'

type CreditsAnalytics = {
  total_wallets: number
  active_wallets: number
  total_credits_distributed: number
  total_credits_spent: number
  total_credits_outstanding: number
  avg_balance_per_user: number
  credits_granted_today: number
  credits_spent_today: number
  credits_granted_this_month: number
  credits_spent_this_month: number
  top_spenders_count: number
  zero_balance_wallets: number
  high_balance_wallets: number
  recent_activity_count: number
}

type CreditsAnalyticsCardsProps = {
  analytics?: CreditsAnalytics
  isLoading?: boolean
}

export function CreditsAnalyticsCards({ analytics: initialAnalytics, isLoading = false }: CreditsAnalyticsCardsProps) {
  const [analytics, setAnalytics] = useState<CreditsAnalytics | null>(initialAnalytics || null)
  const [loading, setLoading] = useState(isLoading)

  // Fetch analytics if not provided via props
  useEffect(() => {
    if (!initialAnalytics && !isLoading) {
      fetchAnalytics()
    }
  }, [initialAnalytics, isLoading])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/credits/analytics')
      if (!response.ok) throw new Error('Failed to fetch analytics')

      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Set default/empty analytics on error
      setAnalytics({
        total_wallets: 0,
        active_wallets: 0,
        total_credits_distributed: 0,
        total_credits_spent: 0,
        total_credits_outstanding: 0,
        avg_balance_per_user: 0,
        credits_granted_today: 0,
        credits_spent_today: 0,
        credits_granted_this_month: 0,
        credits_spent_this_month: 0,
        top_spenders_count: 0,
        zero_balance_wallets: 0,
        high_balance_wallets: 0,
        recent_activity_count: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  if (loading || !analytics) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 w-20 animate-pulse rounded bg-gray-200'></div>
              <div className='h-4 w-4 animate-pulse rounded bg-gray-200'></div>
            </CardHeader>
            <CardContent>
              <div className='mb-1 h-8 animate-pulse rounded bg-gray-200'></div>
              <div className='h-3 w-16 animate-pulse rounded bg-gray-200'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalCreditFlow = analytics.total_credits_distributed - analytics.total_credits_spent
  const todayActivity = analytics.credits_granted_today + analytics.credits_spent_today
  const activationRate = analytics.total_wallets > 0 ? (analytics.active_wallets / analytics.total_wallets) * 100 : 0

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Total Wallets */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Wallets</CardTitle>
          <Wallet className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatNumber(analytics.total_wallets)}</div>
          <p className='text-muted-foreground text-xs'>
            {analytics.active_wallets} active ({activationRate.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>

      {/* Total Credits Outstanding */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Credits Outstanding</CardTitle>
          <DollarSign className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatNumber(analytics.total_credits_outstanding)}</div>
          <p className='text-muted-foreground text-xs'>${formatNumber(analytics.avg_balance_per_user)} avg per user</p>
        </CardContent>
      </Card>

      {/* Credits Distributed */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Credits Distributed</CardTitle>
          <TrendingUp className='h-4 w-4 text-green-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>+{formatNumber(analytics.total_credits_distributed)}</div>
          <p className='text-muted-foreground text-xs'>
            +{formatNumber(analytics.credits_granted_this_month)} this month
          </p>
        </CardContent>
      </Card>

      {/* Credits Spent */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Credits Spent</CardTitle>
          <TrendingDown className='h-4 w-4 text-red-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-red-600'>-{formatNumber(analytics.total_credits_spent)}</div>
          <p className='text-muted-foreground text-xs'>
            -{formatNumber(analytics.credits_spent_this_month)} this month
          </p>
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Today&apos;s Activity</CardTitle>
          <Activity className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatNumber(todayActivity)}</div>
          <div className='flex gap-2 text-xs'>
            <span className='text-green-600'>+{formatNumber(analytics.credits_granted_today)}</span>
            <span className='text-red-600'>-{formatNumber(analytics.credits_spent_today)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Net Credit Flow */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Net Credit Flow</CardTitle>
          <Target className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalCreditFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalCreditFlow >= 0 ? '+' : ''}
            {formatNumber(totalCreditFlow)}
          </div>
          <p className='text-muted-foreground text-xs'>All-time net flow</p>
        </CardContent>
      </Card>

      {/* High Balance Users */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>High Balance Users</CardTitle>
          <Users className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{analytics.high_balance_wallets}</div>
          <p className='text-muted-foreground text-xs'>1,000+ credits each</p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Recent Activity</CardTitle>
          <Calendar className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{analytics.recent_activity_count}</div>
          <p className='text-muted-foreground text-xs'>{analytics.zero_balance_wallets} with zero balance</p>
        </CardContent>
      </Card>
    </div>
  )
}
