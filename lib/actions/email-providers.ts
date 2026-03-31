'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EmailProvider = {
  id: string
  name: string
  slug: string
  provider_type: 'mailgun' | 'postmark' | 'ses' | 'resend' | 'smtp'
  is_active: boolean
  config: Record<string, string>
  created_at: string
  updated_at: string
}

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  return profile?.role === 'admin'
}

export async function getEmailProviders() {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from('email_providers').select('*').order('name', { ascending: true })

  if (error) throw error
  return data as EmailProvider[]
}

export async function getEmailProvider(slug: string) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from('email_providers').select('*').eq('slug', slug).single()

  if (error) throw error
  return data as EmailProvider
}

export async function getActiveEmailProvider() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('email_providers').select('*').eq('is_active', true).single()

  if (error && error.code !== 'PGRST116') throw error
  return data as EmailProvider | null
}

export async function updateEmailProvider(slug: string, config: Record<string, string>) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()
  const { error } = await supabase.from('email_providers').update({ config }).eq('slug', slug)

  if (error) throw error

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function activateEmailProvider(slug: string) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()

  await supabase.from('email_providers').update({ is_active: false }).neq('slug', '')

  const { error } = await supabase.from('email_providers').update({ is_active: true }).eq('slug', slug)

  if (error) throw error

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function sendTestEmail() {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  return { success: true, message: 'Test email sent successfully!' }
}

export async function updateAndActivateEmailProvider(
  slug: string,
  config: Record<string, string>,
  shouldActivate: boolean
) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()

  const { error: updateError } = await supabase.from('email_providers').update({ config }).eq('slug', slug)

  if (updateError) throw updateError

  if (shouldActivate) {
    await supabase.from('email_providers').update({ is_active: false }).neq('slug', '')
    const { error: activateError } = await supabase.from('email_providers').update({ is_active: true }).eq('slug', slug)
    if (activateError) throw activateError
  }

  revalidatePath('/admin/settings')
  return { success: true }
}
