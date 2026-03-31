'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthPageRedirect() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        // Redirect logged-in users away from auth pages
        if (user.user_metadata?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/user')
        }
      }
    }

    checkUser()
  }, [router])

  return null
}
