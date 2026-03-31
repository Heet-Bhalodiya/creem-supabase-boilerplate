// Next Imports
import { redirect } from 'next/navigation'

// React Imports
import { ReactNode, Suspense } from 'react'

// Component Imports
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin-sidebar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationDropdown } from '@/components/notification-dropdown'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserDropdown } from '@/components/user-dropdown'

// Utility Imports
import { isImpersonating } from '@/lib/actions/users'
import { createClient } from '@/lib/supabase/server'

async function AdminAuth({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if currently impersonating - redirect to user dashboard
  const impersonatingNow = await isImpersonating()
  if (impersonatingNow) {
    redirect('/user')
  }

  // Check if user has admin role from profiles table
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    redirect('/user') // Redirect non-admins to user dashboard
  }

  return (
    <>
      <AdminSidebar />
      <main className='flex-1'>
        <div className='border-b'>
          <div className='flex h-16 items-center justify-between px-4'>
            <div className='flex items-center gap-4'>
              <SidebarTrigger />
              <h1 className='text-lg font-semibold'>Admin Panel</h1>
            </div>
            <div className='flex items-center gap-2'>
              <ThemeSwitcher />
              <NotificationDropdown />
              <UserDropdown user={user} />
            </div>
          </div>
        </div>
        <div className='flex-1 p-6'>
          <div className='mx-auto max-w-7xl'>{children}</div>
        </div>
      </main>
    </>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full'>
        <Suspense
          fallback={
            <div className='flex min-h-screen w-full items-center justify-center'>
              <div className='text-muted-foreground'>Loading...</div>
            </div>
          }
        >
          <AdminAuth>{children}</AdminAuth>
        </Suspense>
      </div>
    </SidebarProvider>
  )
}
