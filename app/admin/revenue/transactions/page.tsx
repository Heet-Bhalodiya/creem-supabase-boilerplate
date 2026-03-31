// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Utility Imports
import { createClient } from '@/lib/supabase/server'

const TransactionsPage = async () => {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from('creem_payments')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(100)

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const successfulPayments = payments?.filter(p => p.status === 'succeeded').length || 0

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Transactions</h2>
        <p className='text-muted-foreground'>View all payment transactions</p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Successful Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{successfulPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium'>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{payments?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments && payments.length > 0 ? (
                payments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className='font-mono text-xs'>{payment.creem_payment_id}</TableCell>
                    <TableCell>{(payment.profiles as { email?: string })?.email || 'Unknown'}</TableCell>
                    <TableCell className='font-medium'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: payment.currency.toUpperCase()
                      }).format(payment.amount || 0)}
                    </TableCell>
                    <TableCell className='uppercase'>{payment.currency}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'succeeded' ? 'default' : 'destructive'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground h-24 text-center'>
                    No transactions found
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

export default TransactionsPage
