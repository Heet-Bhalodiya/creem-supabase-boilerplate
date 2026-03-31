import { SignUpForm } from '@/components/sign-up-form'
import { AuthPageRedirect } from '@/components/auth-page-redirect'

export default function Page() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <AuthPageRedirect />
      <div className='w-full max-w-sm'>
        <SignUpForm />
      </div>
    </div>
  )
}
