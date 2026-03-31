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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility Imports
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function SignUpForm({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            name,
            role
          }
        }
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
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
          <CardTitle className='text-2xl'>Create an account</CardTitle>
          <CardDescription>Join AI Content Studio and start creating amazing content with AI!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className='flex flex-col gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Full Name*</Label>
                <Input
                  id='name'
                  type='text'
                  placeholder='John Doe'
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email address*</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='m@example.com'
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
              <div className='grid gap-2'>
                <Label htmlFor='repeat-password'>Repeat Password*</Label>
                <PasswordInput
                  id='repeat-password'
                  placeholder='••••••••••'
                  required
                  value={repeatPassword}
                  onChange={e => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className='text-sm text-red-500'>{error}</p>}
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
            <div className='mt-6 text-center text-sm'>
              Already have an account?{' '}
              <Link href='/auth/login' className='text-primary font-medium hover:underline'>
                Sign in →
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
