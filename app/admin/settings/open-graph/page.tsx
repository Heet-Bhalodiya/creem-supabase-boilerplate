// Component Imports
import { OpenGraphSettingsForm } from '@/components/admin/open-graph-settings'

// Utility Imports
import { getOpenGraphSettings } from '@/lib/actions/app-settings'

const OpenGraphSettingsPage = async () => {
  const settings = await getOpenGraphSettings()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Open Graph Images</h2>
        <p className='text-muted-foreground'>Configure automatic Open Graph image generation</p>
      </div>

      <OpenGraphSettingsForm initialSettings={settings} />
    </div>
  )
}

export default OpenGraphSettingsPage
