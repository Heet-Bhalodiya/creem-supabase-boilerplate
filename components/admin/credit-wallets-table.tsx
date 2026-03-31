'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wallet, Search, Filter, Eye, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'

type CreditWallet = {
  id: string
  user_id: string
  balance: number
  total_earned: number
  total_spent: number
  last_activity: string
  created_at: string
  profiles?: {
    email: string
    full_name: string
  }
}

type CreditWalletsTableProps = {
  wallets?: CreditWallet[]
  isLoading?: boolean
}

export function CreditWalletsTable({ wallets: initialWallets, isLoading = false }: CreditWalletsTableProps) {
  const [wallets, setWallets] = useState<CreditWallet[]>(initialWallets || [])
  const [filteredWallets, setFilteredWallets] = useState<CreditWallet[]>(initialWallets || [])
  const [loading, setLoading] = useState(isLoading)
  const [searchQuery, setSearchQuery] = useState('')
  const [balanceFilter, setBalanceFilter] = useState('all')

  // Fetch wallets if not provided via props
  useEffect(() => {
    if (!initialWallets && !isLoading) {
      fetchWallets()
    }
  }, [initialWallets, isLoading])

  // Filter wallets based on search and balance filter
  useEffect(() => {
    let filtered = wallets

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        wallet =>
          wallet.profiles?.email?.toLowerCase().includes(query) ||
          wallet.profiles?.full_name?.toLowerCase().includes(query) ||
          wallet.user_id.includes(query)
      )
    }

    // Balance filter
    if (balanceFilter !== 'all') {
      filtered = filtered.filter(wallet => {
        switch (balanceFilter) {
          case 'positive':
            return wallet.balance > 0
          case 'zero':
            return wallet.balance === 0
          case 'high':
            return wallet.balance >= 1000
          default:
            return true
        }
      })
    }

    setFilteredWallets(filtered)
  }, [wallets, searchQuery, balanceFilter])

  const fetchWallets = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/credits/wallets')
      if (!response.ok) throw new Error('Failed to fetch wallets')

      const data = await response.json()
      setWallets(data.wallets || [])
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
      toast.error('Failed to load credit wallets')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBalanceBadgeColor = (balance: number) => {
    if (balance > 1000) return 'bg-green-100 text-green-800'
    if (balance > 100) return 'bg-blue-100 text-blue-800'
    if (balance > 0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <div className='h-10 flex-1 animate-pulse rounded bg-gray-200'></div>
          <div className='h-10 w-32 animate-pulse rounded bg-gray-200'></div>
        </div>
        <div className='space-y-2'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-12 animate-pulse rounded bg-gray-200'></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
          <Input
            placeholder='Search by email, name, or user ID...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        <Select value={balanceFilter} onValueChange={setBalanceFilter}>
          <SelectTrigger className='w-48'>
            <Filter className='mr-2 h-4 w-4' />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Balances</SelectItem>
            <SelectItem value='positive'>Has Credits</SelectItem>
            <SelectItem value='zero'>Zero Balance</SelectItem>
            <SelectItem value='high'>High Balance (1000+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-4'>
        <div>
          <span className='font-medium'>Total Wallets:</span> {wallets.length}
        </div>
        <div>
          <span className='font-medium'>Active Wallets:</span> {wallets.filter(w => w.balance > 0).length}
        </div>
        <div>
          <span className='font-medium'>Total Credits:</span>{' '}
          {wallets.reduce((sum, w) => sum + w.balance, 0).toLocaleString()}
        </div>
        <div>
          <span className='font-medium'>Showing:</span> {filteredWallets.length} wallets
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current Balance</TableHead>
              <TableHead>Lifetime Earned</TableHead>
              <TableHead>Lifetime Spent</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWallets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center text-gray-500'>
                  {searchQuery || balanceFilter !== 'all' ? (
                    <div>
                      <Filter className='mx-auto mb-2 h-8 w-8 opacity-50' />
                      No wallets match your filters
                    </div>
                  ) : (
                    <div>
                      <Wallet className='mx-auto mb-2 h-8 w-8 opacity-50' />
                      No credit wallets found
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredWallets.map(wallet => (
                <TableRow key={wallet.id}>
                  <TableCell>
                    <div>
                      <div className='font-medium'>
                        {wallet.profiles?.full_name || wallet.profiles?.email || 'Unknown'}
                      </div>
                      <div className='text-sm text-gray-500'>{wallet.profiles?.email || wallet.user_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBalanceBadgeColor(wallet.balance || 0)}>
                      {(wallet.balance || 0).toLocaleString()} credits
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center text-sm text-green-600'>
                      <Plus className='mr-1 h-3 w-3' />
                      {(wallet.total_earned || 0).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center text-sm text-red-600'>
                      <Minus className='mr-1 h-3 w-3' />
                      {(wallet.total_spent || 0).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className='text-sm text-gray-500'>
                    {wallet.last_activity ? formatDate(wallet.last_activity) : 'Never'}
                  </TableCell>
                  <TableCell className='text-sm text-gray-500'>{formatDate(wallet.created_at)}</TableCell>
                  <TableCell>
                    <Button variant='outline' size='sm'>
                      <Eye className='mr-1 h-3 w-3' />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
