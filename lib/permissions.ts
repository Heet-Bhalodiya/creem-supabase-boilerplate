'use server'

import { createClient } from '@/lib/supabase/server'
import { getEffectiveUserId } from './actions/users'

type RolePermission = {
  permissions: {
    name: string
    resource: string
    action: string
  }
}

type Role = {
  role_permissions: RolePermission[]
}

type UserRole = {
  roles: Role
}

// Helper to check if EFFECTIVE user is admin (respects impersonation)
async function isEffectiveUserAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const effectiveUserId = await getEffectiveUserId()
  if (!effectiveUserId) return false

  const { data } = await supabase.from('profiles').select('role').eq('id', effectiveUserId).single()

  return data?.role === 'admin'
}

export async function getUserPermissions() {
  const supabase = await createClient()
  const effectiveUserId = await getEffectiveUserId()

  if (!effectiveUserId) return []

  // Check if EFFECTIVE user is admin (not the logged-in admin who might be impersonating)
  if (await isEffectiveUserAdmin()) {
    return ['*'] // Wildcard means all permissions
  }

  // Get EFFECTIVE user's roles and their permissions
  const { data } = await supabase
    .from('user_roles')
    .select(
      `
      roles!inner (
        role_permissions!inner (
          permissions (
            name,
            resource,
            action
          )
        )
      )
    `
    )
    .eq('user_id', effectiveUserId)

  if (!data) return []

  // Flatten permissions from all roles
  const permissions = new Set<string>()

  for (const userRole of data as unknown as UserRole[]) {
    const role = userRole.roles
    if (role?.role_permissions) {
      for (const rp of role.role_permissions) {
        if (rp.permissions?.name) {
          permissions.add(rp.permissions.name)
        }
      }
    }
  }

  return Array.from(permissions)
}

export async function hasPermission(permission: string | string[]) {
  const permissions = await getUserPermissions()

  // Admin bypass - admins have wildcard permission
  if (permissions.includes('*')) return true

  if (Array.isArray(permission)) {
    return permission.some(p => permissions.includes(p))
  }

  return permissions.includes(permission)
}

export async function hasAnyPermission(permissions: string[]) {
  return hasPermission(permissions)
}

export async function hasAllPermissions(requiredPermissions: string[]) {
  const userPermissions = await getUserPermissions()

  // Admin bypass
  if (userPermissions.includes('*')) return true

  return requiredPermissions.every(p => userPermissions.includes(p))
}
