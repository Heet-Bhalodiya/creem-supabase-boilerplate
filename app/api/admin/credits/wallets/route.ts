import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Create Supabase client
    const supabase = await createClient()

    // Check if current user is admin
    const {
      data: { user: currentUser },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin permissions
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch credit wallets with user information
    const { data: wallets, error: walletsError } = await supabase
      .from('credits_wallets')
      .select(
        `
        *,
        profiles (
          email,
          full_name
        )
      `
      )
      .order('current_balance', { ascending: false })
      .range(offset, offset + limit - 1)

    if (walletsError) {
      console.error('Wallets fetch error:', walletsError)
      return NextResponse.json({ error: 'Failed to fetch credit wallets' }, { status: 500 })
    }

    // Transform the data to include user email and name at the top level
    const transformedWallets =
      wallets?.map(
        (wallet: {
          id: string
          user_id: string
          current_balance: number
          lifetime_earned: number
          lifetime_spent: number
          last_activity: string | null
          created_at: string
          updated_at: string
        }) => ({
          id: wallet.id,
          user_id: wallet.user_id,
          user_email: '', // Will be fetched separately if needed
          user_name: '', // Will be fetched separately if needed
          current_balance: wallet.current_balance,
          lifetime_earned: wallet.lifetime_earned,
          lifetime_spent: wallet.lifetime_spent,
          last_activity: wallet.last_activity,
          created_at: wallet.created_at
        })
      ) || []

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('credits_wallets')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Count fetch error:', countError)
    }

    return NextResponse.json({
      success: true,
      wallets: transformedWallets,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        has_more: (totalCount || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Credit wallets API error:', error)
    return NextResponse.json({ error: 'Internal server error while fetching wallets' }, { status: 500 })
  }
}
