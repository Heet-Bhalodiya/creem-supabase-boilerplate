'use client'

import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/hooks/use-auth'
import { LogOut, User } from 'lucide-react'
import { toast } from '@/lib/toast'
import { useState } from 'react'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, stopImpersonation } = useAuthContext()
  const [isEnding, setIsEnding] = useState(false)

  if (!isImpersonating || !impersonatedUser) return null

  const handleEndImpersonation = async () => {
    setIsEnding(true)
    try {
      await stopImpersonation()
    } catch (error) {
      // Ignore NEXT_REDIRECT error (expected)
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        return
      }
      toast('error', 'Failed to end impersonation')
      setIsEnding(false)
    }
  }

  return (
    <div className='border-b border-yellow-400 bg-yellow-50 px-4 py-3 dark:bg-yellow-950'>
      <div className='container flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200 dark:bg-yellow-900'>
            <User className='h-4 w-4 text-yellow-900 dark:text-yellow-100' />
          </div>
          <div>
            <p className='text-sm font-semibold text-yellow-900 dark:text-yellow-100'>Impersonating User</p>
            <p className='text-xs text-yellow-800 dark:text-yellow-200'>
              {impersonatedUser.full_name || impersonatedUser.email || 'Unknown User'}
            </p>
          </div>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={handleEndImpersonation}
          disabled={isEnding}
          className='bg-white dark:bg-gray-800'
        >
          <LogOut className='mr-2 h-4 w-4' />
          End Impersonation
        </Button>
      </div>
    </div>
  )
}
