'use client'

import { useState, useEffect } from 'react'
import { getUserPayments, getUserPaymentStats } from '@/lib/actions/payments'
import { getUserSubscription } from '@/lib/actions/billing'
import { DataTable } from '@/components/ui/data-table'
import { paymentColumns } from '@/components/user/payment-columns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DollarSign, Receipt, CheckCircle2, XCircle, CreditCard } from 'lucide-react'
import { SubscriptionManager } from '@/components/subscription-manager'
import { UpgradePlans } from '@/components/upgrade-plans'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { toast } from '@/lib/toast'
import { useSearchParams } from 'next/navigation'

type PricingPlan = {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  interval: string
  creem_product_id: string
  credits_per_cycle?: number
  grants_credits?: boolean
  is_active: boolean
  features?: string[]
}

export default function UserBillingPage() {
  const searchParams = useSearchParams()
  const showUpgradeSuccess = searchParams.get('upgraded') === 'true'

  const [payments, setPayments] = useState<Awaited<ReturnType<typeof getUserPayments>>>([])
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getUserPaymentStats>> | null>(null)
  const [subscription, setSubscription] = useState<Awaited<ReturnType<typeof getUserSubscription>>>({
    success: false,
    subscription: null,
    error: null
  })
  const [availablePlans, setAvailablePlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [paymentsData, statsData, subscriptionData, plansData] = await Promise.all([
        getUserPayments(),
        getUserPaymentStats(),
        getUserSubscription(),
        fetch('/api/pricing-plans')
          .then(r => r.json())
          .catch(() => [])
      ])

      setPayments(paymentsData)
      setStats(statsData)
      setSubscription(subscriptionData)
      setAvailablePlans(plansData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast('error', 'Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading || !stats) {
    return (
      <div className='container max-w-6xl py-6'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Billing & Payments</h1>
          <p className='text-muted-foreground'>Manage your subscription, billing information, and payment history.</p>
        </div>
        <BillingSkeleton />
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Spent',
      value: `$${stats.totalPaid.toFixed(2)}`,
      description: 'Lifetime payment total',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      description: 'All time transactions',
      icon: Receipt,
      color: 'text-purple-600'
    },
    {
      title: 'Successful',
      value: stats.successfulPayments,
      description: 'Completed payments',
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      title: 'Failed',
      value: stats.failedPayments,
      description: 'Unsuccessful attempts',
      icon: XCircle,
      color: 'text-red-600'
    }
  ]

  return (
    <div className='container max-w-6xl py-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Billing & Payments</h1>
        <p className='text-muted-foreground'>Manage your subscription, billing information, and payment history.</p>
      </div>

      {showUpgradeSuccess && (
        <Alert className='mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'>
          <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
          <AlertDescription className='text-green-800 dark:text-green-200'>
            Successfully upgraded your subscription! Your new plan is now active.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className='mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {statsCards.map(stat => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-muted-foreground text-xs'>{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for Subscription and Payment History */}
      <Tabs defaultValue='subscription' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='subscription'>Subscription</TabsTrigger>
          <TabsTrigger value='payments'>Payment History</TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value='subscription' className='space-y-6'>
          {!subscription.success || !subscription.subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground mb-4'>
                  You don&apos;t have an active subscription. Choose a plan to get started.
                </p>
                <Button asChild>
                  <Link href='/#pricing'>
                    <CreditCard className='mr-2 h-4 w-4' />
                    View Plans
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <SubscriptionManager subscription={subscription.subscription} availablePlans={availablePlans} />
              <UpgradePlans subscription={subscription.subscription} availablePlans={availablePlans} />
            </>
          )}
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value='payments' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent credit transactions and activity</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Receipt className='text-muted-foreground mb-4 h-12 w-12' />
                  <h3 className='mb-2 text-lg font-semibold'>No payments yet</h3>
                  <p className='text-muted-foreground text-center'>
                    Your payment history will appear here once you make your first purchase.
                  </p>
                </div>
              ) : (
                <DataTable columns={paymentColumns} data={payments} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BillingSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Stats Skeleton */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='mb-1 h-8 w-20' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-64' />
            </div>
            <Skeleton className='h-6 w-16' />
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-5 w-32' />
              <Skeleton className='h-4 w-48' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-5 w-24' />
              </div>
              <div className='space-y-1'>
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-5 w-20' />
              </div>
            </div>
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-24' />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
