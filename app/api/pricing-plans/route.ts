import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: plans, error } = await supabase.from('pricing_plans').select('*').eq('is_active', true).order('price')

    if (error) {
      console.error('Error fetching pricing plans:', error)
      return NextResponse.json([])
    }

    return NextResponse.json(plans || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json([])
  }
}
