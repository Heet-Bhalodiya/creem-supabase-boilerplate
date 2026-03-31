// Next Imports
import { redirect } from 'next/navigation'
import Link from 'next/link'

// React Imports
import { Suspense } from 'react'

// Third-party Imports
import { Plus, Wallet, TrendingUp, Search, Filter, AlertCircle } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ManualCreditGrant } from '@/components/admin/manual-credit-grant'
import { CreditsAnalyticsCards } from '@/components/admin/credits-analytics-cards'
import { CreditWalletsTable } from '@/components/admin/credit-wallets-table'

// Utility Imports
import { createClient } from '@/lib/supabase/server'

async function getCreditsOverview() {
  const supabase = await createClient()

  // Get all credit wallets with user info
  const { data: wallets, error: walletsError } = await supabase
    .from('credits_wallets')
    .select(
      `
      *,
      profiles (
        id,
        email,
        full_name
      )
    `
    )
    .order('updated_at', { ascending: false })
    .limit(100)

  // Get recent credit transactions
  const { data: transactions, error: transError } = await supabase
    .from('credit_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get analytics data
  const { data: analytics } = await supabase.rpc('get_credits_analytics')

  if (walletsError || transError) {
    console.error('Error fetching credits data:', { walletsError, transError })
    return { wallets: [], transactions: [], analytics: null }
  }

  return {
    wallets: wallets || [],
    transactions: transactions || [],
    analytics
  }
}

async function CreditsContent() {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    redirect('/user')
  }

  const { wallets, transactions, analytics } = await getCreditsOverview()

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Credits Management</h1>
          <p className='text-muted-foreground'>Manage user credit wallets, grant credits, and monitor usage</p>
        </div>
        <ManualCreditGrant />
      </div>

      {/* Info Alert */}
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='h-5 w-5 text-blue-600 dark:text-blue-500' />
          <div className='flex-1'>
            <h3 className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100'>About Credits System</h3>
            <p className='text-sm text-blue-800 dark:text-blue-200'>
              Credits can be granted automatically through subscriptions and purchases, or manually using the
              &quot;Grant Credits&quot; button. View detailed analytics in{' '}
              <Link href='/admin/credits/analytics' className='font-medium underline'>
                Credits Analytics
              </Link>{' '}
              or manage purchasable credit packages in{' '}
              <Link href='/admin/credits/products' className='font-medium underline'>
                Credit Products
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <CreditsAnalyticsCards analytics={analytics} />

      {/* Main Content Grid */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Credit Wallets */}
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <Wallet className='h-5 w-5' />
                    Credit Wallets
                  </CardTitle>
                  <CardDescription>All user credit wallets and balances</CardDescription>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm'>
                    <Search className='mr-2 h-4 w-4' />
                    Search
                  </Button>
                  <Button variant='outline' size='sm'>
                    <Filter className='mr-2 h-4 w-4' />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CreditWalletsTable wallets={wallets} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest credit transactions</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {transactions.slice(0, 10).map(transaction => (
                <div key={transaction.id} className='flex items-center justify-between'>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>Transaction #{transaction.id.slice(0, 8)}</span>
                    <span className='text-muted-foreground text-xs'>
                      {transaction.description || 'Credit transaction'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant={transaction.type === 'earned' ? 'default' : 'secondary'}>
                      {transaction.type === 'earned' ? '+' : '-'}
                      {transaction.amount}
                    </Badge>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className='text-muted-foreground py-8 text-center'>No credit transactions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks for credit management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <Button variant='outline' className='h-auto flex-col p-6'>
              <Plus className='mb-2 h-8 w-8' />
              <span className='font-medium'>Create Credit Product</span>
              <span className='text-muted-foreground mt-1 text-center text-xs'>
                Create one-time credit packages for direct purchase
              </span>
            </Button>

            <Button variant='outline' className='h-auto flex-col p-6'>
              <Wallet className='mb-2 h-8 w-8' />
              <span className='font-medium'>Bulk Credit Grant</span>
              <span className='text-muted-foreground mt-1 text-center text-xs'>
                Grant credits to multiple users at once
              </span>
            </Button>

            <Button variant='outline' className='h-auto flex-col p-6'>
              <TrendingUp className='mb-2 h-8 w-8' />
              <span className='font-medium'>Analytics Report</span>
              <span className='text-muted-foreground mt-1 text-center text-xs'>
                Generate detailed credit usage reports
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CreditsSkeleton() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-10 w-32' />
      </div>

      <div className='grid gap-4 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-8 w-16' />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-4 w-64' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center justify-between'>
                    <Skeleton className='h-12 w-48' />
                    <Skeleton className='h-6 w-20' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-4 w-40' />
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className='flex items-center justify-between'>
                    <Skeleton className='h-8 w-32' />
                    <Skeleton className='h-6 w-16' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const AdminCreditsPage = () => {
  return (
    <div className='container max-w-7xl py-6'>
      <Suspense fallback={<CreditsSkeleton />}>
        <CreditsContent />
      </Suspense>
    </div>
  )
}

export default AdminCreditsPage
