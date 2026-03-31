'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Edit, Plus, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import {
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionToRoles,
  getPermissionRoles,
  getRoles,
  type Permission
} from '@/lib/actions/permissions'
import { useRouter } from 'next/navigation'

export function PermissionsTable({ permissions }: { permissions: Permission[] }) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isRolesOpen, setIsRolesOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    resource: '',
    action: '',
    description: ''
  })

  const handleCreate = async () => {
    setIsPending(true)
    try {
      const result = await createPermission(formData)

      if (result.success) {
        toast.success('Permission created successfully')
        setIsCreateOpen(false)
        setFormData({ name: '', resource: '', action: '', description: '' })
      } else {
        toast.error(result.error || 'Failed to create permission')
      }
    } catch {
      toast.error('Failed to create permission')
    } finally {
      setIsPending(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedPermission) return

    setIsPending(true)
    try {
      const result = await updatePermission(selectedPermission.id, formData)

      if (result.success) {
        toast.success('Permission updated successfully')
        setIsEditOpen(false)
        setSelectedPermission(null)
        setFormData({ name: '', resource: '', action: '', description: '' })
      } else {
        toast.error(result.error || 'Failed to update permission')
      }
    } catch {
      toast.error('Failed to update permission')
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPermission) return

    setIsPending(true)
    try {
      const result = await deletePermission(selectedPermission.id)

      if (result.success) {
        toast.success('Permission deleted successfully')
        setIsDeleteOpen(false)
        setSelectedPermission(null)
      } else {
        toast.error(result.error || 'Failed to delete permission')
      }
    } catch {
      toast.error('Failed to delete permission')
    } finally {
      setIsPending(false)
    }
  }

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission)
    setFormData({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || ''
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsDeleteOpen(true)
  }

  const openRolesDialog = async (permission: Permission) => {
    setSelectedPermission(permission)
    setIsPending(true)
    try {
      // Fetch all roles
      const allRoles = await getRoles()
      setRoles(allRoles)

      // Fetch assigned roles for this permission
      const permissionRoles = await getPermissionRoles(permission.id)
      const assignedRoleIds = permissionRoles.map((pr: { role_id: string }) => pr.role_id)
      setSelectedRoles(assignedRoleIds)

      setIsRolesOpen(true)
    } catch {
      toast.error('Failed to load roles')
    } finally {
      setIsPending(false)
    }
  }

  const handleAssignRoles = async () => {
    if (!selectedPermission) return

    setIsPending(true)
    try {
      const result = await assignPermissionToRoles(selectedPermission.id, selectedRoles)

      if (result.success) {
        toast.success('Roles assigned successfully')
        setIsRolesOpen(false)
        setSelectedPermission(null)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to assign roles')
      }
    } catch {
      toast.error('Failed to assign roles')
    } finally {
      setIsPending(false)
    }
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => (prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]))
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Permission</DialogTitle>
              <DialogDescription>Add a new permission to the system</DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Permission Name</Label>
                <Input
                  id='name'
                  placeholder='e.g., users.create'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <p className='text-muted-foreground text-xs'>Unique identifier (e.g., resource.action)</p>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='resource'>Resource</Label>
                <Input
                  id='resource'
                  placeholder='e.g., users'
                  value={formData.resource}
                  onChange={e => setFormData({ ...formData, resource: e.target.value })}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='action'>Action</Label>
                <Input
                  id='action'
                  placeholder='e.g., create, read, update, delete'
                  value={formData.action}
                  onChange={e => setFormData({ ...formData, action: e.target.value })}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  placeholder='What does this permission allow?'
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isPending || !formData.name || !formData.resource || !formData.action}
              >
                {isPending ? 'Creating...' : 'Create Permission'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Permission Name</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className='w-25'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions && permissions.length > 0 ? (
            permissions.map(permission => (
              <TableRow key={permission.id}>
                <TableCell className='font-mono font-medium'>{permission.name}</TableCell>
                <TableCell>
                  <Badge variant='outline'>{permission.resource}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>{permission.action}</Badge>
                </TableCell>
                <TableCell className='text-muted-foreground'>{permission.description || '-'}</TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => openRolesDialog(permission)}
                      title='Assign to roles'
                    >
                      <Shield className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => openEditDialog(permission)}>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => openDeleteDialog(permission)}>
                      <Trash2 className='text-destructive h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className='text-muted-foreground h-24 text-center'>
                No permissions found. Create your first permission.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission details</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='edit-name'>Permission Name</Label>
              <Input
                id='edit-name'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-resource'>Resource</Label>
              <Input
                id='edit-resource'
                value={formData.resource}
                onChange={e => setFormData({ ...formData, resource: e.target.value })}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-action'>Action</Label>
              <Input
                id='edit-action'
                value={formData.action}
                onChange={e => setFormData({ ...formData, action: e.target.value })}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-description'>Description</Label>
              <Textarea
                id='edit-description'
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the permission <strong>{selectedPermission?.name}</strong>? This action
              cannot be undone. The permission must not be assigned to any roles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Assignment Dialog */}
      <Dialog open={isRolesOpen} onOpenChange={setIsRolesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Permission to Roles</DialogTitle>
            <DialogDescription>
              Select which roles should have the permission: <strong>{selectedPermission?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-100 space-y-3 overflow-y-auto py-4'>
            {roles.length === 0 ? (
              <p className='text-muted-foreground text-sm'>No roles available</p>
            ) : (
              roles.map(role => (
                <div key={role.id} className='flex items-center space-x-3'>
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => toggleRole(role.id)}
                  />
                  <Label htmlFor={`role-${role.id}`} className='cursor-pointer font-normal'>
                    {role.name}
                  </Label>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsRolesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRoles} disabled={isPending}>
              {isPending ? 'Assigning...' : 'Assign Roles'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
