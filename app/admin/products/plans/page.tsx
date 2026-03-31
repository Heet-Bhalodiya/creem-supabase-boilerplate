// Component Imports
import { getPricingPlans } from '@/lib/actions/billing'
import { PricingPlansManager } from '@/components/admin/pricing-plans-manager'

const PlansPage = async () => {
  const plans = await getPricingPlans()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Pricing Plans</h2>
        <p className='text-muted-foreground'>Manage your subscription and one-time pricing plans</p>
      </div>

      <PricingPlansManager plans={plans} />
    </div>
  )
}

export default PlansPage
