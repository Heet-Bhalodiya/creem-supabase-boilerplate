'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/lib/toast'

export function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false)

  const [settings, setSettings] = useState({
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
    requireStrongPassword: true,
    allowSocialLogin: true,
    ipWhitelist: ''
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In production, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast('success', 'Security settings have been updated successfully')
    } catch {
      toast('error', 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Configure security and authentication settings</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Authentication Settings */}
        <div className='space-y-4'>
          <h4 className='font-medium'>Authentication</h4>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='requireEmailVerification'>Require Email Verification</Label>
              <p className='text-muted-foreground text-sm'>
                Users must verify their email before accessing the application
              </p>
            </div>
            <Switch
              id='requireEmailVerification'
              checked={settings.requireEmailVerification}
              onCheckedChange={checked => setSettings({ ...settings, requireEmailVerification: checked })}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='enableTwoFactor'>Enable Two-Factor Authentication</Label>
              <p className='text-muted-foreground text-sm'>Allow users to enable 2FA for additional security</p>
            </div>
            <Switch
              id='enableTwoFactor'
              checked={settings.enableTwoFactor}
              onCheckedChange={checked => setSettings({ ...settings, enableTwoFactor: checked })}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='allowSocialLogin'>Allow Social Login</Label>
              <p className='text-muted-foreground text-sm'>Enable login with Google, GitHub, etc.</p>
            </div>
            <Switch
              id='allowSocialLogin'
              checked={settings.allowSocialLogin}
              onCheckedChange={checked => setSettings({ ...settings, allowSocialLogin: checked })}
            />
          </div>
        </div>

        {/* Session Settings */}
        <div className='space-y-4 border-t pt-4'>
          <h4 className='font-medium'>Session Management</h4>

          <div className='grid gap-2'>
            <Label htmlFor='sessionTimeout'>Session Timeout (hours)</Label>
            <Input
              id='sessionTimeout'
              type='number'
              value={settings.sessionTimeout}
              onChange={e => setSettings({ ...settings, sessionTimeout: e.target.value })}
              placeholder='24'
            />
            <p className='text-muted-foreground text-sm'>Users will be logged out after this period of inactivity</p>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='maxLoginAttempts'>Max Login Attempts</Label>
            <Input
              id='maxLoginAttempts'
              type='number'
              value={settings.maxLoginAttempts}
              onChange={e => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
              placeholder='5'
            />
            <p className='text-muted-foreground text-sm'>Lock account after this many failed login attempts</p>
          </div>
        </div>

        {/* Password Policy */}
        <div className='space-y-4 border-t pt-4'>
          <h4 className='font-medium'>Password Policy</h4>

          <div className='grid gap-2'>
            <Label htmlFor='passwordMinLength'>Minimum Password Length</Label>
            <Input
              id='passwordMinLength'
              type='number'
              value={settings.passwordMinLength}
              onChange={e => setSettings({ ...settings, passwordMinLength: e.target.value })}
              placeholder='8'
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='requireStrongPassword'>Require Strong Password</Label>
              <p className='text-muted-foreground text-sm'>
                Passwords must include uppercase, lowercase, numbers, and special characters
              </p>
            </div>
            <Switch
              id='requireStrongPassword'
              checked={settings.requireStrongPassword}
              onCheckedChange={checked => setSettings({ ...settings, requireStrongPassword: checked })}
            />
          </div>
        </div>

        {/* Advanced Security */}
        <div className='space-y-4 border-t pt-4'>
          <h4 className='font-medium'>Advanced Security</h4>

          <div className='grid gap-2'>
            <Label htmlFor='ipWhitelist'>IP Whitelist (Admin Access)</Label>
            <Input
              id='ipWhitelist'
              value={settings.ipWhitelist}
              onChange={e => setSettings({ ...settings, ipWhitelist: e.target.value })}
              placeholder='192.168.1.1, 10.0.0.1'
            />
            <p className='text-muted-foreground text-sm'>
              Comma-separated list of IP addresses allowed to access admin panel (leave empty to allow all)
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className='w-full sm:w-auto'>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  )
}
