'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { createCheckoutSession, type PricingPlan } from '@/lib/actions/billing'
import { formatPrice } from '@/lib/creem/client'
import { toast } from '@/lib/toast'
import { NumberTicker } from '@/components/ui/number-ticker'

type PricingPlansProps = {
  plans: PricingPlan[]
}

export function PricingPlans({ plans }: PricingPlansProps) {
  const [isPending, startTransition] = useTransition()
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!plan.creem_product_id) {
      toast('error', 'This plan is not available for purchase at the moment.')
      return
    }

    setLoadingPlanId(plan.id)

    startTransition(async () => {
      try {
        const result = await createCheckoutSession(plan.creem_product_id!)

        if (result.success && result.url) {
          // Open Creem checkout in new tab
          window.open(result.url, '_blank', 'noopener,noreferrer')
        } else {
          toast('error', result.error || 'Failed to create checkout session')
        }
      } catch (error) {
        console.error('Checkout error:', error)
        toast('error', 'An unexpected error occurred. Please try again.')
      } finally {
        setLoadingPlanId(null)
      }
    })
  }

  if (plans.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground'>No pricing plans available at the moment.</p>
      </div>
    )
  }

  // Find popular plans based on plan metadata or default logic
  const findPopularPlan = (plans: PricingPlan[]) => {
    // Check if any plan has popular flag from database
    const markedPopular = plans.find(plan => plan.popular)
    if (markedPopular) return markedPopular.id

    // Fallback to middle plan
    const middleIndex = plans.length === 3 ? 1 : Math.floor(plans.length / 2)
    return plans[middleIndex]?.id
  }

  const popularPlanId = findPopularPlan(plans)

  const getPriceSuffix = (plan: PricingPlan) => {
    if (plan.payment_type === 'one_time' || plan.interval === 'one_time') {
      return '/one-time'
    }

    if (plan.interval === 'year') {
      return '/year'
    }

    return '/month'
  }

  return (
    <div className='mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3'>
      {plans.map(plan => {
        const isPopular = plan.id === popularPlanId || plan.popular
        const isLoading = loadingPlanId === plan.id

        return (
          <div
            key={plan.id}
            className={`bg-card relative overflow-hidden rounded-2xl border-2 p-8 ${
              isPopular ? 'border-black shadow-lg' : 'border-gray-200'
            }`}
          >
            <div className='flex flex-col gap-6'>
              {/* Plan Header */}
              <div>
                <h3 className='mb-3 text-2xl font-bold'>{plan.name}</h3>
                {plan.description && (
                  <p className='text-muted-foreground text-sm leading-relaxed'>{plan.description}</p>
                )}
              </div>

              {/* Price */}
              <div className='flex items-baseline gap-1'>
                <span className='text-6xl font-bold'>
                  {plan.price === 0 ? (
                    <NumberTicker value={0} delay={0} />
                  ) : (
                    <>
                      $
                      <NumberTicker
                        value={parseFloat(formatPrice(plan.price, plan.currency).replace('$', '').replace(',', ''))}
                        delay={0}
                      />
                    </>
                  )}
                </span>
                <span className='text-muted-foreground text-lg'>{getPriceSuffix(plan)}</span>
              </div>

              {/* CTA Button */}
              <Button
                variant={isPopular ? 'default' : 'outline'}
                size='lg'
                className={`h-12 w-full font-medium ${
                  isPopular
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'border-gray-200 bg-gray-100 text-black hover:bg-gray-200'
                }`}
                disabled={isPending || !plan.creem_product_id}
                onClick={() => {
                  if (plan.price === 0) {
                    window.open('/auth/sign-up', '_blank')
                  } else {
                    handleSelectPlan(plan)
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating checkout...
                  </>
                ) : (
                  <>
                    {plan.price === 0 ? 'Free plan' : 'Purchase plan'}
                    {!isLoading && <ArrowRight className='ml-2 h-4 w-4' />}
                  </>
                )}
              </Button>

              {/* Features */}
              <div>
                <h4 className='mb-4 text-lg font-semibold'>Features</h4>
                <ul className='space-y-3 text-sm'>
                  {((plan.features as string[]) || []).map((feature, idx) => (
                    <li key={idx} className='flex items-start gap-3'>
                      <div className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black' />
                      <span className='leading-relaxed'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
