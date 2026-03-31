'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Edit2, Eye, Mail, Trash2, Shield, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { User } from '@/lib/actions/users'

const getInitials = (name: string | null, email: string) => {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email.slice(0, 2).toUpperCase()
}

export const createUsersColumns = (
  currentUserId: string | null,
  onRoleChange: (userId: string, role: 'user' | 'admin') => void,
  onEdit: (user: User) => void,
  onImpersonate: (user: User) => void,
  onDelete: (userId: string) => void,
  isUpdating: string | null
): ColumnDef<User>[] => [
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
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          User
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>{getInitials(user.full_name, user.email)}</AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>{user.full_name || user.email.split('@')[0]}</div>
            <div className='text-muted-foreground text-sm'>{user.email}</div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const user = row.original
      return (
        <Select
          value={user.role}
          onValueChange={value => onRoleChange(user.id, value as 'user' | 'admin')}
          disabled={isUpdating === user.id}
        >
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='user'>
              <div className='flex items-center gap-2'>
                <UserIcon className='h-3 w-3' />
                User
              </div>
            </SelectItem>
            <SelectItem value='admin'>
              <div className='flex items-center gap-2'>
                <Shield className='h-3 w-3' />
                Admin
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )
    }
  },
  {
    accessorKey: 'subscription',
    header: 'Subscription',
    cell: ({ row }) => {
      const user = row.original
      return user.subscription ? (
        <div>
          <Badge variant={user.subscription.status === 'active' ? 'default' : 'secondary'}>
            {user.subscription.status}
          </Badge>
          <div className='text-muted-foreground mt-1 text-xs'>{user.subscription.plan_name}</div>
        </div>
      ) : (
        <span className='text-muted-foreground text-sm'>No plan</span>
      )
    }
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Joined
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className='text-sm'>{new Date(row.getValue('created_at')).toLocaleDateString()}</span>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Edit2 className='mr-2 h-4 w-4' />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onImpersonate(user)}
              disabled={user.role === 'admin' || user.id === currentUserId}
            >
              <Eye className='mr-2 h-4 w-4' />
              {user.role === 'admin'
                ? 'Cannot impersonate admin'
                : user.id === currentUserId
                  ? 'Cannot impersonate yourself'
                  : 'Impersonate User'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className='mr-2 h-4 w-4' />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(user.id)}
              className='text-red-600'
              disabled={user.id === currentUserId}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {user.id === currentUserId ? 'Cannot delete yourself' : 'Delete User'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
