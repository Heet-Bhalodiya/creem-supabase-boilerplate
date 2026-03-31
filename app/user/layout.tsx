import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReactNode, Suspense } from 'react'
import { NotificationDropdown } from '@/components/notification-dropdown'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserDropdown } from '@/components/user-dropdown'
import { isImpersonating } from '@/lib/actions/users'

async function DashboardAuth({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if currently impersonating
  const impersonatingNow = await isImpersonating()

  // Get user role from profiles table
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  // Only redirect to admin if user is admin AND NOT impersonating
  if (profile?.role === 'admin' && !impersonatingNow) {
    redirect('/admin')
  }

  return (
    <>
      <AppSidebar />
      <main className='flex-1'>
        <div className='border-b'>
          <div className='flex h-16 items-center justify-between px-4'>
            <div className='flex items-center gap-4'>
              <SidebarTrigger />
              <h1 className='text-lg font-semibold'>Dashboard</h1>
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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <div className='flex min-h-screen w-full'>
          <Suspense
            fallback={
              <div className='flex min-h-screen w-full items-center justify-center'>
                <div className='text-muted-foreground'>Loading...</div>
              </div>
            }
          >
            <DashboardAuth>{children}</DashboardAuth>
          </Suspense>
        </div>
      </SidebarProvider>
    </>
  )
}
