import { LoginForm } from '@/components/login-form'
import { AuthPageRedirect } from '@/components/auth-page-redirect'

export default function Page() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <AuthPageRedirect />
      <div className='w-full max-w-sm'>
        <LoginForm />
      </div>
    </div>
  )
}
