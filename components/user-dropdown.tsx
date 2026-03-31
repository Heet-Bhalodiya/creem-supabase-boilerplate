'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronDown, Settings, LayoutDashboard, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

type UserProfile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
}

type UserDropdownProps = {
  user: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
      avatar_url?: string
      role?: string
    }
  }
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Fetch profile from database
  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
    }

    fetchProfile()
  }, [user.id])

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const displayEmail = profile?.email || user.email || ''
  const displayRole = profile?.role || user.user_metadata?.role || 'user'
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url

  const initials = (profile?.full_name || displayName)
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const dashboardUrl = displayRole === 'admin' ? '/admin' : '/user'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='flex h-auto items-center gap-3 px-2 py-1.5'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
            </Avatar>
            <div className='hidden text-left sm:block'>
              <p className='text-sm leading-none font-medium'>{displayName}</p>
              <p className='text-muted-foreground mt-0.5 text-xs'>{displayEmail}</p>
            </div>
          </div>
          <ChevronDown className='text-muted-foreground h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuLabel>
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className='text-sm'>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-medium'>{displayName}</p>
              <p className='text-muted-foreground text-xs leading-none'>{displayEmail}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${displayRole}/my-profile`} className='cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={dashboardUrl} className='cursor-pointer'>
            <LayoutDashboard className='mr-2 h-4 w-4' />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className='cursor-pointer'>
          <LogOut className='mr-2 h-4 w-4' />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
