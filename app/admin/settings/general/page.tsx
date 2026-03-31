// Component Imports
import { GeneralSettings } from '@/components/admin/general-settings'

const GeneralSettingsPage = async () => {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>General Settings</h2>
        <p className='text-muted-foreground'>Configure application name, logo, and general preferences</p>
      </div>

      <GeneralSettings />
    </div>
  )
}

export default GeneralSettingsPage
