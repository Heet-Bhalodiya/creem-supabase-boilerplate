// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { TrendingUp, Users, Wallet, Activity } from 'lucide-react'

// Component Imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility Imports
import { createClient } from '@/lib/supabase/server'

async function getCreditsAnalytics() {
  const supabase = await createClient()

  // Get analytics data
  const { data: analytics } = await supabase.rpc('get_credits_analytics')

  return analytics
}

async function CreditsAnalyticsContent() {
  const analytics = await getCreditsAnalytics()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Credits Analytics</h1>
        <p className='text-muted-foreground'>Track credit usage, distributions, and user engagement</p>
      </div>

      {/* Stats Overview */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription>Total Credits Distributed</CardDescription>
            <CardTitle className='text-2xl'>{analytics?.total_credits_granted?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex items-center text-sm'>
              <TrendingUp className='mr-1 h-4 w-4 text-green-600' />
              All time
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription>Total Credits Used</CardDescription>
            <CardTitle className='text-2xl'>{analytics?.total_credits_spent?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex items-center text-sm'>
              <Activity className='mr-1 h-4 w-4 text-blue-600' />
              All time
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription>Active Wallets</CardDescription>
            <CardTitle className='text-2xl'>{analytics?.total_wallets?.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex items-center text-sm'>
              <Wallet className='mr-1 h-4 w-4 text-purple-600' />
              Users with credits
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription>Average Balance</CardDescription>
            <CardTitle className='text-2xl'>
              {analytics?.average_balance ? Math.round(analytics.average_balance).toLocaleString() : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-muted-foreground flex items-center text-sm'>
              <Users className='mr-1 h-4 w-4 text-orange-600' />
              Per user
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='border-0 shadow-sm'>
          <CardHeader>
            <CardTitle>Credit Distribution</CardTitle>
            <CardDescription>How credits are being earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-green-500' />
                  <span className='text-sm'>Total Earned</span>
                </div>
                <span className='font-medium'>{analytics?.total_credits_granted?.toLocaleString() || 0}</span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-red-500' />
                  <span className='text-sm'>Total Spent</span>
                </div>
                <span className='font-medium'>{analytics?.total_credits_spent?.toLocaleString() || 0}</span>
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 rounded-full bg-blue-500' />
                  <span className='text-sm'>Current Balance</span>
                </div>
                <span className='font-medium'>
                  {((analytics?.total_credits_granted || 0) - (analytics?.total_credits_spent || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader>
            <CardTitle>Usage Metrics</CardTitle>
            <CardDescription>Credit consumption patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Usage Rate</span>
                <span className='font-medium'>
                  {analytics?.total_credits_granted && analytics.total_credits_spent
                    ? Math.round((analytics.total_credits_spent / analytics.total_credits_granted) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Average per Wallet</span>
                <span className='font-medium'>
                  {analytics?.average_balance ? Math.round(analytics.average_balance).toLocaleString() : 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Total Wallets</span>
                <span className='font-medium'>{analytics?.total_wallets?.toLocaleString() || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const AdminCreditsAnalyticsPage = async () => {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    redirect('/admin')
  }

  return (
    <div className='container max-w-6xl py-6'>
      <CreditsAnalyticsContent />
    </div>
  )
}

export default AdminCreditsAnalyticsPage
