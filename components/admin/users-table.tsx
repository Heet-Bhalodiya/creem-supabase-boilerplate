'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter } from 'lucide-react'
import { updateUserRole, deleteUser, getCurrentUser, type User } from '@/lib/actions/users'
import { toast } from '@/lib/toast'
import { useAuthContext } from '@/hooks/use-auth'
import { DataTable } from '@/components/ui/data-table'
import { createUsersColumns } from './users-columns'

export function UsersTable({ users }: { users: User[] }) {
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { startImpersonation } = useAuthContext()

  // Get current user ID to prevent self-deletion
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesRole
  })

  const handleRoleChange = async (userId: string, role: 'user' | 'admin') => {
    setIsUpdating(userId)
    try {
      await updateUserRole(userId, role)
      toast('success', 'User role has been updated successfully')
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteUserId) return

    try {
      await deleteUser(deleteUserId)
      toast('success', 'User has been deleted successfully')
      setDeleteUserId(null)
      // Refresh page to show updated list
      window.location.reload()
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const handleImpersonate = async (user: User) => {
    if (user.role === 'admin') {
      toast('error', 'Cannot impersonate admin users')
      return
    }

    if (user.id === currentUserId) {
      toast('error', 'Cannot impersonate yourself')
      return
    }

    try {
      // Just pass the user ID - useAuthContext handles everything
      await startImpersonation(user.id)
    } catch (error) {
      // Ignore NEXT_REDIRECT error (expected)
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        return
      }
      console.error('Impersonation failed:', error)
    }
  }

  const columns = createUsersColumns(
    currentUserId,
    handleRoleChange,
    setEditingUser,
    handleImpersonate,
    setDeleteUserId,
    isUpdating
  )

  return (
    <>
      {/* Filter Section */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters
          </CardTitle>
          <CardDescription>Filter users by role and other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Label htmlFor='role-filter'>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All Roles' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Roles</SelectItem>
                  <SelectItem value='user'>Users</SelectItem>
                  <SelectItem value='admin'>Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end'>
              <Button
                variant='outline'
                onClick={() => {
                  setRoleFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={filteredUsers} searchKey='email' searchPlaceholder='Search by email...' />

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and settings.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-name'>Full Name</Label>
                <Input id='edit-name' defaultValue={editingUser.full_name || ''} placeholder='Enter full name' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-email'>Email</Label>
                <Input
                  id='edit-email'
                  type='email'
                  defaultValue={editingUser.email}
                  placeholder='Enter email address'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-role'>Role</Label>
                <Select defaultValue={editingUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user'>User</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={() => setEditingUser(null)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className='bg-destructive'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
