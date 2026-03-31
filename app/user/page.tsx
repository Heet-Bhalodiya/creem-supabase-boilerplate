import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, CreditCard, Wallet, TrendingUp, Calendar, ArrowRight, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getUserDashboardData() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Get user profile
  const { data: profile } = await supabase.from('profiles').select('full_name, email, role').eq('id', user.id).single()

  // Get credits wallet
  const { data: wallet } = await supabase
    .from('credits_wallets')
    .select('balance, total_earned, total_spent')
    .eq('user_id', user.id)
    .single()

  // Get recent credit transactions (last 5)
  const { data: recentTransactions } = await supabase
    .from('credit_transactions')
    .select('type, amount, description, source, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(
      `
      status,
      current_period_end,
      cancel_at_period_end,
      prices!inner (
        interval,
        unit_amount,
        currency,
        products!inner (
          name
        )
      )
    `
    )
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  // Calculate this month's activity
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: monthTransactions } = await supabase
    .from('credit_transactions')
    .select('type, amount')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const creditsEarnedThisMonth =
    monthTransactions
      ?.filter(t => t.type === 'earned' || t.type === 'refunded')
      .reduce((sum, t) => sum + t.amount, 0) || 0

  const creditsSpentThisMonth =
    monthTransactions?.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0) || 0

  return {
    profile,
    wallet,
    recentTransactions: recentTransactions || [],
    subscription,
    creditsEarnedThisMonth,
    creditsSpentThisMonth
  }
}

export default async function DashboardPage() {
  const { profile, wallet, recentTransactions, subscription, creditsEarnedThisMonth, creditsSpentThisMonth } =
    await getUserDashboardData()

  // Access nested data correctly (prices is an array in the type system)
  const priceData = Array.isArray(subscription?.prices) ? subscription?.prices[0] : subscription?.prices
  const productData = priceData?.products
    ? Array.isArray(priceData.products)
      ? priceData.products[0]
      : priceData.products
    : null
  const subscriptionName = productData?.name || 'Free'
  const subscriptionStatus = subscription?.status || 'inactive'
  const creditsBalance = wallet?.balance || 0
  const totalCreditsEarned = wallet?.total_earned || 0
  const totalCreditsSpent = wallet?.total_spent || 0

  const stats = [
    {
      title: 'Credit Balance',
      value: creditsBalance.toLocaleString(),
      change: creditsEarnedThisMonth > 0 ? `+${creditsEarnedThisMonth}` : '0',
      icon: Wallet,
      description: 'credits earned this month',
      href: '/user/billing'
    },
    {
      title: 'Credits Used',
      value: totalCreditsSpent.toLocaleString(),
      change: creditsSpentThisMonth > 0 ? `-${creditsSpentThisMonth}` : '0',
      icon: Activity,
      description: 'spent this month',
      href: '/user/billing'
    },
    {
      title: 'Total Earned',
      value: totalCreditsEarned.toLocaleString(),
      change: 'All time',
      icon: TrendingUp,
      description: 'lifetime credits',
      href: '/user/billing'
    },
    {
      title: 'Subscription',
      value: subscriptionName,
      change: subscriptionStatus === 'active' ? 'Active' : 'Inactive',
      icon: CreditCard,
      description: subscription?.cancel_at_period_end ? 'Cancels at period end' : 'Current plan',
      href: '/#pricing'
    }
  ]

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
          <p className='text-muted-foreground'>
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}! Here&apos;s an overview of your account.
          </p>
        </div>
        {creditsBalance < 10 && (
          <Button asChild>
            <Link href='/#pricing'>
              <Sparkles className='mr-2 h-4 w-4' />
              Get Credits
            </Link>
          </Button>
        )}
      </div>

      {/* Low Balance Warning */}
      {creditsBalance < 10 && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/20'>
          <div className='flex items-start gap-3'>
            <Wallet className='h-5 w-5 text-yellow-600 dark:text-yellow-500' />
            <div className='flex-1'>
              <h3 className='mb-1 text-sm font-semibold text-yellow-900 dark:text-yellow-100'>Low Credit Balance</h3>
              <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                You have {creditsBalance} credits remaining. Consider purchasing more credits or upgrading your plan to
                continue using services.{' '}
                <Link href='/#pricing' className='font-medium underline'>
                  View Plans
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map(stat => (
          <Link key={stat.title} href={stat.href}>
            <Card className='transition-all hover:shadow-md'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
                <stat.icon className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
                <p className='text-muted-foreground text-xs'>
                  <span
                    className={
                      stat.change.startsWith('+')
                        ? 'text-green-600'
                        : stat.change.startsWith('-')
                          ? 'text-red-600'
                          : 'text-blue-600'
                    }
                  >
                    {stat.change}
                  </span>{' '}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <Card className='col-span-4'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest credit transactions</CardDescription>
              </div>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/user/billing'>
                  View All
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className='text-muted-foreground flex flex-col items-center justify-center py-8 text-center'>
                <Activity className='mb-2 h-8 w-8 opacity-50' />
                <p className='text-sm'>No activity yet</p>
                <p className='text-xs'>Your transactions will appear here</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {recentTransactions.map((transaction, index) => {
                  const isPositive = transaction.type === 'earned' || transaction.type === 'refunded'
                  const icon = isPositive ? TrendingUp : Activity
                  const Icon = icon

                  return (
                    <div key={index} className='flex items-center gap-4'>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950'}`}
                      >
                        <Icon
                          className={`h-4 w-4 ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}
                        />
                      </div>
                      <div className='flex-1 space-y-1'>
                        <p className='text-sm leading-none font-medium'>
                          {isPositive ? '+' : '-'}
                          {transaction.amount} credits
                        </p>
                        <p className='text-muted-foreground text-sm'>{transaction.description}</p>
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                        <Badge variant='outline' className='text-xs'>
                          {transaction.source}
                        </Badge>
                        <p className='text-muted-foreground text-xs'>
                          {new Date(transaction.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these actions</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Link
              href='/user/settings'
              className='hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-3 transition-colors'
            >
              <div className='flex-1'>
                <p className='text-sm font-medium'>Complete your profile</p>
                <p className='text-muted-foreground text-xs'>Update your account details</p>
              </div>
              <Badge variant='secondary'>Settings</Badge>
            </Link>
            {subscriptionStatus !== 'active' && (
              <Link
                href='/#pricing'
                className='hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-3 transition-colors'
              >
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Upgrade to Pro</p>
                  <p className='text-muted-foreground text-xs'>Get unlimited features</p>
                </div>
                <Badge variant='secondary'>Pro</Badge>
              </Link>
            )}
            <Link
              href='/user/billing'
              className='hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-3 transition-colors'
            >
              <div className='flex-1'>
                <p className='text-sm font-medium'>Manage Credits</p>
                <p className='text-muted-foreground text-xs'>View balance & transactions</p>
              </div>
              <Badge variant='outline'>{creditsBalance}</Badge>
            </Link>
            {subscription && (
              <Link
                href='/user/billing'
                className='hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-3 transition-colors'
              >
                <div className='flex-1'>
                  <p className='text-sm font-medium'>Billing & Subscription</p>
                  <p className='text-muted-foreground text-xs'>
                    {subscription.cancel_at_period_end ? 'Renews ' : 'Next payment '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <Calendar className='text-muted-foreground h-4 w-4' />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
