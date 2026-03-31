'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, Download, Eye, MoreHorizontal } from 'lucide-react'
import { UserPayment } from '@/lib/actions/payments'
import { formatPrice } from '@/lib/creem/client'
import { getInvoiceSettings } from '@/lib/actions/app-settings'
import { toast } from '@/lib/toast'

export type PaymentColumn = UserPayment

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    succeeded: { label: 'Paid', variant: 'default' },
    paid: { label: 'Paid', variant: 'default' },
    pending: { label: 'Pending', variant: 'secondary' },
    failed: { label: 'Failed', variant: 'destructive' },
    refunded: { label: 'Refunded', variant: 'outline' },
    cancelled: { label: 'Cancelled', variant: 'outline' }
  }

  const { label, variant } = statusMap[status.toLowerCase()] || { label: status, variant: 'secondary' as const }

  return (
    <Badge variant={variant} className='capitalize'>
      {label}
    </Badge>
  )
}

export const paymentColumns: ColumnDef<PaymentColumn>[] = [
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Amount
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      const currency = row.original.currency || 'USD'
      return <div className='font-medium'>{formatPrice(amount, currency)}</div>
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return getStatusBadge(status)
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className='text-sm'>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const payment = row.original
      const status = payment.status.toLowerCase()
      const isPaid = status === 'succeeded' || status === 'paid'

      const handleViewInvoice = async () => {
        // Get invoice settings to build the preview URL
        const settings = await getInvoiceSettings()

        const params = new URLSearchParams({
          serial_number_series: settings.invoice_prefix,
          seller_name: settings.company_name,
          seller_code: settings.company_code,
          seller_address: settings.company_address,
          seller_tax_number: settings.company_tax_number,
          seller_phone: settings.company_phone,
          // Add payment-specific details
          invoice_id: payment.id,
          amount: payment.amount.toString(),
          currency: payment.currency,
          date: payment.created_at
        })

        window.open(`/invoice/preview?${params.toString()}`, '_blank')
      }

      const handleDownloadInvoice = async () => {
        try {
          const settings = await getInvoiceSettings()

          const params = new URLSearchParams({
            serial_number_series: settings.invoice_prefix,
            seller_name: settings.company_name,
            seller_code: settings.company_code,
            seller_address: settings.company_address,
            seller_tax_number: settings.company_tax_number,
            seller_phone: settings.company_phone,
            invoice_id: payment.id,
            amount: payment.amount.toString(),
            currency: payment.currency,
            date: payment.created_at,
            download: 'true'
          })

          window.open(`/invoice/preview?${params.toString()}`, '_blank')
        } catch (error) {
          console.error(error)
          toast('error', error instanceof Error ? error.message : 'Failed to download invoice')
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isPaid && (
              <>
                <DropdownMenuItem onClick={handleViewInvoice}>
                  <Eye className='mr-2 h-4 w-4' />
                  View Invoice
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadInvoice}>
                  <Download className='mr-2 h-4 w-4' />
                  Download Invoice
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(payment.id)
              }}
            >
              Copy Payment ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
