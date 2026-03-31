'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/lib/toast'

export function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const [settings, setSettings] = useState({
    appName: 'AI Content Studio',
    appUrl: 'https://yourdomain.com',
    description: 'Professional AI-powered content creation platform for marketers, creators, and businesses',
    supportEmail: 'support@yourdomain.com',
    allowSignups: true,
    maintenanceMode: false
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In production, this would save to database
      // For now, just show success
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast('success', 'General settings have been updated successfully')
    } catch {
      toast('error', 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Update your application&apos;s general information</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid gap-2'>
          <Label htmlFor='appName'>Application Name</Label>
          <Input
            id='appName'
            value={settings.appName}
            onChange={e => setSettings({ ...settings, appName: e.target.value })}
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='appUrl'>Application URL</Label>
          <Input
            id='appUrl'
            type='url'
            value={settings.appUrl}
            onChange={e => setSettings({ ...settings, appUrl: e.target.value })}
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            value={settings.description}
            onChange={e => setSettings({ ...settings, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='supportEmail'>Support Email</Label>
          <Input
            id='supportEmail'
            type='email'
            value={settings.supportEmail}
            onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
          />
        </div>

        <div className='space-y-4 pt-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='allowSignups'>Allow New Signups</Label>
              <p className='text-muted-foreground text-sm'>Allow new users to create accounts</p>
            </div>
            <Switch
              id='allowSignups'
              checked={settings.allowSignups}
              onCheckedChange={checked => setSettings({ ...settings, allowSignups: checked })}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='maintenanceMode'>Maintenance Mode</Label>
              <p className='text-muted-foreground text-sm'>Temporarily disable the application for maintenance</p>
            </div>
            <Switch
              id='maintenanceMode'
              checked={settings.maintenanceMode}
              onCheckedChange={checked => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className='w-full sm:w-auto'>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  )
}
