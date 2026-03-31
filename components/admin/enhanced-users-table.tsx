'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import {
  Search,
  Trash2,
  Edit2,
  Filter,
  MoreHorizontal,
  Mail,
  UserPlus,
  Eye,
  CheckCircle,
  XCircle,
  LogOut
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  deleteUser,
  getCurrentUser,
  createUser,
  startImpersonation,
  assignRoleToUser,
  removeRoleFromUser,
  getRoles,
  type User,
  type Role
} from '@/lib/actions/users'
import { toast } from '@/lib/toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

export function EnhancedUsersTable({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false)
  const [impersonateUserId, setImpersonateUserId] = useState<string | null>(null)
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])

  // Create user form
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    full_name: '',
    role_ids: [] as string[]
  })

  // Impersonation reason
  const [impersonationReason, setImpersonationReason] = useState('')

  // Get current user ID and roles
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) setCurrentUserId(user.id)
    })
    getRoles().then(roles => {
      setAvailableRoles(roles)
    })
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.roles?.some(r => r.id === roleFilter)

    return matchesSearch && matchesRole
  })

  const handleDelete = async () => {
    if (!deleteUserId) return

    try {
      await deleteUser(deleteUserId)
      toast('success', 'User has been deleted successfully')
      setDeleteUserId(null)
      setUsers(users.filter(u => u.id !== deleteUserId))
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const handleCreateUser = async () => {
    try {
      const result = await createUser(newUserData)
      if (result.success) {
        toast('success', 'New user has been created successfully')
      }

      setShowCreateDialog(false)
      setNewUserData({ email: '', password: '', full_name: '', role_ids: [] })
      window.location.reload()
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  const handleImpersonate = async () => {
    if (!impersonateUserId) return

    try {
      await startImpersonation(impersonateUserId)
      // startImpersonation redirects on success, so code below won't execute
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to start impersonation')
    }
  }

  const handleRoleToggle = async (userId: string, roleId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await removeRoleFromUser(userId, roleId)
        toast('success', 'Role removed')
      } else {
        await assignRoleToUser(userId, roleId)
        toast('success', 'Role assigned')
      }
      // Refresh user data
      window.location.reload()
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to update role')
    }
  }

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      {/* Header with Create Button */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Users</h2>
          <p className='text-muted-foreground'>Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className='mr-2 h-4 w-4' />
          Create User
        </Button>
      </div>

      {/* Important Notice */}
      <Card className='mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium text-yellow-900 dark:text-yellow-100'>Important</CardTitle>
        </CardHeader>
        <CardContent className='text-sm text-yellow-800 dark:text-yellow-200'>
          <p>Be careful when modifying user roles and permissions. Changes take effect immediately.</p>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters
          </CardTitle>
          <CardDescription>Filter users by role and search criteria</CardDescription>
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
                  {availableRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-end'>
              <Button
                variant='outline'
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='mb-4'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search by name or email...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className='w-25'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-muted-foreground text-center'>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(user.full_name, user.email)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='font-medium'>{user.full_name || user.email.split('@')[0]}</div>
                        <div className='flex gap-1'>
                          {user.roles?.map(role => (
                            <Badge key={role.id} variant='outline' className='text-xs'>
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm'>{user.email}</span>
                  </TableCell>
                  <TableCell>
                    {user.email_verified ? (
                      <CheckCircle className='h-5 w-5 text-green-600' />
                    ) : (
                      <XCircle className='h-5 w-5 text-red-600' />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className='text-sm'>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}</span>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm'>{user.updated_at ? formatDate(user.updated_at) : 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <span className='text-sm'>{formatDate(user.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setImpersonateUserId(user.id)
                          setShowImpersonateDialog(true)
                        }}
                        disabled={user.id === currentUserId}
                      >
                        <Eye className='mr-1 h-3 w-3' />
                        Impersonate
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => setEditingUser(user)}>
                            <Edit2 className='mr-2 h-4 w-4' />
                            Edit Roles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className='mr-2 h-4 w-4' />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteUserId(user.id)}
                            className='text-red-600'
                            disabled={user.id === currentUserId}
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            {user.id === currentUserId ? 'Cannot delete yourself' : 'Delete User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className='sm:max-w-125'>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a user account directly with email and password</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='new-email'>Email *</Label>
              <Input
                id='new-email'
                type='email'
                value={newUserData.email}
                onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder='user@example.com'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='new-password'>Password *</Label>
              <PasswordInput
                id='new-password'
                value={newUserData.password}
                onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder='••••••••'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='new-name'>Full Name</Label>
              <Input
                id='new-name'
                value={newUserData.full_name}
                onChange={e => setNewUserData({ ...newUserData, full_name: e.target.value })}
                placeholder='John Doe'
              />
            </div>

            <div className='space-y-2'>
              <Label>Assign Roles</Label>
              <div className='space-y-2'>
                {availableRoles.map(role => (
                  <div key={role.id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={newUserData.role_ids.includes(role.id)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setNewUserData({
                            ...newUserData,
                            role_ids: [...newUserData.role_ids, role.id]
                          })
                        } else {
                          setNewUserData({
                            ...newUserData,
                            role_ids: newUserData.role_ids.filter(id => id !== role.id)
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`role-${role.id}`} className='flex items-center gap-2 font-normal'>
                      {role.name}
                      {role.description && <span className='text-muted-foreground text-xs'>({role.description})</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowCreateDialog(false)
                setNewUserData({ email: '', password: '', full_name: '', role_ids: [] })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={!newUserData.email || !newUserData.password}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Roles Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>Manage role assignments for {editingUser?.email}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                {availableRoles.map(role => {
                  const isAssigned = editingUser.roles?.some(r => r.id === role.id) || false
                  return (
                    <div key={role.id} className='flex items-center justify-between'>
                      <Label className='flex items-center gap-2 font-normal'>
                        {role.name}
                        {role.description && (
                          <span className='text-muted-foreground text-xs'>({role.description})</span>
                        )}
                      </Label>
                      <Checkbox
                        checked={isAssigned}
                        onCheckedChange={() => handleRoleToggle(editingUser.id, role.id, isAssigned)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonate Dialog */}
      <Dialog open={showImpersonateDialog} onOpenChange={setShowImpersonateDialog}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
            <DialogDescription>You will be logged in as this user. All actions will be logged.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='impersonate-reason'>Reason (optional)</Label>
              <Textarea
                id='impersonate-reason'
                value={impersonationReason}
                onChange={e => setImpersonationReason(e.target.value)}
                placeholder='e.g., Debugging user issue with billing'
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowImpersonateDialog(false)
                setImpersonateUserId(null)
                setImpersonationReason('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImpersonate}>
              <LogOut className='mr-2 h-4 w-4' />
              Start Impersonation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
