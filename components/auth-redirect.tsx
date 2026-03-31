'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      // Only redirect away from auth pages if logged in
      if (user && pathname?.startsWith('/auth/')) {
        const role = user.user_metadata?.role || 'user'
        if (role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/user')
        }
      }
    }

    checkUser()
  }, [router, pathname])

  return null
}
