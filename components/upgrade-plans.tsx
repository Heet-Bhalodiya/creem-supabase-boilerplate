'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createCheckoutSession } from '@/lib/actions/billing'

type Subscription = {
  id: string
  creem_subscription_id: string
  creem_customer_id: string
  creem_product_id: string
  plan_name?: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  created_at: string
}

type PricingPlan = {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  interval: string
  creem_product_id: string
  credits_per_cycle?: number
  grants_credits?: boolean
  is_active: boolean
  features?: string[]
}

type UpgradePlansProps = {
  subscription: Subscription
  availablePlans: PricingPlan[]
}

export function UpgradePlans({ subscription, availablePlans }: UpgradePlansProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  // Filter active plans and exclude the current plan
  const activePlans = availablePlans.filter(p => p.is_active && p.creem_product_id !== subscription.creem_product_id)

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price / 100)
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan')
      return
    }

    const selectedPlan = activePlans.find(p => p.creem_product_id === selectedPlanId)
    if (!selectedPlan) return

    setLoadingPlanId(selectedPlanId)
    try {
      // Create checkout session for the upgrade (passing isUpgrade=true)
      const result = await createCheckoutSession(selectedPlanId, true)

      if (result.success && result.url) {
        // Redirect to Creem checkout page
        window.location.assign(result.url)
      } else {
        toast.error(result.error || 'Failed to create checkout session')
        setLoadingPlanId(null)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to initiate upgrade')
      setLoadingPlanId(null)
    }
  }

  const getPlanOrder = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('starter') || lowerName.includes('basic')) return 1
    if (lowerName.includes('pro') || lowerName.includes('professional')) return 2
    if (lowerName.includes('enterprise') || lowerName.includes('business')) return 3
    return 99
  }

  // Sort plans by price/tier
  const sortedPlans = [...activePlans].sort((a, b) => {
    const orderA = getPlanOrder(a.name)
    const orderB = getPlanOrder(b.name)
    if (orderA !== orderB) return orderA - orderB
    return a.price - b.price
  })

  if (sortedPlans.length === 0) {
    return (
      <div className='bg-muted rounded-lg p-8 text-center'>
        <p className='text-muted-foreground'>No other plans available at this time.</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Upgrade Your Plan</h2>
        <p className='text-muted-foreground'>Pick your preferred plan</p>
      </div>

      <div className='space-y-4'>
        {sortedPlans.map(plan => {
          const isSelected = selectedPlanId === plan.creem_product_id
          const currentPlan = availablePlans.find(p => p.creem_product_id === subscription.creem_product_id)
          const creditApplied = currentPlan ? (plan.price - currentPlan.price) / 100 : 0

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.creem_product_id)}
              className={`relative flex cursor-pointer items-center justify-between rounded-lg border-2 p-6 transition-all ${
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
              } `}
            >
              {/* Radio Button */}
              <div className='flex items-center gap-4'>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? 'border-primary' : 'border-muted-foreground'} `}
                >
                  {isSelected && <div className='bg-primary h-3 w-3 rounded-full' />}
                </div>

                {/* Plan Details */}
                <div>
                  <h3 className='text-lg font-semibold'>{plan.name}</h3>
                  <p className='text-muted-foreground text-sm'>{plan.description || 'Best for large teams'}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className='text-right'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-2xl font-bold'>{formatPrice(plan.price, plan.currency)}</span>
                  {currentPlan && currentPlan.price > 0 && (
                    <span className='text-muted-foreground text-sm line-through'>
                      ${(currentPlan.price / 100).toFixed(2)}
                    </span>
                  )}
                </div>
                {creditApplied !== 0 && (
                  <p className='text-muted-foreground mt-1 text-sm'>
                    ${Math.abs(creditApplied).toFixed(2)} credit applied
                  </p>
                )}
                <p className='text-muted-foreground text-sm'>Pay once</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Proceed Button */}
      <div>
        <Button
          size='lg'
          disabled={!selectedPlanId || loadingPlanId !== null || subscription.status !== 'active'}
          onClick={handleProceedToPayment}
          className='w-full sm:w-auto'
        >
          {loadingPlanId ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Processing...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </Button>
      </div>

      {subscription.status !== 'active' && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center dark:border-yellow-800 dark:bg-yellow-950'>
          <p className='text-sm text-yellow-800 dark:text-yellow-200'>
            Your subscription is currently {subscription.status}. You can only upgrade active subscriptions.
          </p>
        </div>
      )}
    </div>
  )
}
