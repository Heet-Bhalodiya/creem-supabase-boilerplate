'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { PasswordInput } from '@/components/ui/password-input'
import { toast } from '@/lib/toast'
import { updateAndActivateEmailProvider, sendTestEmail, type EmailProvider } from '@/lib/actions/email-providers'
import { Send, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

type EmailProviderEditProps = {
  provider: EmailProvider
}

export function EmailProviderEdit({ provider: initialProvider }: EmailProviderEditProps) {
  const router = useRouter()
  const [provider, setProvider] = useState(initialProvider)
  const [isLoading, setIsLoading] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testSubject, setTestSubject] = useState('Test Email')
  const [testBody, setTestBody] = useState('This is a test email.')
  const [isSendingTest, setIsSendingTest] = useState(false)

  const updateConfig = (key: string, value: string) => {
    setProvider({
      ...provider,
      config: { ...provider.config, [key]: value }
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateAndActivateEmailProvider(provider.slug, provider.config, false)
      toast('success', 'Email provider configuration saved successfully')
      router.refresh()
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to save configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivate = async () => {
    setIsLoading(true)
    try {
      await updateAndActivateEmailProvider(provider.slug, provider.config, true)
      toast('success', `${provider.name} is now the active email provider`)
      router.refresh()
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to activate provider')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTest = async () => {
    if (!testEmail) {
      toast('error', 'Please enter a test email address')
      return
    }

    setIsSendingTest(true)
    try {
      await sendTestEmail()
      toast('success', 'Test email sent successfully! Check your inbox.')
      setShowTestDialog(false)
      setTestEmail('')
      setTestSubject('Test Email')
      setTestBody('This is a test email.')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to send test email')
    } finally {
      setIsSendingTest(false)
    }
  }

  const renderConfigFields = () => {
    switch (provider.provider_type) {
      case 'mailgun':
        return (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='api_key'>API Key *</Label>
              <PasswordInput
                id='api_key'
                value={provider.config.api_key || ''}
                onChange={e => updateConfig('api_key', e.target.value)}
                placeholder='key-...'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='domain'>Domain *</Label>
              <Input
                id='domain'
                value={provider.config.domain || ''}
                onChange={e => updateConfig('domain', e.target.value)}
                placeholder='mg.yourdomain.com'
              />
            </div>
          </>
        )

      case 'postmark':
        return (
          <div className='grid gap-2'>
            <Label htmlFor='server_token'>Server Token *</Label>
            <PasswordInput
              id='server_token'
              value={provider.config.server_token || ''}
              onChange={e => updateConfig('server_token', e.target.value)}
              placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
            />
          </div>
        )

      case 'ses':
        return (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='access_key_id'>Access Key ID *</Label>
              <Input
                id='access_key_id'
                value={provider.config.access_key_id || ''}
                onChange={e => updateConfig('access_key_id', e.target.value)}
                placeholder='AKIA...'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='secret_access_key'>Secret Access Key *</Label>
              <PasswordInput
                id='secret_access_key'
                value={provider.config.secret_access_key || ''}
                onChange={e => updateConfig('secret_access_key', e.target.value)}
                placeholder='...'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='region'>Region *</Label>
              <Input
                id='region'
                value={provider.config.region || 'us-east-1'}
                onChange={e => updateConfig('region', e.target.value)}
                placeholder='us-east-1'
              />
            </div>
          </>
        )

      case 'resend':
        return (
          <div className='grid gap-2'>
            <Label htmlFor='api_key'>API Key *</Label>
            <PasswordInput
              id='api_key'
              value={provider.config.api_key || ''}
              onChange={e => updateConfig('api_key', e.target.value)}
              placeholder='re_...'
            />
          </div>
        )

      case 'smtp':
        return (
          <>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='host'>SMTP Host *</Label>
                <Input
                  id='host'
                  value={provider.config.host || ''}
                  onChange={e => updateConfig('host', e.target.value)}
                  placeholder='smtp.gmail.com'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='port'>Port *</Label>
                <Input
                  id='port'
                  value={provider.config.port || ''}
                  onChange={e => updateConfig('port', e.target.value)}
                  placeholder='587'
                />
              </div>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='username'>Username *</Label>
              <Input
                id='username'
                value={provider.config.username || ''}
                onChange={e => updateConfig('username', e.target.value)}
                placeholder='your-email@gmail.com'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password *</Label>
              <PasswordInput
                id='password'
                value={provider.config.password || ''}
                onChange={e => updateConfig('password', e.target.value)}
                placeholder='Your app password'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='secure'>Security</Label>
              <select
                id='secure'
                value={provider.config.secure || 'tls'}
                onChange={e => updateConfig('secure', e.target.value)}
                className='border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm'
              >
                <option value='tls'>TLS</option>
                <option value='ssl'>SSL</option>
                <option value='none'>None</option>
              </select>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-muted-foreground mb-2 flex items-center gap-2 text-sm'>
            <span>Email Providers</span>
            <span>/</span>
            <span>Edit</span>
          </div>
          <h1 className='text-3xl font-bold tracking-tight'>Edit Email Provider</h1>
        </div>
        <div className='flex items-center gap-2'>
          {provider.is_active ? (
            <Badge variant='default' className='flex items-center gap-1'>
              <Check className='h-3 w-3' />
              Active
            </Badge>
          ) : (
            <Button onClick={handleActivate} disabled={isLoading} variant='outline'>
              {isLoading ? 'Activating...' : 'Set as Active'}
            </Button>
          )}
          <Button onClick={() => setShowTestDialog(true)} variant='outline'>
            <Send className='mr-2 h-4 w-4' />
            Send test email
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Configure {provider.name} email provider settings</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Name *</Label>
            <Input id='name' value={provider.name} readOnly className='bg-muted' />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='slug'>Slug *</Label>
            <Input id='slug' value={provider.slug} readOnly className='bg-muted' />
          </div>

          {renderConfigFields()}

          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='from_email'>From Email *</Label>
              <Input
                id='from_email'
                type='email'
                value={provider.config.from_email || ''}
                onChange={e => updateConfig('from_email', e.target.value)}
                placeholder='noreply@yourdomain.com'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='from_name'>From Name *</Label>
              <Input
                id='from_name'
                value={provider.config.from_name || ''}
                onChange={e => updateConfig('from_name', e.target.value)}
                placeholder='Creem Boilerplate'
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <Button onClick={handleSave} disabled={isLoading} className='bg-yellow-500 hover:bg-yellow-600'>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
            <Button variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Email Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Send test email</DialogTitle>
            <DialogDescription>Send a test email to verify your {provider.name} configuration</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='test_email'>Email *</Label>
              <Input
                id='test_email'
                type='email'
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder='support@aistudio.com'
                className='border-orange-500 focus-visible:ring-orange-500'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='test_subject'>Subject *</Label>
              <Input
                id='test_subject'
                value={testSubject}
                onChange={e => setTestSubject(e.target.value)}
                placeholder='Test Email'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='test_body'>Body *</Label>
              <Textarea
                id='test_body'
                value={testBody}
                onChange={e => setTestBody(e.target.value)}
                placeholder='This is a test email.'
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSendTest} disabled={isSendingTest} className='bg-yellow-500 hover:bg-yellow-600'>
              {isSendingTest ? 'Sending...' : 'Send Test Email'}
            </Button>
            <Button variant='outline' onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
