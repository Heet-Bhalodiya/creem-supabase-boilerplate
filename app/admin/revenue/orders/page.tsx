// Next Imports
import Link from 'next/link'

// Third-party Imports
import { AlertCircleIcon } from 'lucide-react'

// Component Imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const OrdersPage = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Orders</h2>
        <p className='text-muted-foreground'>View and manage customer orders</p>
      </div>

      {/* Info Message */}
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20'>
        <div className='flex items-start gap-3'>
          <AlertCircleIcon className='h-5 w-5 text-blue-600 dark:text-blue-500' />
          <div className='flex-1'>
            <h3 className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100'>Orders Information</h3>
            <p className='text-sm text-blue-800 dark:text-blue-200'>
              One-time purchase orders will appear here once customers start buying your credit products or one-time
              plans. Configure your products in{' '}
              <Link href='/admin/credits/products' className='font-medium underline'>
                Credit Products
              </Link>{' '}
              and{' '}
              <Link href='/admin/products/plans' className='font-medium underline'>
                Pricing Plans
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest customer orders across all products</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className='text-muted-foreground h-24 text-center'>
                  No orders found
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrdersPage
