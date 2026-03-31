'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { ExternalLink, X } from 'lucide-react'
import { toast } from 'sonner'
import { cancelSubscription, getCustomerPortalUrl } from '@/lib/actions/billing'
import { useRouter } from 'next/navigation'

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
}

type SubscriptionManagerProps = {
  subscription: Subscription
  availablePlans: PricingPlan[]
}

export function SubscriptionManager({ subscription, availablePlans }: SubscriptionManagerProps) {
  const router = useRouter()
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Find current plan
  const currentPlan = availablePlans.find(p => p.creem_product_id === subscription.creem_product_id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(price / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default'
      case 'canceled':
      case 'expired':
        return 'destructive'
      case 'scheduled_cancel':
        return 'secondary'
      case 'trialing':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const result = await cancelSubscription('scheduled')

      if (result.success) {
        toast.success('Subscription will be canceled at the end of your billing period')
        setIsCancelDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to cancel subscription')
      }
    } catch {
      toast.error('Failed to cancel subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePortal = async () => {
    setIsLoading(true)
    try {
      const result = await getCustomerPortalUrl()

      if (result.success && result.url) {
        window.open(result.url, '_blank')
      } else {
        toast.error(result.error || 'Failed to open customer portal')
      }
    } catch {
      toast.error('Failed to open customer portal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </div>
            <Badge variant={getStatusColor(subscription.status)}>{subscription.status.replace('_', ' ')}</Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Current Plan Details */}
          <div className='space-y-4'>
            <div>
              <h4 className='font-semibold'>{currentPlan?.name || subscription.plan_name || 'Unknown Plan'}</h4>
              <p className='text-muted-foreground text-sm'>
                {currentPlan?.description || 'Your current subscription plan'}
              </p>
            </div>

            {currentPlan && (
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Price:</span>
                  <div className='font-medium'>
                    {formatPrice(currentPlan.price, currentPlan.currency)}/{currentPlan.interval}
                  </div>
                </div>
                {currentPlan.grants_credits && (
                  <div>
                    <span className='text-muted-foreground'>Credits:</span>
                    <div className='font-medium'>{currentPlan.credits_per_cycle?.toLocaleString() || 0} per cycle</div>
                  </div>
                )}
              </div>
            )}

            <Separator />

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Next billing:</span>
                <div className='font-medium'>{formatDate(subscription.current_period_end)}</div>
              </div>
              <div>
                <span className='text-muted-foreground'>Started:</span>
                <div className='font-medium'>{formatDate(subscription.created_at)}</div>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <div className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
                <div className='text-sm text-orange-800'>
                  <strong>Cancellation Scheduled</strong>
                  <p>Your subscription will end on {formatDate(subscription.current_period_end)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-2'>
            {subscription.status === 'active' && !subscription.cancel_at_period_end && (
              <Button variant='destructive' onClick={() => setIsCancelDialogOpen(true)}>
                <X className='mr-2 h-4 w-4' />
                Cancel Plan
              </Button>
            )}
            <Button variant='outline' onClick={handlePortal} disabled={isLoading}>
              <ExternalLink className='mr-2 h-4 w-4' />
              Billing Portal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of your current billing period (
              {formatDate(subscription.current_period_end)}). You&apos;ll keep access to all features until then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
            <div className='text-sm text-yellow-800'>
              <strong>What happens next:</strong>
              <ul className='mt-2 list-inside list-disc space-y-1'>
                <li>Your subscription will not auto-renew</li>
                <li>You&apos;ll keep access until {formatDate(subscription.current_period_end)}</li>
                <li>You can reactivate anytime before it expires</li>
                <li>No refund for the current period</li>
              </ul>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isLoading ? 'Canceling...' : 'Cancel Subscription'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
