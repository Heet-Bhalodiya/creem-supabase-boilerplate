'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/lib/toast'
import { updateOpenGraphSettings, type OpenGraphSettings } from '@/lib/actions/app-settings'
import { Loader2 } from 'lucide-react'

type OpenGraphSettingsFormProps = {
  initialSettings: OpenGraphSettings
}

export function OpenGraphSettingsForm({ initialSettings }: OpenGraphSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<OpenGraphSettings>(initialSettings)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateOpenGraphSettings(settings)
      toast('success', 'Open Graph settings have been updated successfully')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePreview = () => {
    // Open OG image preview in new window with current settings
    const params = new URLSearchParams({
      title: settings.preview_title,
      template: settings.template,
      start_color: settings.start_color,
      end_color: settings.end_color,
      text_color: settings.text_color
    })
    window.open(`/og?${params.toString()}`, '_blank')
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Open Graph Images</CardTitle>
          <CardDescription>Configure automatic Open Graph image generation for each page with a title</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Enable Toggle */}
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Open Graph Image Generation Enabled</Label>
              <p className='text-muted-foreground text-sm'>
                If enabled, an open graph image will be generated for each page that has a title
              </p>
            </div>
            <Switch checked={settings.enabled} onCheckedChange={enabled => setSettings({ ...settings, enabled })} />
          </div>

          {/* Add Logo */}
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Add Logo</Label>
              <p className='text-muted-foreground text-sm'>
                If enabled, the logo will be added to the open graph image
              </p>
            </div>
            <Switch checked={settings.add_logo} onCheckedChange={add_logo => setSettings({ ...settings, add_logo })} />
          </div>

          {/* Logo Style */}
          <div className='space-y-2'>
            <Label>Logo Style</Label>
            <p className='text-muted-foreground text-sm'>Choose the style of the logo to use in the open graph image</p>
            <div className='flex gap-4'>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='logo_style'
                  value='light'
                  checked={settings.logo_style === 'light'}
                  onChange={e => setSettings({ ...settings, logo_style: e.target.value as 'light' | 'dark' })}
                  className='h-4 w-4'
                />
                <span>Light</span>
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='logo_style'
                  value='dark'
                  checked={settings.logo_style === 'dark'}
                  onChange={e => setSettings({ ...settings, logo_style: e.target.value as 'light' | 'dark' })}
                  className='h-4 w-4'
                />
                <span>Dark</span>
              </label>
            </div>
          </div>

          {/* Add Screenshot */}
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>Add Page Screenshot</Label>
              <p className='text-muted-foreground text-sm'>
                If enabled, a screenshot of the page will be added to the open graph image
              </p>
            </div>
            <Switch
              checked={settings.add_screenshot}
              onCheckedChange={add_screenshot => setSettings({ ...settings, add_screenshot })}
            />
          </div>

          {/* Template */}
          <div className='space-y-2'>
            <Label>Template</Label>
            <p className='text-muted-foreground text-sm'>
              Select the template to use for the open graph image. Changing the template or any of the settings will
              regenerate all open graph images for your pages
            </p>
            <Select value={settings.template} onValueChange={template => setSettings({ ...settings, template })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='stripes'>Stripes</SelectItem>
                <SelectItem value='gradient'>Gradient</SelectItem>
                <SelectItem value='solid'>Solid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Settings */}
          <CardTitle className='text-base'>Template Settings</CardTitle>

          {/* Start Color */}
          <div className='grid gap-2'>
            <Label htmlFor='start-color'>Start Color</Label>
            <div className='flex gap-4'>
              <Input
                id='start-color'
                type='color'
                value={settings.start_color}
                onChange={e => setSettings({ ...settings, start_color: e.target.value })}
                className='h-10 w-20'
              />
              <Input
                type='text'
                value={settings.start_color}
                onChange={e => setSettings({ ...settings, start_color: e.target.value })}
                placeholder='#6c9cc'
              />
            </div>
          </div>

          {/* End Color */}
          <div className='grid gap-2'>
            <Label htmlFor='end-color'>End Color</Label>
            <div className='flex gap-4'>
              <Input
                id='end-color'
                type='color'
                value={settings.end_color}
                onChange={e => setSettings({ ...settings, end_color: e.target.value })}
                className='h-10 w-20'
              />
              <Input
                type='text'
                value={settings.end_color}
                onChange={e => setSettings({ ...settings, end_color: e.target.value })}
                placeholder='#6000fa'
              />
            </div>
          </div>

          {/* Text Color */}
          <div className='grid gap-2'>
            <Label htmlFor='text-color'>Text Color</Label>
            <div className='flex gap-4'>
              <Input
                id='text-color'
                type='color'
                value={settings.text_color}
                onChange={e => setSettings({ ...settings, text_color: e.target.value })}
                className='h-10 w-20'
              />
              <Input
                type='text'
                value={settings.text_color}
                onChange={e => setSettings({ ...settings, text_color: e.target.value })}
                placeholder='#ffffff'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='preview-title'>Preview Title</Label>
            <Input
              id='preview-title'
              value={settings.preview_title}
              onChange={e => setSettings({ ...settings, preview_title: e.target.value })}
              placeholder='Enter a title to use to preview the open graph image'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='preview-image'>Preview Image</Label>
            <Input
              id='preview-image'
              value={settings.preview_image}
              onChange={e => setSettings({ ...settings, preview_image: e.target.value })}
              placeholder='Enter an image URL to use to preview the open graph image'
            />
            <p className='text-muted-foreground text-sm'>
              (either image or snapshot will be used, not both, snapshot takes precedence).
            </p>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='preview-url'>Preview Snapshot URL</Label>
            <Input
              id='preview-url'
              value={settings.preview_url}
              onChange={e => setSettings({ ...settings, preview_url: e.target.value })}
              placeholder='Enter a URL of a site to take a snapshot of to preview the open graph image'
            />
            <p className='text-muted-foreground text-sm'>
              (either image or snapshot will be used, not both, snapshot takes precedence). Make sure above &quot;Add
              Page Screenshot&quot; is enabled.
            </p>
          </div>
          <Button onClick={handleGeneratePreview} variant='outline' className='w-full'>
            Generate Preview
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading} className='w-full bg-yellow-500 hover:bg-yellow-600'>
        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
        Save Changes
      </Button>
    </div>
  )
}
