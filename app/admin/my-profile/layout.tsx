// React Imports
import { ReactNode, Suspense } from 'react'

export default function AdminProfileLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className='flex min-h-screen items-center justify-center'>Loading...</div>}>
      {children}
    </Suspense>
  )
}
