import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Mail } from 'lucide-react'

export default function Page() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-md'>
        <Card>
          <CardHeader className='pb-4 text-center'>
            <div className='bg-primary/10 mx-auto mb-4 w-fit rounded-full p-3'>
              <CheckCircle2 className='text-primary h-8 w-8' />
            </div>
            <CardTitle className='text-2xl'>Check your email!</CardTitle>
            <CardDescription>We&apos;ve sent you a confirmation link to verify your email address.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='bg-muted rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <Mail className='text-muted-foreground mt-0.5 h-5 w-5 shrink-0' />
                <div className='text-sm'>
                  <p className='mb-2 font-medium'>Next Steps:</p>
                  <ol className='text-muted-foreground list-inside list-decimal space-y-1.5'>
                    <li>Check your email inbox</li>
                    <li>Click the confirmation link</li>
                    <li>Sign in to your account</li>
                  </ol>
                </div>
              </div>
            </div>
            <p className='text-muted-foreground text-center text-xs'>
              Didn&apos;t receive an email? Check your spam folder or contact support.
            </p>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/auth/login'>Go to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
