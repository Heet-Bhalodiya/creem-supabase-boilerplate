import { getPricingPlans } from '@/lib/actions/billing'
import { PricingPlans } from '@/components/pricing-plans'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function UserPricingPage() {
  const plans = await getPricingPlans()

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Pricing Plans</h2>
        <p className='text-muted-foreground'>Choose the perfect plan for your content creation needs</p>
      </div>

      {/* Pricing Plans */}
      <PricingPlans plans={plans} />

      {/* FAQ Section */}
      <Card className='mt-12'>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Have questions? We have answers.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h4 className='mb-2 font-semibold'>Can I change plans later?</h4>
            <p className='text-muted-foreground text-sm'>
              Yes, you can upgrade or downgrade your plan at any time from your billing dashboard.
            </p>
          </div>
          <div>
            <h4 className='mb-2 font-semibold'>What payment methods do you accept?</h4>
            <p className='text-muted-foreground text-sm'>
              We accept all major credit cards, debit cards, and various local payment methods through our secure
              payment processor.
            </p>
          </div>
          <div>
            <h4 className='mb-2 font-semibold'>Is there a refund policy?</h4>
            <p className='text-muted-foreground text-sm'>
              Yes, we offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact our support team for a
              full refund.
            </p>
          </div>
          <div>
            <h4 className='mb-2 font-semibold'>Can I cancel my subscription anytime?</h4>
            <p className='text-muted-foreground text-sm'>
              Absolutely. You can cancel your subscription at any time from your billing page. You&apos;ll retain access
              until the end of your billing period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
