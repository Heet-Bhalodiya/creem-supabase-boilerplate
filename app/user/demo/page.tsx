import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DemoActions } from '@/components/demo-actions'
import { getCreditWallet } from '@/lib/actions/credits'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function DemoContent() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's credit balance
  const walletResult = await getCreditWallet()
  const balance = walletResult.success && walletResult.data?.balance ? walletResult.data.balance : 0

  return (
    <div className='space-y-6'>
      {/* Credit Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Credit Balance</CardTitle>
          <CardDescription>Available credits for AI content creation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-primary text-4xl font-bold'>{balance.toLocaleString()} Credits</div>
          <p className='text-muted-foreground mt-2 text-sm'>
            Each AI content creation action costs credits. Try them out to see the studio in action!
          </p>
        </CardContent>
      </Card>

      {/* Demo Actions */}
      <div className='grid gap-4 md:grid-cols-2'>
        <DemoActions balance={balance} />
      </div>

      {/* Info Card */}
      <Card className='border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20'>
        <CardHeader>
          <CardTitle className='text-blue-900 dark:text-blue-100'>How Credits Work</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-blue-800 dark:text-blue-200'>
          <p>
            <strong>💰 Earn Credits:</strong> Subscribe to a plan or purchase credit packs
          </p>
          <p>
            <strong>🎯 Use Credits:</strong> Each action below deducts credits from your balance
          </p>
          <p>
            <strong>📊 Track Usage:</strong> View your transaction history in the Credits page
          </p>
          <p>
            <strong>🔄 Auto Top-up:</strong> Subscription plans automatically refill credits each billing cycle
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DemoPage() {
  return (
    <div className='container max-w-4xl py-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>AI Content Studio</h1>
        <p className='text-muted-foreground'>
          Create professional content with AI-powered tools. Generate copy, images, analyze documents, and more.
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className='py-8 text-center'>Loading...</CardContent>
          </Card>
        }
      >
        <DemoContent />
      </Suspense>
    </div>
  )
}
