'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type OpenGraphSettings = {
  enabled: boolean
  add_logo: boolean
  logo_style: 'light' | 'dark'
  add_screenshot: boolean
  template: string
  start_color: string
  end_color: string
  text_color: string
  preview_title: string
  preview_image: string
  preview_url: string
}

export type InvoiceSettings = {
  enabled: boolean
  invoice_prefix: string
  company_name: string
  company_code: string
  company_address: string
  company_tax_number: string
  company_phone: string
}

// Helper to check if user is admin
async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  return profile?.role === 'admin'
}

// Get Open Graph settings
export async function getOpenGraphSettings(): Promise<OpenGraphSettings> {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'open_graph')
    .single()

  if (error) throw error
  return data.setting_value as OpenGraphSettings
}

// Update Open Graph settings
export async function updateOpenGraphSettings(settings: Partial<OpenGraphSettings>) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()

  // Get current settings
  const { data: current } = await supabase
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'open_graph')
    .single()

  // Merge with new settings
  const updatedSettings = {
    ...((current?.setting_value as OpenGraphSettings) || {}),
    ...settings
  }

  const { error } = await supabase
    .from('app_settings')
    .update({ setting_value: updatedSettings })
    .eq('setting_key', 'open_graph')

  if (error) throw error

  revalidatePath('/admin/settings')
  return { success: true }
}

// Get Invoice settings (public - for invoice generation)
export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'invoice')
    .maybeSingle()

  // Return default settings if none exist
  if (!data || error) {
    return {
      enabled: true,
      company_name: '',
      company_code: '',
      company_address: '',
      company_tax_number: '',
      company_phone: '',
      invoice_prefix: 'INV'
    }
  }

  return data.setting_value as InvoiceSettings
}

// Update Invoice settings (admin only)
export async function updateInvoiceSettings(settings: Partial<InvoiceSettings>) {
  if (!(await isAdmin())) {
    throw new Error('Unauthorized: Admin access required')
  }

  const supabase = await createClient()

  // Get current settings
  const { data: current } = await supabase
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'invoice')
    .single()

  // Merge with new settings
  const updatedSettings = {
    ...((current?.setting_value as InvoiceSettings) || {}),
    ...settings
  }

  const { error } = await supabase
    .from('app_settings')
    .update({ setting_value: updatedSettings })
    .eq('setting_key', 'invoice')

  if (error) throw error

  revalidatePath('/admin/settings')
  return { success: true }
}
