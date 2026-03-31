'use client'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// React Imports
import { ComponentPropsWithoutRef, FormEvent, useState } from 'react'

// Component Imports
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility Imports
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function LoginForm({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [magicLinkEmail, setMagicLinkEmail] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()

  const handleRoleChange = (newRole: 'user' | 'admin') => {
    setRole(newRole)
    // Auto-fill demo credentials
    if (newRole === 'admin') {
      setEmail('admin@example.com')
      setPassword('admin@123')
    } else {
      setEmail('user@example.com')
      setPassword('user@123')
    }
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      // Update user metadata with role
      if (data.user) {
        await supabase.auth.updateUser({
          data: { role }
        })

        // Redirect based on role
        if (role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/user')
        }
        router.refresh()
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: magicLinkEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            role
          }
        }
      })
      if (error) throw error
      setMagicLinkSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>Sign in to AI Content Studio</CardTitle>
          <CardDescription>Create Amazing Content with AI</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Selection */}
          <div className='mb-6 flex gap-2'>
            <Button
              type='button'
              variant={role === 'user' ? 'default' : 'outline'}
              className='flex-1'
              onClick={() => handleRoleChange('user')}
            >
              Login as User
            </Button>
            <Button
              type='button'
              variant={role === 'admin' ? 'default' : 'outline'}
              className='flex-1'
              onClick={() => handleRoleChange('admin')}
            >
              Login as Admin
            </Button>
          </div>

          <Tabs defaultValue='password' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='password'>Password</TabsTrigger>
              <TabsTrigger value='magic-link'>Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value='password'>
              <form onSubmit={handleLogin} className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email address*</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email address'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='password'>Password*</Label>
                  <PasswordInput
                    id='password'
                    placeholder='••••••••••'
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div className='flex justify-end'>
                  <Link href='/auth/forgot-password' className='text-primary text-sm hover:underline'>
                    Forgot Password?
                  </Link>
                </div>
                {error && <p className='text-sm text-red-500'>{error}</p>}
                <Button type='submit' className='w-full' disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in to AI Content Studio'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value='magic-link'>
              {magicLinkSent ? (
                <div className='space-y-4 py-4 text-center'>
                  <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20'>
                    <svg
                      className='h-6 w-6 text-green-600 dark:text-green-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                  </div>
                  <div>
                    <h3 className='font-semibold'>Check your email</h3>
                    <p className='text-muted-foreground mt-2 text-sm'>
                      We sent a magic link to <strong>{magicLinkEmail}</strong>
                    </p>
                    <p className='text-muted-foreground mt-2 text-xs'>Click the link in the email to sign in.</p>
                  </div>
                  <Button variant='outline' onClick={() => setMagicLinkSent(false)} className='w-full'>
                    Send another link
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className='space-y-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='magic-email'>Email*</Label>
                    <Input
                      id='magic-email'
                      type='email'
                      placeholder='Enter your email'
                      required
                      value={magicLinkEmail}
                      onChange={e => setMagicLinkEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className='text-sm text-red-500'>{error}</p>}
                  <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send magic link'}
                  </Button>
                  <p className='text-muted-foreground text-center text-xs'>
                    We&apos;ll email you a magic link for a password-free sign in.
                  </p>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className='mt-6 text-center text-sm'>
            New on our platform?{' '}
            <Link href='/auth/sign-up' className='text-primary font-medium hover:underline'>
              Create account →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
