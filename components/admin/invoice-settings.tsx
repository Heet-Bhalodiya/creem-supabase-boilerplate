'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/lib/toast'
import { updateInvoiceSettings, type InvoiceSettings } from '@/lib/actions/app-settings'
import { Loader2 } from 'lucide-react'

type InvoiceSettingsFormProps = {
  initialSettings: InvoiceSettings
}

export function InvoiceSettingsForm({ initialSettings }: InvoiceSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<InvoiceSettings>(initialSettings)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateInvoiceSettings(settings)
      toast('success', 'Invoice settings have been updated successfully')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePreview = () => {
    // Open invoice preview in new window with current settings
    const params = new URLSearchParams({
      serial_number_series: settings.invoice_prefix,
      seller_name: settings.company_name,
      seller_code: settings.company_code,
      seller_address: settings.company_address,
      seller_tax_number: settings.company_tax_number,
      seller_phone: settings.company_phone
    })
    window.open(`/invoice/preview?${params.toString()}`, '_blank')
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Invoice Generation */}
          <div className='space-y-4'>
            <CardTitle className='text-base'>Invoice generation</CardTitle>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Enable invoice generation</Label>
                <p className='text-muted-foreground text-sm'>
                  If enabled, invoices will be generated for each successful transaction. Customers will be able to see
                  their invoices in their dashboard.
                </p>
              </div>
              <Switch checked={settings.enabled} onCheckedChange={enabled => setSettings({ ...settings, enabled })} />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='invoice-prefix'>Invoice number prefix</Label>
              <Input
                id='invoice-prefix'
                value={settings.invoice_prefix}
                onChange={e => setSettings({ ...settings, invoice_prefix: e.target.value })}
                placeholder='exp'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='company-name'>Company name</Label>
              <Input
                id='company-name'
                value={settings.company_name}
                onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                placeholder='SaaSyklt Company Inc.'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='company-code'>Company code</Label>
              <Input
                id='company-code'
                value={settings.company_code}
                onChange={e => setSettings({ ...settings, company_code: e.target.value })}
                placeholder='43224'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='company-address'>Company address</Label>
              <Input
                id='company-address'
                value={settings.company_address}
                onChange={e => setSettings({ ...settings, company_address: e.target.value })}
                placeholder='1 Broadway, NY'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='company-tax'>Company tax number (VAT)</Label>
              <Input
                id='company-tax'
                value={settings.company_tax_number}
                onChange={e => setSettings({ ...settings, company_tax_number: e.target.value })}
                placeholder='234432544352315'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='company-phone'>Company phone</Label>
              <Input
                id='company-phone'
                value={settings.company_phone}
                onChange={e => setSettings({ ...settings, company_phone: e.target.value })}
                placeholder='6541132121'
              />
            </div>

            <Button onClick={handleGeneratePreview} variant='outline' className='w-full'>
              Generate Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading} className='w-full bg-yellow-500 hover:bg-yellow-600'>
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Save Changes
      </Button>
    </div>
  )
}
