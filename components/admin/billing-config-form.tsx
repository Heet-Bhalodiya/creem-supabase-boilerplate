'use client'

// Next Imports
import Link from 'next/link'

// React Imports
import { useState } from 'react'

// Third-Party Imports
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility Imports
import { updateBillingConfig } from '@/lib/actions/billing'
import { toast } from '@/lib/toast'

type BillingConfigFormProps = {
  config: Array<{ key: string; value: string }>
}

export function BillingConfigForm({ config: initialConfig }: BillingConfigFormProps) {
  const [config, setConfig] = useState(() => {
    const configMap: Record<string, string> = {}
    initialConfig.forEach(item => {
      configMap[item.key] = item.value
    })
    return configMap
  })

  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showKeys, setShowKeys] = useState({
    creem_api_key: false,
    creem_webhook_secret: false
  })

  const handleUpdate = async (key: string, value: string) => {
    setIsLoading(key)
    try {
      await updateBillingConfig(key, value)
      setConfig(prev => ({ ...prev, [key]: value }))
      toast('success', `${key.replace(/_/g, ' ')} has been updated successfully`)
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to update settings')
    } finally {
      setIsLoading(null)
    }
  }

  const handleBooleanUpdate = async (key: string, checked: boolean) => {
    await handleUpdate(key, checked.toString())
  }

  const toggleShowKey = (key: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className='space-y-6'>
      {/* Important Setup Instructions */}
      <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='h-5 w-5 text-amber-600 dark:text-amber-500' />
          <div className='flex-1'>
            <h3 className='mb-2 text-sm font-semibold text-amber-900 dark:text-amber-100'>
              Important: Creem API Configuration Required
            </h3>
            <div className='space-y-2 text-sm text-amber-800 dark:text-amber-200'>
              <p>
                This configuration is <strong>required</strong> for all payment features including pricing plans,
                discounts, subscriptions, and credit purchases to work properly.
              </p>
              <ol className='ml-4 list-decimal space-y-1'>
                <li>
                  Get your API key from{' '}
                  <Link
                    href='https://creem.io/dashboard/api-keys'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium underline'
                  >
                    Creem Dashboard → API Keys
                  </Link>
                </li>
                <li>Paste your API key below and click Save</li>
                <li>
                  Configure webhook URL in Creem Dashboard:{' '}
                  <code className='rounded bg-amber-100 px-1 dark:bg-amber-900/50'>
                    yourdomainname/api/webhooks/creem
                  </code>
                </li>
                <li>Copy the webhook secret and save it below</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Creem Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Creem API Keys</CardTitle>
          <CardDescription>Configure your Creem API keys for payment processing</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='creem_api_key'>API Key</Label>
            <div className='relative'>
              <Input
                id='creem_api_key'
                type={showKeys.creem_api_key ? 'text' : 'password'}
                value={config.creem_api_key || ''}
                onChange={e =>
                  setConfig({
                    ...config,
                    creem_api_key: e.target.value
                  })
                }
                placeholder='cr_test_...'
                className='pr-10'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute top-0 right-0 h-full'
                onClick={() => toggleShowKey('creem_api_key')}
              >
                {showKeys.creem_api_key ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </Button>
            </div>
            <Button
              onClick={() => handleUpdate('creem_api_key', config.creem_api_key)}
              disabled={isLoading === 'creem_api_key'}
              size='sm'
              className='w-fit'
            >
              {isLoading === 'creem_api_key' ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='creem_webhook_secret'>Webhook Secret</Label>
            <div className='relative'>
              <Input
                id='creem_webhook_secret'
                type={showKeys.creem_webhook_secret ? 'text' : 'password'}
                value={config.creem_webhook_secret || ''}
                onChange={e =>
                  setConfig({
                    ...config,
                    creem_webhook_secret: e.target.value
                  })
                }
                placeholder='whsec_creem_...'
                className='pr-10'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute top-0 right-0 h-full'
                onClick={() => toggleShowKey('creem_webhook_secret')}
              >
                {showKeys.creem_webhook_secret ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </Button>
            </div>
            <Button
              onClick={() => handleUpdate('creem_webhook_secret', config.creem_webhook_secret)}
              disabled={isLoading === 'creem_webhook_secret'}
              size='sm'
              className='w-fit'
            >
              {isLoading === 'creem_webhook_secret' ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* General Billing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure general billing settings</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='tax_enabled'>Enable Tax Collection</Label>
              <p className='text-muted-foreground text-sm'>Collect tax on subscription payments</p>
            </div>
            <Switch
              id='tax_enabled'
              checked={config.tax_enabled === 'true'}
              onCheckedChange={checked => handleBooleanUpdate('tax_enabled', checked)}
              disabled={isLoading === 'tax_enabled'}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='trial_days'>Trial Period (Days)</Label>
            <Input
              id='trial_days'
              type='number'
              value={config.trial_days || ''}
              onChange={e => setConfig({ ...config, trial_days: e.target.value })}
              placeholder='14'
            />
            <Button
              onClick={() => handleUpdate('trial_days', config.trial_days)}
              disabled={isLoading === 'trial_days'}
              size='sm'
              className='w-fit'
            >
              {isLoading === 'trial_days' ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className='bg-muted rounded-lg p-4'>
        <p className='text-muted-foreground text-sm'>
          <strong>Note:</strong> These settings are stored securely in your database. Make sure to use environment
          variables for production applications.
        </p>
      </div>
    </div>
  )
}
