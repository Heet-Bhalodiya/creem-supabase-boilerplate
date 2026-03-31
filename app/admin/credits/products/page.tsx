// Next Imports
import { redirect } from 'next/navigation'

// React Imports
import { Suspense } from 'react'

// Third-party Imports
import { Package, CreditCard } from 'lucide-react'

// Component Imports
import { CreditProductsTable } from '@/components/admin/credit-products-table'
import { CreateCreditProductForm } from '@/components/admin/create-credit-product-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility Imports
import { createClient } from '@/lib/supabase/server'

async function getCreditProducts() {
  const supabase = await createClient()

  // Get all credit products (one-time purchases that grant credits)
  const { data: products, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('payment_type', 'one_time')
    .eq('grants_credits', true)
    .order('price')

  if (error) {
    console.error('Error fetching credit products:', error)
    return []
  }

  return products || []
}

async function CreditProductsContent() {
  const products = await getCreditProducts()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight'>Credit Products</h1>
          <p className='text-muted-foreground'>Manage one-time credit packages that users can purchase</p>
        </div>
        <CreateCreditProductForm />
      </div>

      {/* Info Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='border-0 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <Package className='text-muted-foreground h-4 w-4' />
              <p className='text-muted-foreground text-sm font-medium'>Total Products</p>
            </div>
            <p className='mt-2 text-2xl font-bold'>{products.length}</p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <CreditCard className='h-4 w-4 text-green-600' />
              <p className='text-muted-foreground text-sm font-medium'>Active Products</p>
            </div>
            <p className='mt-2 text-2xl font-bold text-green-600'>{products.filter(p => p.is_active).length}</p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-center space-x-2'>
              <Package className='h-4 w-4 text-blue-600' />
              <p className='text-muted-foreground text-sm font-medium'>Total Credits Available</p>
            </div>
            <p className='mt-2 text-2xl font-bold text-blue-600'>
              {products.reduce((sum, p) => sum + (p.is_active ? p.credits_per_cycle || 0 : 0), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className='border-0 shadow-sm'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Package className='text-muted-foreground h-5 w-5' />
              <CardTitle className='text-lg'>All Credit Products</CardTitle>
            </div>
            {products.length > 0 && (
              <p className='text-muted-foreground text-sm'>
                {products.length} product{products.length !== 1 ? 's' : ''} total
              </p>
            )}
          </div>
          <CardDescription>
            One-time purchasable credit packages that appear on your pricing page alongside subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <CreditProductsTable products={products} />
          ) : (
            <div className='py-16 text-center'>
              <div className='bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Package className='text-muted-foreground h-8 w-8' />
              </div>
              <h3 className='mb-2 text-lg font-semibold'>No Credit Products Yet</h3>
              <p className='text-muted-foreground mx-auto mb-6 max-w-md'>
                Create your first credit package that users can purchase to get started with credit monetization.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card className='border-0 shadow-sm'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg'>Credit Products vs Subscriptions</CardTitle>
          <CardDescription>Understanding the difference between one-time purchases and recurring plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-blue-100 p-2 dark:bg-blue-900'>
                  <CreditCard className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <h4 className='font-semibold text-blue-900 dark:text-blue-100'>Credit Products</h4>
                  <p className='text-muted-foreground text-sm'>One-time purchases</p>
                </div>
              </div>
              <ul className='text-muted-foreground ml-4 space-y-2 text-sm'>
                <li className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-blue-600' />
                  Instant credit delivery
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-blue-600' />
                  No recurring charges
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-blue-600' />
                  Perfect for occasional users
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-blue-600' />
                  Flexible pricing tiers
                </li>
              </ul>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full bg-green-100 p-2 dark:bg-green-900'>
                  <Package className='h-4 w-4 text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <h4 className='font-semibold text-green-900 dark:text-green-100'>Subscription Plans</h4>
                  <p className='text-muted-foreground text-sm'>Recurring billing</p>
                </div>
              </div>
              <ul className='text-muted-foreground ml-4 space-y-2 text-sm'>
                <li className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-green-600' />
                  Monthly credit allowance
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-green-600' />
                  Predictable revenue
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-green-600' />
                  Best for regular users
                </li>
                <li className='flex items-center gap-2'>
                  <div className='h-1 w-1 rounded-full bg-green-600' />
                  Volume discounts
                </li>
              </ul>
            </div>
          </div>

          <div className='mt-6 rounded-lg border border-blue-200/50 bg-linear-to-r from-blue-50 to-green-50 p-4 dark:border-blue-800/50 dark:from-blue-950 dark:to-green-950'>
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 rounded-full bg-blue-100 p-1.5 dark:bg-blue-900'>
                <span className='text-sm text-blue-600 dark:text-blue-400'>💡</span>
              </div>
              <div>
                <h5 className='mb-1 font-medium text-blue-900 dark:text-blue-100'>Hybrid Strategy Recommendation</h5>
                <p className='text-sm text-blue-800 dark:text-blue-200'>
                  Offer both subscription plans AND credit packages. Users can subscribe for regular credits, then buy
                  credit packs when they need extra credits for big projects.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const AdminCreditProductsPage = async () => {
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
      <Suspense fallback={<div>Loading...</div>}>
        <CreditProductsContent />
      </Suspense>
    </div>
  )
}

export default AdminCreditProductsPage
