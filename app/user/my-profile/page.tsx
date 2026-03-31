'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, ChangeEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { PasswordInput } from '@/components/ui/password-input'
import { getEffectiveUserProfile, updateProfile, changePassword, uploadProfilePhoto } from '@/lib/actions/users'
import { toast } from '@/lib/toast'
import { Camera, Loader2, Edit2, X, Check } from 'lucide-react'
import type { Database } from '@/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function MyProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const profileData = await getEffectiveUserProfile()

      if (!profileData) {
        router.push('/auth/login')
      } else {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
      }
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSaveProfile = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      await updateProfile({ full_name: fullName })
      setProfile({ ...profile, full_name: fullName })
      setIsEditing(false)
      toast('success', 'Profile updated successfully!')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      toast('error', 'File size must be less than 2MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast('error', 'Only JPG, JPEG, and PNG files are allowed')
      return
    }

    setIsUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadProfilePhoto(formData)
      if (profile) {
        setProfile({ ...profile, avatar_url: result.url })
      }
      toast('success', 'Profile photo updated!')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to upload photo')
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('error', 'Please fill in all password fields')
      return
    }

    if (currentPassword === newPassword) {
      toast('error', 'New password must be different from current password')
      return
    }

    if (newPassword !== confirmPassword) {
      toast('error', 'New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast('error', 'Password must be at least 8 characters')
      return
    }

    setIsChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast('success', 'Password changed successfully!')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSaveNotifications = () => {
    toast('success', 'Notification preferences saved!')
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const userName = profile.full_name || profile.email?.split('@')[0] || 'User'
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className='bg-background min-h-screen'>
      <div className='container max-w-4xl px-4 py-8'>
        {/* Profile Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-6'>
            <div className='relative'>
              <Avatar className='h-24 w-24'>
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className='text-3xl'>{initials}</AvatarFallback>
              </Avatar>
              <Button
                size='icon'
                variant='secondary'
                className='absolute right-0 bottom-0 h-8 w-8 rounded-full'
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? <Loader2 className='h-4 w-4 animate-spin' /> : <Camera className='h-4 w-4' />}
              </Button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/jpg,image/png'
                className='hidden'
                onChange={handlePhotoUpload}
              />
            </div>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h1 className='text-3xl font-bold'>{userName}</h1>
                <Badge variant='secondary'>{profile.role === 'admin' ? 'Admin' : 'User'}</Badge>
              </div>
              <p className='text-muted-foreground'>{profile.email}</p>
              <p className='text-muted-foreground text-xs'>Max 2MB • JPG, JPEG, PNG only</p>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue='profile' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='profile'>Profile</TabsTrigger>
            <TabsTrigger value='security'>Security</TabsTrigger>
            <TabsTrigger value='notifications'>Notifications</TabsTrigger>
            <TabsTrigger value='preferences'>Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value='profile'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                      <Edit2 className='mr-2 h-4 w-4' />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <div className='flex gap-2'>
                    <Input
                      id='name'
                      value={isEditing ? fullName : profile.full_name || ''}
                      onChange={e => setFullName(e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                    {isEditing && (
                      <div className='flex gap-2'>
                        <Button size='icon' variant='default' onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? <Loader2 className='h-4 w-4 animate-spin' /> : <Check className='h-4 w-4' />}
                        </Button>
                        <Button
                          size='icon'
                          variant='outline'
                          onClick={() => {
                            setIsEditing(false)
                            setFullName(profile.full_name || '')
                          }}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' type='email' value={profile.email || ''} readOnly className='bg-muted' />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='role'>Role</Label>
                  <Input id='role' value={profile.role === 'admin' ? 'Admin' : 'User'} readOnly className='bg-muted' />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='user-id'>User ID</Label>
                  <Input id='user-id' value={profile.id} readOnly className='bg-muted font-mono text-xs' />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value='security'>
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='current-password'>Current Password</Label>
                  <PasswordInput
                    id='current-password'
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder='Enter your current password'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='new-password'>New Password</Label>
                  <PasswordInput
                    id='new-password'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder='Enter new password (min 8 characters)'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='confirm-password'>Confirm New Password</Label>
                  <PasswordInput
                    id='confirm-password'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder='Confirm new password'
                  />
                </div>

                <Separator />

                <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value='notifications'>
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='email-notifications'>Email Notifications</Label>
                    <p className='text-muted-foreground text-sm'>
                      Receive email notifications about your account activity
                    </p>
                  </div>
                  <Switch
                    id='email-notifications'
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='push-notifications'>Push Notifications</Label>
                    <p className='text-muted-foreground text-sm'>Receive push notifications in your browser</p>
                  </div>
                  <Switch id='push-notifications' checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>

                <Separator />

                <Button onClick={handleSaveNotifications}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value='preferences'>
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid gap-2'>
                  <Label htmlFor='language'>Language</Label>
                  <Input id='language' value='English (US)' readOnly className='bg-muted' />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='timezone'>Timezone</Label>
                  <Input id='timezone' value='America/New_York (EST)' readOnly className='bg-muted' />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='date-format'>Date Format</Label>
                  <Input id='date-format' value='MM/DD/YYYY' readOnly className='bg-muted' />
                </div>

                <div className='border-t pt-4'>
                  <p className='text-muted-foreground text-sm'>
                    Preference customization will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
