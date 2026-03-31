'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { EmailProvider } from '@/lib/actions/email-providers'

const providerIcons: Record<string, string> = {
  mailgun: 'M',
  postmark: 'P',
  ses: 'S',
  resend: 'R',
  smtp: 'E'
}

const providerColors: Record<string, string> = {
  mailgun: 'bg-red-500',
  postmark: 'bg-yellow-500',
  ses: 'bg-orange-500',
  resend: 'bg-black',
  smtp: 'bg-blue-500'
}

export const emailProviderColumns: ColumnDef<EmailProvider>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const provider = row.original
      const bgColor = providerColors[provider.provider_type] || 'bg-gray-500'

      return (
        <div className='flex items-center gap-3'>
          <Avatar className={`h-8 w-8`}>
            <AvatarFallback className={`text-sm font-semibold text-white ${bgColor}`}>
              {providerIcons[provider.provider_type] || provider.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className='font-medium'>{provider.name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Slug
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <code className='text-muted-foreground text-sm'>{row.getValue('slug')}</code>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const provider = row.original
      return (
        <div className='text-right'>
          <Button variant='ghost' size='sm' asChild>
            <Link href={`/admin/settings/email-providers/${provider.slug}`}>
              <Edit className='mr-2 h-4 w-4 text-orange-600' />
              <span className='text-orange-600'>Edit</span>
            </Link>
          </Button>
        </div>
      )
    }
  }
]
