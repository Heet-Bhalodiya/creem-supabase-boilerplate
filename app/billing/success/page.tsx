// Next Imports
import Link from 'next/link'
import { redirect } from 'next/navigation'

// React Imports
import { Suspense } from 'react'

// Third-party Imports
import { Check, ArrowRight, Sparkles, CreditCard } from 'lucide-react'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Utility Imports
import { createClient } from '@/lib/supabase/server'

async function SuccessContent({
  searchParams
}: {
  searchParams: Promise<{ checkout_id?: string; subscription_id?: string; customer_id?: string; product_id?: string }>
}) {
  const params = await searchParams
  const checkoutId = params.checkout_id
  const subscriptionId = params.subscription_id

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className='bg-background relative min-h-screen overflow-hidden'>
      {/* Gradient Background */}
      <div className='absolute inset-0 -z-10'>
        <div className='via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/50 dark:from-green-950/20' />
        <div className='absolute top-0 left-1/2 -translate-x-1/2'>
          <div className='h-[500px] w-[500px] rounded-full bg-green-500/10 blur-3xl' />
        </div>
      </div>

      <div className='container mx-auto px-4 py-16'>
        <div className='mx-auto max-w-2xl'>
          {/* Success Animation */}
          <div className='mb-8 text-center'>
            <div className='relative mx-auto mb-6 flex h-24 w-24 items-center justify-center'>
              <div className='absolute inset-0 animate-ping rounded-full bg-green-500/20' />
              <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/50'>
                <Check className='h-10 w-10 text-white' strokeWidth={3} />
              </div>
            </div>

            <h1 className='mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl dark:from-green-400 dark:to-emerald-400'>
              Payment Successful!
            </h1>
            <p className='text-muted-foreground text-lg'>Your subscription is now active. Welcome to the family! 🎉</p>
          </div>

          {/* Payment Details Card */}
          {(subscriptionId || checkoutId) && (
            <Card className='mb-8 border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:border-green-900/50 dark:from-green-950/20 dark:to-emerald-950/20'>
              <CardContent className='p-6'>
                <div className='mb-4 flex items-center gap-2 text-sm font-medium'>
                  <CreditCard className='h-4 w-4 text-green-600 dark:text-green-400' />
                  <span className='text-green-600 dark:text-green-400'>Transaction Details</span>
                </div>
                <div className='space-y-2'>
                  {subscriptionId && (
                    <div className='bg-background/50 flex items-center justify-between rounded-lg px-3 py-2'>
                      <span className='text-muted-foreground text-sm'>Subscription ID</span>
                      <code className='text-foreground font-mono text-xs'>{subscriptionId}</code>
                    </div>
                  )}
                  {checkoutId && (
                    <div className='bg-background/50 flex items-center justify-between rounded-lg px-3 py-2'>
                      <span className='text-muted-foreground text-sm'>Checkout ID</span>
                      <code className='text-foreground font-mono text-xs'>{checkoutId}</code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className='mb-8'>
            <CardContent className='p-8'>
              <div className='mb-6 flex items-center gap-2'>
                <Sparkles className='text-primary h-5 w-5' />
                <h2 className='text-xl font-semibold'>Get Started</h2>
              </div>

              <div className='grid gap-4'>
                <Link href='/user' className='group'>
                  <div className='hover:border-primary hover:bg-accent flex items-center justify-between rounded-lg border p-4 transition-all'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold'>
                        1
                      </div>
                      <div>
                        <p className='font-medium'>Access Your Dashboard</p>
                        <p className='text-muted-foreground text-sm'>Explore features and get started</p>
                      </div>
                    </div>
                    <ArrowRight className='text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1' />
                  </div>
                </Link>

                <Link href='/user/billing' className='group'>
                  <div className='hover:border-primary hover:bg-accent flex items-center justify-between rounded-lg border p-4 transition-all'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold'>
                        2
                      </div>
                      <div>
                        <p className='font-medium'>Manage Subscription</p>
                        <p className='text-muted-foreground text-sm'>View invoices and billing details</p>
                      </div>
                    </div>
                    <ArrowRight className='text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1' />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className='text-center'>
            <Button asChild size='lg' className='shadow-primary/30 shadow-lg'>
              <Link href='/user'>
                <Sparkles className='mr-2 h-4 w-4' />
                Get Started Now
              </Link>
            </Button>
            <p className='text-muted-foreground mt-4 text-sm'>
              Need help?{' '}
              <Link href='mailto:support@example.com' className='text-primary hover:underline'>
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const BillingSuccessPage = ({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string; subscription_id?: string; product_id?: string }>
}) => {
  return (
    <Suspense fallback={<div className='flex min-h-screen items-center justify-center'>Loading...</div>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  )
}

export default BillingSuccessPage
