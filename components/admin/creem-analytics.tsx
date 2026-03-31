'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// Third-Party Imports
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Loader2, RefreshCw } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart'

// Utility Imports
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

type AnalyticsData = {
  totalRevenue: number
  monthlyRevenue: number
  activeSubscriptions: number
  totalCustomers: number
  churnRate: number
  averageRevenuePerUser: number
  conversionRate: number
  monthlyGrowth: number
}

type RevenueData = {
  month: string
  revenue: number
  subscriptions: number
}

export function CreemAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6')

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Get subscription + payment data for analytics.
      const [{ data: subscriptions, error: subscriptionsError }, { data: payments, error: paymentsError }] =
        await Promise.all([
          supabase.from('creem_subscriptions').select('*'),
          supabase.from('creem_payments').select('*')
        ])

      if (subscriptionsError || paymentsError) {
        console.error('Error loading analytics:', subscriptionsError || paymentsError)
        toast('error', 'Failed to load analytics data')
        return
      }

      const safeSubscriptions = subscriptions || []
      const safePayments = (payments || []).filter(p => p.status === 'succeeded' || p.status === 'paid')

      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      const activeSubscriptions = safeSubscriptions.filter(s => s.status === 'active')
      const totalCustomers = new Set(safeSubscriptions.map(s => s.user_id).filter(Boolean)).size

      const totalRevenue = safePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
      const monthlyRevenue = safePayments
        .filter(p => new Date(p.created_at) >= currentMonth)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      const previousMonthRevenue = safePayments
        .filter(p => new Date(p.created_at) >= previousMonth && new Date(p.created_at) < currentMonth)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)

      const monthlyGrowth =
        previousMonthRevenue > 0 ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0

      const canceledThisMonth = safeSubscriptions.filter(
        s => s.canceled_at && new Date(s.canceled_at) >= currentMonth
      ).length
      const churnRate =
        activeSubscriptions.length + canceledThisMonth > 0
          ? (canceledThisMonth / (activeSubscriptions.length + canceledThisMonth)) * 100
          : 0

      const arpu = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
      const conversionRate = totalCustomers > 0 ? (activeSubscriptions.length / totalCustomers) * 100 : 0

      const monthMap = new Map<string, { revenue: number; subscriptions: number; date: Date }>()

      // Get the last N months of data based on timeRange
      const monthsToShow = Number(timeRange)
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - monthsToShow)

      // Initialize all months in range with zero values
      for (let i = 0; i < monthsToShow; i++) {
        const date = new Date()
        date.setMonth(date.getMonth() - (monthsToShow - 1 - i))
        const monthKey = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
        monthMap.set(monthKey, {
          revenue: 0,
          subscriptions: 0,
          date
        })
      }

      // Add payment data
      safePayments.forEach(payment => {
        const date = new Date(payment.created_at)
        if (date >= startDate) {
          const monthKey = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
          const existing = monthMap.get(monthKey)
          if (existing) {
            existing.revenue += Number(payment.amount || 0)
          }
        }
      })

      // Add subscription data
      safeSubscriptions.forEach(subscription => {
        const date = new Date(subscription.created_at)
        if (date >= startDate) {
          const monthKey = date.toLocaleString('en-US', { month: 'short', year: '2-digit' })
          const existing = monthMap.get(monthKey)
          if (existing) {
            existing.subscriptions += 1
          }
        }
      })

      const realRevenueData: RevenueData[] = Array.from(monthMap.entries())
        .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
        .map(([month, value]) => ({
          month,
          revenue: value.revenue / 100, // Convert cents to dollars
          subscriptions: value.subscriptions
        }))

      const calculatedAnalytics: AnalyticsData = {
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions: activeSubscriptions.length,
        totalCustomers,
        churnRate,
        averageRevenuePerUser: arpu,
        conversionRate,
        monthlyGrowth
      }

      setAnalytics(calculatedAnalytics)
      setRevenueData(realRevenueData)
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast('error', 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground'>Failed to load analytics data</p>
        <Button onClick={loadAnalytics} variant='outline' className='mt-4'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Time Range Selector */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Revenue Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className='w-48'>
            <Calendar className='mr-2 h-4 w-4' />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1'>Last 1 month</SelectItem>
            <SelectItem value='3'>Last 3 months</SelectItem>
            <SelectItem value='6'>Last 6 months</SelectItem>
            <SelectItem value='12'>Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(analytics.totalRevenue)}</div>
            <p className='text-muted-foreground text-xs'>
              <span className='text-green-600'>{formatPercentage(analytics.monthlyGrowth)}</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Monthly Revenue</CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(analytics.monthlyRevenue)}</div>
            <p className='text-muted-foreground text-xs'>Current month recurring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Subscriptions</CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{analytics.activeSubscriptions}</div>
            <p className='text-muted-foreground text-xs'>{analytics.totalCustomers} total customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Churn Rate</CardTitle>
            <TrendingDown className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{analytics.churnRate}%</div>
            <p className='text-muted-foreground text-xs'>Monthly subscriber churn</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>ARPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(analytics.averageRevenuePerUser)}</div>
            <p className='text-muted-foreground text-xs'>Average Revenue Per User</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{analytics.conversionRate}%</div>
            <p className='text-muted-foreground text-xs'>Visitor to subscriber rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{formatPercentage(analytics.monthlyGrowth)}</div>
            <p className='text-muted-foreground text-xs'>Month-over-month growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            Revenue Trend
          </CardTitle>
          <CardDescription>Revenue and subscriptions over the last {timeRange} months</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: 'Revenue',
                color: 'hsl(var(--chart-1))'
              },
              subscriptions: {
                label: 'Subscriptions',
                color: 'hsl(var(--chart-2))'
              }
            }}
            className='h-[400px] w-full'
          >
            <BarChart data={revenueData} barGap={8} barCategoryGap='20%'>
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis dataKey='month' className='text-xs' />
              <YAxis yAxisId='left' className='text-xs' />
              <YAxis yAxisId='right' orientation='right' className='text-xs' />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                yAxisId='left'
                dataKey='revenue'
                fill='var(--color-revenue)'
                radius={[4, 4, 0, 0]}
                name='Revenue ($)'
                maxBarSize={60}
              />
              <Bar
                yAxisId='right'
                dataKey='subscriptions'
                fill='var(--color-subscriptions)'
                radius={[4, 4, 0, 0]}
                name='Subscriptions'
                maxBarSize={60}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Revenue Growth
          </CardTitle>
          <CardDescription>Cumulative revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: 'Revenue',
                color: 'hsl(var(--chart-1))'
              }
            }}
            className='h-[300px] w-full'
          >
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
              <XAxis dataKey='month' className='text-xs' />
              <YAxis className='text-xs' />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type='monotone'
                dataKey='revenue'
                stroke='var(--color-revenue)'
                fill='var(--color-revenue)'
                fillOpacity={0.2}
                strokeWidth={2}
                name='Revenue ($)'
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
