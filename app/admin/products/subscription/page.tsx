// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Utility Imports
import { getPricingPlans } from '@/lib/actions/billing'

const SubscriptionProductsPage = async () => {
  const allPlans = await getPricingPlans()
  const subscriptionPlans = allPlans.filter(plan => plan.payment_type === 'subscription')

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Subscription Products</h2>
        <p className='text-muted-foreground'>Manage recurring subscription products</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Products</CardTitle>
          <CardDescription>Products available as recurring subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creem Product ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptionPlans.length > 0 ? (
                subscriptionPlans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className='font-medium'>{plan.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: plan.currency.toUpperCase()
                      }).format(plan.price)}
                    </TableCell>
                    <TableCell className='capitalize'>{plan.interval}</TableCell>
                    <TableCell>
                      <div className='text-muted-foreground text-sm'>
                        {((plan.features as string[]) || []).length} features
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className='font-mono text-xs'>{plan.creem_product_id || 'Not set'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className='text-muted-foreground h-24 text-center'>
                    No subscription products found. Create them in the Plans section.
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

export default SubscriptionProductsPage
