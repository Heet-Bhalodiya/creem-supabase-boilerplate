'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Filter, Download, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

type CreemSubscription = {
  id: string
  user_id: string
  creem_subscription_id: string
  creem_customer_id: string
  creem_product_id: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  created_at: string
  updated_at: string
  profile?: {
    full_name: string
    email: string
  }
}

export function CreemSubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState<CreemSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadSubscriptions = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('creem_subscriptions')
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            email
          )
        `
        )
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading subscriptions:', error)
        toast('error', 'Failed to load subscriptions')
        return
      }

      setSubscriptions(data || [])
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      toast('error', 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch =
      subscription.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.creem_subscription_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const exportSubscriptions = () => {
    const csvContent = [
      'Subscription ID,Customer Email,Customer Name,Status,Product ID,Current Period Start,Current Period End,Cancel at Period End,Created At',
      ...filteredSubscriptions.map(
        sub =>
          `${sub.creem_subscription_id},${sub.profile?.email || ''},${sub.profile?.full_name || ''},${sub.status},${sub.creem_product_id},${sub.current_period_start},${sub.current_period_end},${sub.cancel_at_period_end},${sub.created_at}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `creem-subscriptions-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Filters and Search */}
      <div className='flex flex-col gap-4 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
          <Input
            placeholder='Search by email, name, or subscription ID...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <Filter className='mr-2 h-4 w-4' />
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='paused'>Paused</SelectItem>
            <SelectItem value='canceled'>Canceled</SelectItem>
            <SelectItem value='expired'>Expired</SelectItem>
          </SelectContent>
        </Select>

        <Button variant='outline' onClick={exportSubscriptions}>
          <Download className='mr-2 h-4 w-4' />
          Export CSV
        </Button>
      </div>

      {/* Results Count */}
      <div className='text-muted-foreground text-sm'>
        Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
      </div>

      {/* Subscriptions Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Current Period</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-muted-foreground py-8 text-center'>
                  {subscriptions.length === 0 ? 'No subscriptions found' : 'No subscriptions match your filters'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map(subscription => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback>
                          {subscription.profile?.full_name
                            ?.split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>{subscription.profile?.full_name || 'Unknown User'}</div>
                        <div className='text-muted-foreground text-sm'>{subscription.profile?.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                      {subscription.cancel_at_period_end && subscription.status === 'active' && (
                        <span className='ml-1'>• ending</span>
                      )}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className='text-sm'>
                      <div>{subscription.creem_product_id}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='text-sm'>
                      <div>{formatDate(subscription.current_period_start)}</div>
                      <div className='text-muted-foreground'>to {formatDate(subscription.current_period_end)}</div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='text-muted-foreground text-sm'>{formatDate(subscription.created_at)}</div>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        navigator.clipboard.writeText(subscription.creem_subscription_id)
                        toast('success', 'Subscription ID copied to clipboard')
                      }}
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold'>{subscriptions.filter(s => s.status === 'active').length}</div>
            <p className='text-muted-foreground text-xs'>Active Subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold'>{subscriptions.filter(s => s.status === 'paused').length}</div>
            <p className='text-muted-foreground text-xs'>Paused Subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold'>{subscriptions.filter(s => s.status === 'canceled').length}</div>
            <p className='text-muted-foreground text-xs'>Canceled Subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold'>{subscriptions.filter(s => s.cancel_at_period_end).length}</div>
            <p className='text-muted-foreground text-xs'>Ending at Period End</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
