import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, CreditCard, DollarSign, TrendingUp } from 'lucide-react'
import { getAdminBillingOverview } from '@/lib/actions/billing'
import { CreemAnalytics } from '@/components/admin/creem-analytics'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const analyticsData = await getAdminBillingOverview()

  // Get user count
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('full_name, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${analyticsData.totalRevenue.toLocaleString()}`,
      change: `${analyticsData.monthlyGrowth >= 0 ? '+' : ''}${analyticsData.monthlyGrowth.toFixed(1)}%`,
      icon: DollarSign,
      description: 'from last month',
      trend: analyticsData.monthlyGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: 'Total Users',
      value: totalUsers?.toLocaleString() || '0',
      change: '+15.3%',
      icon: Users,
      description: 'from last month',
      trend: 'up'
    },
    {
      title: 'Active Subscriptions',
      value: analyticsData.activeSubscriptions.toString(),
      change: `${analyticsData.monthlyGrowth >= 0 ? '+' : ''}${analyticsData.monthlyGrowth.toFixed(1)}%`,
      icon: CreditCard,
      description: 'from last month',
      trend: analyticsData.monthlyGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: 'Churn Rate',
      value: `${analyticsData.churnRate.toFixed(1)}%`,
      change: analyticsData.churnRate < 5 ? 'Healthy' : 'Monitor',
      icon: Activity,
      description: 'last 30 days',
      trend: analyticsData.churnRate < 5 ? 'up' : 'down'
    }
  ]

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>✨ AI Content Studio Admin</h2>
        <p className='text-muted-foreground'>Welcome back! Here&apos;s an overview of your content platform.</p>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <stat.icon className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                <TrendingUp className='h-3 w-3 text-green-500' />
                <span className='text-green-500'>{stat.change}</span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>Latest user registrations on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map(user => (
                <div key={user.email} className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='bg-muted flex h-10 w-10 items-center justify-center rounded-full'>
                      {user.full_name
                        ? user.full_name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{user.full_name || user.email}</p>
                      <p className='text-muted-foreground text-xs'>{user.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                    <p className='text-muted-foreground w-32 text-right text-xs'>
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-muted-foreground text-center text-sm'>No users yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <CreemAnalytics />
    </div>
  )
}
