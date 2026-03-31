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
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import type { PricingPlan } from '@/lib/actions/billing'

export type PricingPlanColumn = PricingPlan

type PricingPlanActionsProps = {
  plan: PricingPlan
  onEdit: (plan: PricingPlan) => void
  onDelete: (id: string) => void
}

function PricingPlanActions({ plan, onEdit, onDelete }: PricingPlanActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(plan)}>
          <Edit className='mr-2 h-4 w-4' />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(plan.id)} className='text-red-600'>
          <Trash2 className='mr-2 h-4 w-4' />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const createPricingPlanColumns = (
  onEdit: (plan: PricingPlan) => void,
  onDelete: (id: string) => void
): ColumnDef<PricingPlanColumn>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Plan Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const plan = row.original
      return (
        <div className='flex items-center gap-2'>
          <span className='font-medium'>{plan.name}</span>
          {plan.popular && (
            <Badge variant='default' className='text-xs'>
              Popular
            </Badge>
          )}
          {plan.badge && (
            <Badge variant='outline' className='text-xs'>
              {plan.badge}
            </Badge>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Price
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const plan = row.original
      return (
        <div>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: plan.currency.toUpperCase()
          }).format(plan.price / 100)}{' '}
          {/* Convert cents to dollars */}
        </div>
      )
    }
  },
  {
    accessorKey: 'payment_type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('payment_type') as string
      return <Badge variant='outline'>{type === 'one_time' ? 'One-time' : 'Subscription'}</Badge>
    }
  },
  {
    accessorKey: 'interval',
    header: 'Interval',
    cell: ({ row }) => {
      const plan = row.original
      if (plan.payment_type === 'one_time') {
        return <span className='text-muted-foreground text-sm'>One-time</span>
      }
      return <span className='capitalize'>{plan.interval}</span>
    }
  },
  {
    id: 'features',
    header: 'Features',
    cell: ({ row }) => {
      const features = row.original.features as string[] | null
      return (
        <div className='text-muted-foreground text-sm'>{features ? `${features.length} features` : '0 features'}</div>
      )
    }
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active')
      return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
    }
  },
  {
    accessorKey: 'sort_order',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Order
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return <PricingPlanActions plan={row.original} onEdit={onEdit} onDelete={onDelete} />
    }
  }
]
