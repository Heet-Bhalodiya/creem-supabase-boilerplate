'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
import { Plus } from 'lucide-react'
import { getRoles, createRole, updateRole, deleteRole, getPermissions, type Role } from '@/lib/actions/users'
import { toast } from '@/lib/toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { createRolesColumns } from './roles-columns'

type Permission = {
  id: string
  name: string
  description?: string
  resource: string
  action: string
}

export function RolesTable({ initialRoles }: { initialRoles: Role[] }) {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])

  // Create/Edit role form
  const [roleData, setRoleData] = useState({
    name: '',
    description: '',
    permission_ids: [] as string[]
  })

  useEffect(() => {
    getPermissions().then(setPermissions)
  }, [])

  const handleDelete = async () => {
    if (!deleteRoleId) return

    try {
      await deleteRole(deleteRoleId)
      toast('success', 'Role has been deleted successfully')
      setDeleteRoleId(null)
      setRoles(roles.filter(r => r.id !== deleteRoleId))
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to delete role')
    }
  }

  const handleCreateRole = async () => {
    try {
      const result = await createRole(roleData)
      if (result.success) {
        toast('success', 'New role has been created successfully')
        setShowCreateDialog(false)
        setRoleData({ name: '', description: '', permission_ids: [] })
        const updatedRoles = await getRoles()
        setRoles(updatedRoles)
      }
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to create role')
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    try {
      await updateRole(editingRole.id, roleData)
      toast('success', 'Role has been updated successfully')
      setEditingRole(null)
      setRoleData({ name: '', description: '', permission_ids: [] })
      const updatedRoles = await getRoles()
      setRoles(updatedRoles)
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to update role')
    }
  }

  const openEditDialog = (role: Role) => {
    setEditingRole(role)
    setRoleData({
      name: role.name,
      description: role.description || '',
      permission_ids: role.permissions?.map(p => p.id) || []
    })
  }

  // Group permissions by resource
  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = []
      }
      acc[perm.resource].push(perm)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  const columns = createRolesColumns(openEditDialog, setDeleteRoleId)

  return (
    <>
      {/* Header with Create Button */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Roles</h2>
          <p className='text-muted-foreground'>Manage roles and permissions</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create Role
        </Button>
      </div>

      <DataTable columns={columns} data={roles} searchKey='name' searchPlaceholder='Search roles...' />

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Create a custom role and assign permissions.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='role-name'>Role Name *</Label>
              <Input
                id='role-name'
                value={roleData.name}
                onChange={e => setRoleData({ ...roleData, name: e.target.value })}
                placeholder='e.g., Content Editor, Moderator'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role-description'>Description</Label>
              <Textarea
                id='role-description'
                value={roleData.description}
                onChange={e => setRoleData({ ...roleData, description: e.target.value })}
                placeholder='Describe the purpose of this role'
                rows={3}
              />
            </div>
            <div className='space-y-3'>
              <Label>Permissions</Label>
              <div className='max-h-[300px] space-y-4 overflow-y-auto rounded-md border p-4'>
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className='space-y-2'>
                    <h4 className='text-sm font-semibold capitalize'>{resource}</h4>
                    <div className='space-y-2 pl-4'>
                      {perms.map(perm => (
                        <div key={perm.id} className='flex items-center space-x-2'>
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={roleData.permission_ids.includes(perm.id)}
                            onCheckedChange={checked => {
                              if (checked) {
                                setRoleData({
                                  ...roleData,
                                  permission_ids: [...roleData.permission_ids, perm.id]
                                })
                              } else {
                                setRoleData({
                                  ...roleData,
                                  permission_ids: roleData.permission_ids.filter(id => id !== perm.id)
                                })
                              }
                            }}
                          />
                          <Label htmlFor={`perm-${perm.id}`} className='font-normal'>
                            <span className='font-mono text-xs'>{perm.name}</span>
                            {perm.description && (
                              <span className='text-muted-foreground ml-2 text-xs'>- {perm.description}</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
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
                setRoleData({ name: '', description: '', permission_ids: [] })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={!roleData.name}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role details and permissions.</DialogDescription>
          </DialogHeader>
          {editingRole && (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-role-name'>Role Name *</Label>
                <Input
                  id='edit-role-name'
                  value={roleData.name}
                  onChange={e => setRoleData({ ...roleData, name: e.target.value })}
                  placeholder='e.g., Content Editor, Moderator'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='edit-role-description'>Description</Label>
                <Textarea
                  id='edit-role-description'
                  value={roleData.description}
                  onChange={e => setRoleData({ ...roleData, description: e.target.value })}
                  placeholder='Describe the purpose of this role'
                  rows={3}
                />
              </div>
              <div className='space-y-3'>
                <Label>Permissions</Label>
                <div className='max-h-[300px] space-y-4 overflow-y-auto rounded-md border p-4'>
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className='space-y-2'>
                      <h4 className='text-sm font-semibold capitalize'>{resource}</h4>
                      <div className='space-y-2 pl-4'>
                        {perms.map(perm => (
                          <div key={perm.id} className='flex items-center space-x-2'>
                            <Checkbox
                              id={`edit-perm-${perm.id}`}
                              checked={roleData.permission_ids.includes(perm.id)}
                              onCheckedChange={checked => {
                                if (checked) {
                                  setRoleData({
                                    ...roleData,
                                    permission_ids: [...roleData.permission_ids, perm.id]
                                  })
                                } else {
                                  setRoleData({
                                    ...roleData,
                                    permission_ids: roleData.permission_ids.filter(id => id !== perm.id)
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={`edit-perm-${perm.id}`} className='font-normal'>
                              <span className='font-mono text-xs'>{perm.name}</span>
                              {perm.description && (
                                <span className='text-muted-foreground ml-2 text-xs'>- {perm.description}</span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setEditingRole(null)
                setRoleData({ name: '', description: '', permission_ids: [] })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={!roleData.name}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Users assigned to this role will lose their permissions.
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
