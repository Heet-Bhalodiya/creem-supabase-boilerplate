// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Utility Imports
import { getPricingPlans } from '@/lib/actions/billing'

const OneTimeProductsPage = async () => {
  const allPlans = await getPricingPlans()
  const oneTimePlans = allPlans.filter(plan => plan.payment_type === 'one_time')

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>One-time Purchase Products</h2>
        <p className='text-muted-foreground'>Manage products with single payment</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>One-time Products</CardTitle>
          <CardDescription>Products available for one-time purchase</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Creem Product ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oneTimePlans.length > 0 ? (
                oneTimePlans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className='font-medium'>{plan.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: plan.currency.toUpperCase()
                      }).format(plan.price)}
                    </TableCell>
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
                  <TableCell colSpan={5} className='text-muted-foreground h-24 text-center'>
                    No one-time products found. Create them in the Plans section.
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

export default OneTimeProductsPage
