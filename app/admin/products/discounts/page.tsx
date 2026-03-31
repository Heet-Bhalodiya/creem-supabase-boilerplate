// Next Imports
import Link from 'next/link'

// Third-party Imports
import { AlertCircle, Percent, Tag, TrendingUp } from 'lucide-react'

// Component Imports
import { DiscountManager } from '@/components/admin/discount-manager'
import { DiscountsTable } from '@/components/admin/discounts-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility Imports
import { createClient } from '@/lib/supabase/server'

const DiscountsPage = async () => {
  const supabase = await createClient()

  // Fetch discounts from local database (Creem API doesn't support listing all discounts)
  const { data: localDiscounts } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  const products = await supabase.from('pricing_plans').select('id, name, creem_product_id').eq('is_active', true)

  const activeDiscounts = localDiscounts?.filter(d => d.is_active).length || 0
  const totalUsage = localDiscounts?.reduce((sum, d) => sum + d.used_count, 0) || 0
  const totalSaved = 0 // Calculate from actual usage data if needed

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Discount Codes</h2>
          <p className='text-muted-foreground'>Manage discount codes and promotional offers</p>
        </div>
        <DiscountManager products={products.data || []} />
      </div>

      <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-500' />
          <div className='flex-1'>
            <h3 className='mb-1 text-sm font-semibold text-amber-900 dark:text-amber-100'>Setup Required</h3>
            <p className='text-sm text-amber-800 dark:text-amber-200'>
              Before creating discount codes, make sure you have configured your Creem API key in{' '}
              <Link href='/admin/settings/creem' className='font-medium underline'>
                Creem Configuration
              </Link>
              . You also need at least one active pricing plan.
            </p>
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Discounts</CardTitle>
            <Tag className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{activeDiscounts}</div>
            <p className='text-muted-foreground text-xs'>Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Usage</CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalUsage}</div>
            <p className='text-muted-foreground text-xs'>Times used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Savings</CardTitle>
            <Percent className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${(totalSaved / 100).toFixed(2)}</div>
            <p className='text-muted-foreground text-xs'>Customer savings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Discount Codes</CardTitle>
          <CardDescription>Manage promotional discount codes</CardDescription>
        </CardHeader>
        <CardContent>
          <DiscountsTable discounts={localDiscounts || []} />
        </CardContent>
      </Card>
    </div>
  )
}

export default DiscountsPage
