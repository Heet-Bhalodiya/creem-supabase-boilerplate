// Component Imports
import { InvoiceSettingsForm } from '@/components/admin/invoice-settings'

// Utility Imports
import { getInvoiceSettings } from '@/lib/actions/app-settings'

const InvoiceSettingsPage = async () => {
  const settings = await getInvoiceSettings()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Invoice Settings</h2>
        <p className='text-muted-foreground'>Configure invoice generation and company details</p>
      </div>

      <InvoiceSettingsForm initialSettings={settings} />
    </div>
  )
}

export default InvoiceSettingsPage
