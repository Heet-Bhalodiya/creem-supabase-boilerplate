'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Admin session backup and UI state cookies for user impersonation
const ADMIN_SESSION_BACKUP = 'admin_session_backup'
const IMPERSONATION_UI_STATE = 'impersonation_ui_state'

export type User = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at?: string
  last_sign_in_at?: string
  email_verified?: boolean
  subscription?: {
    status: string
    plan_name: string
  } | null
  roles?: Array<{
    id: string
    name: string
  }>
}

export type Role = {
  id: string
  name: string
  description: string | null
  is_system_role: boolean
  created_at: string
  updated_at: string
  permissions?: Array<{
    id: string
    name: string
    description: string | null
  }>
}

// Helper to check if user is admin
async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return false

  // Use profiles.role to avoid RLS recursion
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  return data?.role === 'admin'
}

// Get all users with their subscriptions (admin only)
export async function getUsers() {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Get auth metadata for each user first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('Service role key not configured')
  }

  const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey)
  const { data: authData } = await adminClient.auth.admin.listUsers()
  const authUsers = authData.users || []

  // Sync auth users with profiles (create missing profiles)
  for (const authUser of authUsers) {
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', authUser.id).single()

    if (!existingProfile) {
      // Create missing profile
      await supabase.from('profiles').insert({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        role: 'user'
      })
    }
  }

  // Get users with subscriptions and roles
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      *,
      creem_subscriptions (
        status,
        creem_product_id
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) throw error

  // Get user roles separately to avoid foreign key cache issues
  const userIds = data.map(u => u.id)
  const { data: userRolesData } = await supabase
    .from('user_roles')
    .select('user_id, roles(id, name)')
    .in('user_id', userIds)

  return data.map(user => {
    const authUser = authUsers.find(au => au.id === user.id)
    const userRoles = userRolesData?.filter(ur => ur.user_id === user.id) || []

    return {
      ...user,
      email_verified: authUser?.email_confirmed_at ? true : false,
      last_sign_in_at: authUser?.last_sign_in_at || undefined,
      updated_at: authUser?.updated_at || undefined,
      subscription: null,
      roles: userRoles.map(ur => ur.roles)
    }
  })
}

// Update user role (admin only)
export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Update role
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)

  if (error) throw error

  // Log activity

  revalidatePath('/admin/users')
  return { success: true }
}

// Delete user (admin only)
export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Prevent admin from deleting themselves
  if (userId === user.id) {
    throw new Error('You cannot delete your own account')
  }

  // Delete from auth (will cascade to profiles)
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) throw error

  // Log activity

  revalidatePath('/admin/users')
  return { success: true }
}

// Update user profile (admin only)
export async function updateUserProfile(userId: string, data: { full_name?: string; email?: string }) {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Update profile
  const updateData: Record<string, string> = {}
  if (data.full_name) updateData.full_name = data.full_name

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase.from('profiles').update(updateData).eq('id', userId)
    if (error) throw error
  }

  // Update email if provided (requires auth.admin)
  if (data.email) {
    const { error } = await supabase.auth.admin.updateUserById(userId, { email: data.email })
    if (error) throw error
  }

  // Log activity

  revalidatePath('/admin/users')
  return { success: true }
}

// Get current user (for checking self-deletion)
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    email: user.email
  }
}

// Get user stats
export async function getUserStats() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')

  // Get counts
  const [totalUsers, totalAdmins, activeSubscriptions] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('creem_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active')
  ])

  return {
    totalUsers: totalUsers.count || 0,
    totalAdmins: totalAdmins.count || 0,
    activeSubscriptions: activeSubscriptions.count || 0
  }
}

// Helper function to log activity
// Activity logging removed - table no longer exists

// ==================== NEW RBAC FUNCTIONS ====================

// Create new user (admin only)
export async function createUser(data: { email: string; password: string; full_name?: string; role_ids?: string[] }) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('Service role key not configured')
  }

  const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey)

  // Create user in auth
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name
    }
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Failed to create user')

  const supabase = await createClient()

  // Update profile
  if (data.full_name) {
    await supabase.from('profiles').update({ full_name: data.full_name }).eq('id', authData.user.id)
  }

  // Assign roles
  if (data.role_ids && data.role_ids.length > 0) {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const roleAssignments = data.role_ids.map(roleId => ({
      user_id: authData.user!.id,
      role_id: roleId,
      assigned_by: user?.id
    }))

    await supabase.from('user_roles').insert(roleAssignments)
  }

  revalidatePath('/admin/users')
  return { success: true, user: authData.user }
}

// Start impersonation session using magic link flow (admin only)
export async function startImpersonation(userId: string) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()
  const {
    data: { user: admin }
  } = await supabase.auth.getUser()

  if (!admin) throw new Error('Not authenticated')
  if (admin.id === userId) throw new Error('Cannot impersonate yourself')

  // Get admin profile for storing in UI state
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', admin.id)
    .single()

  // Check if target user is admin (admins cannot be impersonated)
  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', userId).single()

  if (targetProfile?.role === 'admin') {
    throw new Error('Cannot impersonate admin users')
  }

  // Get current admin session
  const {
    data: { session: adminSession }
  } = await supabase.auth.refreshSession()

  if (!adminSession) {
    throw new Error('No admin session found')
  }

  // Store admin's session in httpOnly cookie for security
  const cookieStore = await cookies()
  cookieStore.set(
    ADMIN_SESSION_BACKUP,
    JSON.stringify({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  )

  // Get target user profile for UI state cookie
  const { data: targetUserProfile } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, created_at')
    .eq('id', userId)
    .single()

  // Set UI state cookie (readable by client) with impersonated user info
  cookieStore.set(
    IMPERSONATION_UI_STATE,
    JSON.stringify({
      isImpersonating: true,
      originalUser: {
        id: admin.id,
        email: admin.email,
        full_name: adminProfile?.full_name || null,
        avatar_url: adminProfile?.avatar_url || null,
        role: 'admin' as const,
        created_at: admin.created_at
      },
      impersonatedUser: targetUserProfile
    }),
    {
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
  )

  // Get service role client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('Service role key not configured')
  }

  const supabaseServiceRole = createAdminClient(supabaseUrl, supabaseServiceKey)

  // Get target user
  const {
    data: { user: targetUser },
    error: getUserError
  } = await supabaseServiceRole.auth.admin.getUserById(userId)

  if (getUserError || !targetUser) {
    throw new Error(`Failed to get user for impersonation: ${getUserError?.message}`)
  }

  // Generate magic link
  const { data: generateLinkData, error: generateLinkError } = await supabaseServiceRole.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.email || ''
  })

  if (generateLinkError) {
    throw new Error(`Failed to generate link: ${generateLinkError?.message}`)
  }

  // Verify OTP
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email: targetUser.email || '',
    token: generateLinkData?.properties?.email_otp || '',
    type: 'email'
  })

  if (verifyError || !verifyData.session) {
    throw new Error(`Failed to verify OTP: ${verifyError?.message}`)
  }

  // Set impersonated user's session
  const { error: setSessionError } = await supabase.auth.setSession({
    access_token: verifyData.session.access_token,
    refresh_token: verifyData.session.refresh_token
  })

  if (setSessionError) {
    throw new Error(`Failed to set session: ${setSessionError?.message}`)
  }

  // Log the activity

  redirect('/')
}

// End impersonation session and restore admin session
export async function endImpersonation() {
  const cookieStore = await cookies()
  const supabase = await createClient()

  // Get stored admin session
  const adminSessionCookie = cookieStore.get(ADMIN_SESSION_BACKUP)

  if (!adminSessionCookie?.value) {
    throw new Error('No admin session found')
  }

  const session = JSON.parse(adminSessionCookie.value)

  // Restore admin's session
  await supabase.auth.setSession({
    access_token: session.access_token as string,
    refresh_token: session.refresh_token as string
  })

  // Clean up cookies
  cookieStore.delete(ADMIN_SESSION_BACKUP)
  cookieStore.delete(IMPERSONATION_UI_STATE)

  // Log the activity

  redirect('/admin/users')
}

// ==================== ROLE MANAGEMENT ====================

// Get all roles
export async function getRoles(): Promise<Role[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select(
      `
      *,
      role_permissions (
        permissions (
          id,
          name,
          description
        )
      )
    `
    )
    .order('name')

  if (error) throw error

  return data.map(role => ({
    ...role,
    permissions: role.role_permissions?.map((rp: { permissions: unknown }) => rp.permissions) || []
  }))
}

// Create custom role (admin only)
export async function createRole(data: { name: string; description?: string; permission_ids?: string[] }) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()

  // Create role
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .insert({
      name: data.name,
      description: data.description,
      is_system_role: false
    })
    .select()
    .single()

  if (roleError) throw roleError

  // Assign permissions
  if (data.permission_ids && data.permission_ids.length > 0) {
    const permissionAssignments = data.permission_ids.map(permId => ({
      role_id: role.id,
      permission_id: permId
    }))

    await supabase.from('role_permissions').insert(permissionAssignments)
  }

  revalidatePath('/admin/roles')
  return { success: true, role }
}

// Update role (admin only)
export async function updateRole(
  roleId: string,
  data: {
    name?: string
    description?: string
    permission_ids?: string[]
  }
) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()

  // Check if it's a system role
  const { data: role } = await supabase.from('roles').select('is_system_role').eq('id', roleId).single()

  if (role?.is_system_role) {
    throw new Error('Cannot modify system roles')
  }

  // Update role
  const updates: Record<string, string> = {}
  if (data.name) updates.name = data.name
  if (data.description !== undefined) updates.description = data.description

  if (Object.keys(updates).length > 0) {
    await supabase.from('roles').update(updates).eq('id', roleId)
  }

  // Update permissions if provided
  if (data.permission_ids) {
    // Remove existing permissions
    await supabase.from('role_permissions').delete().eq('role_id', roleId)

    // Add new permissions
    if (data.permission_ids.length > 0) {
      const permissionAssignments = data.permission_ids.map(permId => ({
        role_id: roleId,
        permission_id: permId
      }))

      await supabase.from('role_permissions').insert(permissionAssignments)
    }
  }

  revalidatePath('/admin/roles')
  return { success: true }
}

// Delete role (admin only)
export async function deleteRole(roleId: string) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()

  // Check if it's a system role
  const { data: role } = await supabase.from('roles').select('is_system_role').eq('id', roleId).single()

  if (role?.is_system_role) {
    throw new Error('Cannot delete system roles')
  }

  const { error } = await supabase.from('roles').delete().eq('id', roleId)

  if (error) throw error

  revalidatePath('/admin/roles')
  return { success: true }
}

// Assign role to user (admin only)
export async function assignRoleToUser(userId: string, roleId: string) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()
  const {
    data: { user: admin }
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('user_roles').insert({
    user_id: userId,
    role_id: roleId,
    assigned_by: admin?.id
  })

  if (error) {
    // Check if already assigned
    if (error.code === '23505') {
      throw new Error('Role already assigned to this user')
    }
    throw error
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// Remove role from user (admin only)
export async function removeRoleFromUser(userId: string, roleId: string) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()

  const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role_id', roleId)

  if (error) throw error

  revalidatePath('/admin/users')
  return { success: true }
}

// Get all permissions
export async function getPermissions() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })
    .order('action', { ascending: true })

  if (error) throw error

  return data
}

// ==================== INVITATION SYSTEM ====================
// NOTE: Invitation system removed - user_invitations table no longer exists
// Use createUser() function directly to add new users

// ==================== IMPERSONATION SESSION MANAGEMENT ====================

// Check if currently impersonating (has admin session stored)
export async function isImpersonating(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminSessionCookie = cookieStore.get(ADMIN_SESSION_BACKUP)
  return !!adminSessionCookie?.value
}

// Get the effective user ID (current user - when impersonating, it's already the impersonated user)
export async function getEffectiveUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return user?.id || null
}

// Get the effective user profile (current user's profile)
export async function getEffectiveUserProfile() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return profile
}

// Get impersonation state from cookie (for UI display)
export async function getImpersonationState() {
  const cookieStore = await cookies()
  const stateCookie = cookieStore.get(IMPERSONATION_UI_STATE)

  if (!stateCookie?.value) return null

  try {
    return JSON.parse(stateCookie.value)
  } catch {
    return null
  }
}

// Delete impersonation cookies (use on sign out)
export async function deleteImpersonationCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_BACKUP)
  cookieStore.delete(IMPERSONATION_UI_STATE)
}

// ==================== PROFILE MANAGEMENT ====================

// Update profile (full name and avatar)
export async function updateProfile(data: { full_name?: string; avatar_url?: string }) {
  const supabase = await createClient()
  const effectiveUserId = await getEffectiveUserId()

  if (!effectiveUserId) {
    throw new Error('Not authenticated')
  }

  // Update profiles table
  const { error } = await supabase.from('profiles').update(data).eq('id', effectiveUserId)

  if (error) throw error

  // Also update auth metadata to keep them in sync
  const updateData: Record<string, unknown> = {}
  if (data.full_name !== undefined) {
    updateData.full_name = data.full_name
  }
  if (data.avatar_url !== undefined) {
    updateData.avatar_url = data.avatar_url
  }

  if (Object.keys(updateData).length > 0) {
    await supabase.auth.updateUser({
      data: updateData
    })
  }

  revalidatePath('/admin/my-profile')
  revalidatePath('/user/my-profile')
  return { success: true }
}

// Change password
export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword
  })

  if (signInError) {
    throw new Error('Current password is incorrect')
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error

  return { success: true }
}

// Upload profile photo
export async function uploadProfilePhoto(formData: FormData) {
  const supabase = await createClient()
  const effectiveUserId = await getEffectiveUserId()

  if (!effectiveUserId) {
    throw new Error('Not authenticated')
  }

  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size must be less than 2MB')
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, JPEG, and PNG files are allowed')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${effectiveUserId}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, {
    cacheControl: '3600',
    upsert: true
  })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  // Get public URL
  const {
    data: { publicUrl }
  } = supabase.storage.from('avatars').getPublicUrl(fileName)

  // Update profile with new avatar URL
  await updateProfile({ avatar_url: publicUrl })

  return { success: true, url: publicUrl }
}
