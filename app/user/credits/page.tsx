// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowUpCircle, ArrowDownCircle, Coins, TrendingUp, Clock, AlertCircleIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Utility Imports
import { getCreditWallet, getCreditTransactions } from '@/lib/actions/credits'

export default async function CreditsPage() {
  const [walletResult, transactionsResult] = await Promise.all([getCreditWallet(), getCreditTransactions(20)])

  const wallet = walletResult.data
  const transactions = transactionsResult.data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'refunded':
        return <ArrowUpCircle className='h-4 w-4 text-green-500' />
      case 'spent':
      case 'expired':
        return <ArrowDownCircle className='h-4 w-4 text-red-500' />
      default:
        return <Coins className='h-4 w-4 text-gray-500' />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
      case 'refunded':
        return 'text-green-600'
      case 'spent':
      case 'expired':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSourceBadge = (source: string) => {
    const sourceMap = {
      subscription: { label: 'Subscription', variant: 'default' as const },
      purchase: { label: 'Purchase', variant: 'default' as const },
      bonus: { label: 'Bonus', variant: 'secondary' as const },
      refund: { label: 'Refund', variant: 'outline' as const },
      usage: { label: 'Usage', variant: 'destructive' as const },
      expiration: { label: 'Expired', variant: 'destructive' as const }
    }

    return sourceMap[source as keyof typeof sourceMap] || { label: source, variant: 'outline' as const }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Credits</h2>
        <p className='text-muted-foreground'>Manage your AI content credits and view transaction history</p>
      </div>

      {/* Info Alert - Show when balance is low or zero */}
      {wallet && wallet.balance === 0 ? (
        <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20'>
          <div className='flex items-start gap-3'>
            <AlertCircleIcon className='h-5 w-5 text-amber-600 dark:text-amber-500' />
            <div className='flex-1'>
              <h3 className='mb-1 text-sm font-semibold text-amber-900 dark:text-amber-100'>
                Your credit balance is empty
              </h3>
              <p className='mb-3 text-sm text-amber-800 dark:text-amber-200'>
                Purchase credits or subscribe to a plan to start creating content. Visit the{' '}
                <Link href='/user/pricing' className='font-medium underline'>
                  Pricing page
                </Link>{' '}
                to view available plans and credit packages.
              </p>
            </div>
          </div>
        </div>
      ) : wallet && wallet.balance < 10 ? (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20'>
          <div className='flex items-start gap-3'>
            <AlertCircleIcon className='h-5 w-5 text-blue-600 dark:text-blue-500' />
            <div className='flex-1'>
              <h3 className='mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100'>Running low on credits</h3>
              <p className='text-sm text-blue-800 dark:text-blue-200'>
                You have {wallet.balance} credits remaining. Consider purchasing more credits or upgrading your plan to
                continue creating content. Visit the{' '}
                <Link href='/user/pricing' className='font-medium underline'>
                  Pricing page
                </Link>{' '}
                to view available plans and credit packages.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Credit Balance Overview */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Current Balance</CardTitle>
            <Coins className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{wallet?.balance.toLocaleString()} credits</div>
            <p className='text-muted-foreground text-xs'>Available for use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Earned</CardTitle>
            <TrendingUp className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{wallet?.total_earned.toLocaleString()} credits</div>
            <p className='text-muted-foreground text-xs'>Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Spent</CardTitle>
            <Clock className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{wallet?.total_spent.toLocaleString()} credits</div>
            <p className='text-muted-foreground text-xs'>Lifetime usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent credit transactions and activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        {getTransactionIcon(transaction.type)}
                        <span className={`capitalize ${getTransactionColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getTransactionColor(transaction.type)}>
                        {transaction.type === 'earned' || transaction.type === 'refunded' ? '+' : '-'}
                        {transaction.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className='max-w-xs truncate'>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant={getSourceBadge(transaction.source).variant}>
                        {getSourceBadge(transaction.source).label}
                      </Badge>
                    </TableCell>
                    <TableCell className='font-mono'>{transaction.balance_after.toLocaleString()}</TableCell>
                    <TableCell className='text-muted-foreground'>{formatDate(transaction.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className='text-muted-foreground py-8 text-center'>
              <Coins className='mx-auto mb-4 h-12 w-12 opacity-50' />
              <p className='text-lg font-medium'>No transactions yet</p>
              <p className='text-sm'>Your credit transactions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How Credits Work */}
      <Card>
        <CardHeader>
          <CardTitle>How Credits Work</CardTitle>
          <CardDescription>Understanding your credit system</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <h4 className='text-sm font-semibold text-green-600'>Earning Credits</h4>
              <ul className='text-muted-foreground space-y-1 text-sm'>
                <li>• Monthly subscription renewal</li>
                <li>• One-time credit purchases</li>
                <li>• Bonus credits and promotions</li>
                <li>• Refunds from failed actions</li>
              </ul>
            </div>
            <div className='space-y-2'>
              <h4 className='text-sm font-semibold text-red-600'>Spending Credits</h4>
              <ul className='text-muted-foreground space-y-1 text-sm'>
                <li>• AI generations and processing</li>
                <li>• Premium feature usage</li>
                <li>• API calls and requests</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
