// Component Imports
import { BillingConfigForm } from '@/components/admin/billing-config-form'

// Utility Imports
import { getBillingConfig } from '@/lib/actions/billing'

const CreemSettingsPage = async () => {
  const billingConfig = await getBillingConfig()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Creem Configuration</h2>
        <p className='text-muted-foreground'>Manage your Creem API keys and payment settings</p>
      </div>

      <BillingConfigForm config={billingConfig} />
    </div>
  )
}

export default CreemSettingsPage
