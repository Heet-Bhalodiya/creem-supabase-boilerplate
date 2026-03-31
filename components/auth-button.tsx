import Link from 'next/link'
import { Button } from './ui/button'
import { createClient } from '@/lib/supabase/server'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User2, Settings, LogOut } from 'lucide-react'

export async function AuthButton() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className='flex gap-2'>
        <Button asChild size='sm' variant={'outline'}>
          <Link href='/auth/login'>Sign in</Link>
        </Button>
        <Button asChild size='sm' variant={'default'}>
          <Link href='/auth/sign-up'>Sign up</Link>
        </Button>
      </div>
    )
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={user.user_metadata?.avatar_url} alt={userName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-1 leading-none'>
            <p className='font-medium'>{userName}</p>
            <p className='text-muted-foreground text-xs'>{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={user.user_metadata?.role === 'admin' ? '/admin' : '/user'}>
            <User2 className='mr-2 h-4 w-4' />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href='user/my-profile'>
            <Settings className='mr-2 h-4 w-4' />
            My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action='/auth/sign-out' method='post' className='w-full'>
            <button type='submit' className='flex w-full items-center'>
              <LogOut className='mr-2 h-4 w-4' />
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
