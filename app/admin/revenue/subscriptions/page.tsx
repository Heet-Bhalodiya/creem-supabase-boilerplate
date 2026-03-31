// Next Imports
import Link from 'next/link'

// Third-Party Imports
import { AlertCircleIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Utility Imports
import { createClient } from '@/lib/supabase/server'

const SubscriptionsPage = async () => {
  const supabase = await createClient()

  const { data: subscriptions } = await supabase
    .from('creem_subscriptions')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Subscriptions</h2>
        <p className='text-muted-foreground'>View and manage active subscriptions</p>
      </div>

      {subscriptions && subscriptions.length === 0 ? (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20'>
          <div className='flex items-start gap-3'>
            <AlertCircleIcon className='h-5 w-5 text-blue-600 dark:text-blue-500' />
            <div className='flex-1'>
              <h3 className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100'>No Subscriptions Yet</h3>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                Customer subscriptions will appear here once users subscribe to your plans. Create subscription plans in{' '}
                <Link href='/admin/products/plans' className='font-medium underline'>
                  Pricing Plans
                </Link>{' '}
                and ensure your{' '}
                <Link href='/admin/settings/creem' className='font-medium underline'>
                  Creem API
                </Link>{' '}
                is configured.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{subscriptions?.filter(s => s.status === 'active').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{subscriptions?.filter(s => s.status === 'cancelled').length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Past Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{subscriptions?.filter(s => s.status === 'past_due').length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>Complete list of customer subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Period</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions && subscriptions.length > 0 ? (
                subscriptions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>{(sub.profiles as { email?: string })?.email || 'Unknown'}</TableCell>
                    <TableCell className='font-medium'>{sub.plan_name || 'Unknown Plan'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sub.status === 'active' ? 'default' : sub.status === 'cancelled' ? 'secondary' : 'destructive'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm'>
                      {sub.current_period_start && sub.current_period_end
                        ? `${new Date(sub.current_period_start).toLocaleDateString()} - ${new Date(sub.current_period_end).toLocaleDateString()}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className='text-muted-foreground h-24 text-center'>
                    No subscriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubscriptionsPage
