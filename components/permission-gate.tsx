'use client'

import { ReactNode, useEffect, useState } from 'react'

type PermissionGateProps = {
  children: ReactNode
  permissions: string | string[]
  requireAll?: boolean
  fallback?: ReactNode
}

export function PermissionGate({ children, permissions, requireAll = false, fallback = null }: PermissionGateProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkPermissions() {
      try {
        const response = await fetch('/api/permissions/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions, requireAll })
        })

        const data = await response.json()
        setHasAccess(data.hasAccess)
      } catch (error) {
        console.error('Permission check failed:', error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermissions()
  }, [permissions, requireAll])

  if (isLoading) return null
  if (!hasAccess) return fallback

  return <>{children}</>
}
