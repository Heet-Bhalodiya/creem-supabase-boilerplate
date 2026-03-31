'use client'

// React Imports
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

// Third-Party Imports
import Cookies from 'js-cookie'

// Type Imports
import type { Database } from '@/supabase/types'
import type { Session } from '@supabase/supabase-js'

// Utility Imports
import { createClient } from '@/lib/supabase/client'
import {
  startImpersonation as startImpersonationAction,
  endImpersonation as endImpersonationAction
} from '@/lib/actions/users'
import { getUserPermissions } from '@/lib/permissions'

const IMPERSONATION_UI_STATE = 'impersonation_ui_state'

type Profile = Database['public']['Tables']['profiles']['Row']

type ImpersonationState = {
  isImpersonating: boolean
  originalUser: Profile | null
  impersonatedUser: Profile | null
}

type AuthState = {
  user: Profile | null
  isImpersonating: boolean
  originalUser: Profile | null
  impersonatedUser: Profile | null
}

const defaultImpersonationState: ImpersonationState = {
  isImpersonating: false,
  originalUser: null,
  impersonatedUser: null
}

const AuthContext = createContext<ReturnType<typeof useAuth> | undefined>(undefined)

function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    ...defaultImpersonationState
  })
  const [isInitialized, setIsInitialized] = useState(false)

  const getImpersonationStateFromCookie = (): ImpersonationState => {
    const cookieValue = Cookies.get(IMPERSONATION_UI_STATE)
    if (!cookieValue) return defaultImpersonationState

    try {
      return JSON.parse(cookieValue)
    } catch {
      return defaultImpersonationState
    }
  }

  useEffect(() => {
    let mounted = true
    const supabaseClient = createClient()

    const updateAuthState = async (session: Session | null) => {
      if (!mounted) return

      if (session?.user) {
        const { data: profileData } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData && mounted) {
          setAuthState(prev => ({ ...prev, user: profileData }))

          const cookieState = getImpersonationStateFromCookie()
          if (cookieState.isImpersonating) {
            setAuthState(prev => ({
              ...prev,
              isImpersonating: cookieState.isImpersonating,
              originalUser: cookieState.originalUser,
              impersonatedUser: cookieState.impersonatedUser
            }))
          }
        }
      } else {
        setAuthState({ user: null, ...defaultImpersonationState })

        const cookieState = getImpersonationStateFromCookie()
        if (cookieState.isImpersonating) {
          Cookies.remove(IMPERSONATION_UI_STATE)
        }
      }
    }

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session)

      if (!isInitialized) {
        setIsInitialized(true)
      }
    })

    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      updateAuthState(session)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const checkImpersonationState = () => {
      const cookieState = getImpersonationStateFromCookie()

      if (cookieState.isImpersonating !== authState.isImpersonating) {
        if (cookieState.isImpersonating) {
          setAuthState(prev => ({
            ...prev,
            isImpersonating: true,
            originalUser: cookieState.originalUser,
            impersonatedUser: cookieState.impersonatedUser
          }))
        } else {
          setAuthState(prev => ({
            ...prev,
            ...defaultImpersonationState
          }))
        }
      }
    }

    checkImpersonationState()

    const interval = setInterval(checkImpersonationState, 500)

    return () => clearInterval(interval)
  }, [authState.isImpersonating])

  const startImpersonation = async (targetUserId: string) => {
    const permissions = await getUserPermissions()
    if (!permissions?.includes('*') && !permissions?.includes('admin:impersonate')) {
      throw new Error('You do not have permission to impersonate users')
    }

    try {
      await startImpersonationAction(targetUserId)
    } catch (error) {
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        return
      }
      throw error
    }
  }

  const stopImpersonation = async () => {
    if (!authState.isImpersonating || !authState.originalUser) {
      return
    }

    try {
      setAuthState(prev => ({ ...prev, ...defaultImpersonationState }))

      Cookies.remove(IMPERSONATION_UI_STATE)

      await endImpersonationAction()
    } catch (error) {
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        return
      }
      throw error
    }
  }

  return {
    user: authState.isImpersonating ? authState.impersonatedUser : authState.user,
    isImpersonating: authState.isImpersonating,
    originalUser: authState.originalUser,
    impersonatedUser: authState.impersonatedUser,
    startImpersonation,
    stopImpersonation,
    isInitialized
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return context
}
