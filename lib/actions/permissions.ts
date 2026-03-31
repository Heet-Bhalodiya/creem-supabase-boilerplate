'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Permission = {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
  created_at: string
}

// Get all permissions (admin only)
export async function getPermissions() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })
    .order('action', { ascending: true })

  if (error) throw error
  return data as Permission[]
}

// Create permission (admin only)
export async function createPermission(permission: {
  name: string
  resource: string
  action: string
  description?: string
}) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { data, error } = await supabase
    .from('permissions')
    .insert({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating permission:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/settings/permissions')
  revalidatePath('/admin/roles')
  return { success: true, data }
}

// Update permission (admin only)
export async function updatePermission(
  id: string,
  permission: {
    name?: string
    resource?: string
    action?: string
    description?: string
  }
) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { data, error } = await supabase.from('permissions').update(permission).eq('id', id).select().single()

  if (error) {
    console.error('Error updating permission:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/settings/permissions')
  revalidatePath('/admin/roles')
  return { success: true, data }
}

// Delete permission (admin only)
export async function deletePermission(id: string) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Check if permission is assigned to any roles
  const { data: rolePermissions } = await supabase.from('role_permissions').select('id').eq('permission_id', id)

  if (rolePermissions && rolePermissions.length > 0) {
    return {
      success: false,
      error: `Cannot delete permission. It is assigned to ${rolePermissions.length} role(s). Remove it from roles first.`
    }
  }

  const { error } = await supabase.from('permissions').delete().eq('id', id)

  if (error) {
    console.error('Error deleting permission:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/settings/permissions')
  revalidatePath('/admin/roles')
  return { success: true }
}

// Get roles assigned to a permission
export async function getPermissionRoles(permissionId: string) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { data, error } = await supabase
    .from('role_permissions')
    .select('role_id, roles(id, name)')
    .eq('permission_id', permissionId)

  if (error) throw error
  return data
}

// Assign permission to roles
export async function assignPermissionToRoles(permissionId: string, roleIds: string[]) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Delete existing assignments
  await supabase.from('role_permissions').delete().eq('permission_id', permissionId)

  // Insert new assignments
  if (roleIds.length > 0) {
    const assignments = roleIds.map(roleId => ({
      role_id: roleId,
      permission_id: permissionId
    }))

    const { error } = await supabase.from('role_permissions').insert(assignments)

    if (error) {
      console.error('Error assigning permission to roles:', error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/admin/settings/permissions')
  revalidatePath('/admin/roles')
  return { success: true }
}

// Get all roles
export async function getRoles() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { data, error } = await supabase.from('roles').select('id, name').order('name', { ascending: true })

  if (error) throw error
  return data
}
