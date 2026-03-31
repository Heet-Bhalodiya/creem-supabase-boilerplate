import { getActivePricingPlans } from '@/lib/actions/billing'
import { PricingPlans } from '@/components/pricing-plans'

export async function DatabasePricingSection() {
  const plans = await getActivePricingPlans()

  return (
    <section id='pricing' className='bg-muted/50 w-full py-12 md:py-24 lg:py-32'>
      <div className='container px-4 md:px-6'>
        <div className='mb-12 flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>Choose Your Content Plan</h2>
            <p className='text-muted-foreground max-w-3xl text-lg'>
              From solo creators to enterprise teams, we have the perfect plan for your content needs. Start creating
              amazing AI-powered content today!
            </p>
          </div>
        </div>
        <PricingPlans plans={plans} />
      </div>
    </section>
  )
}
