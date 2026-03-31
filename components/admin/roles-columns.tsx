'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit2, Trash2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { Role } from '@/lib/actions/users'

export const createRolesColumns = (
  onEdit: (role: Role) => void,
  onDelete: (roleId: string) => void
): ColumnDef<Role>[] => [
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
        disabled={row.original.is_system_role}
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
          Role Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const role = row.original
      return (
        <div className='flex items-center gap-2'>
          {role.is_system_role && <Shield className='h-4 w-4 text-blue-500' />}
          <span className='font-medium'>{role.name}</span>
          {role.is_system_role && (
            <Badge variant='secondary' className='text-xs'>
              System
            </Badge>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      return <span className='text-muted-foreground text-sm'>{row.getValue('description') || 'No description'}</span>
    }
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => {
      const permissions = row.original.permissions || []
      return (
        <div className='flex flex-wrap gap-1'>
          {permissions.slice(0, 3).map((perm, i) => (
            <Badge key={i} variant='outline' className='text-xs'>
              {perm.name}
            </Badge>
          ))}
          {permissions.length > 3 && (
            <Badge variant='secondary' className='text-xs'>
              +{permissions.length - 3} more
            </Badge>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: 'user_count',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Users
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className='text-sm'>{row.getValue('user_count') || 0}</span>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const role = row.original
      return (
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={() => onEdit(role)}>
            <Edit2 className='mr-2 h-4 w-4' />
            Edit
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(role.id)}
            className='text-red-600'
            disabled={role.is_system_role}
          >
            <Trash2 className='mr-2 h-4 w-4' />
            {role.is_system_role ? 'Protected' : 'Delete'}
          </Button>
        </div>
      )
    }
  }
]
