import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, amount, type, description, source } = body

    // Validation
    if (!userEmail || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields: userEmail, amount, description' }, { status: 400 })
    }

    if (amount <= 0 || amount > 100000) {
      return NextResponse.json({ error: 'Amount must be between 1 and 100,000 credits' }, { status: 400 })
    }

    // Create regular Supabase client to check authentication
    const supabase = await createClient()

    // Check if current user is admin
    const {
      data: { user: currentUser },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Verify admin permissions (check if user has admin role)
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Now use service role client for privileged operations
    const serviceSupabase = createServiceRoleClient()

    // Find target user by email
    const { data: targetUser } = await serviceSupabase.auth.admin.listUsers()
    const user = targetUser.users.find((u: { email?: string }) => u.email === userEmail)

    if (!user) {
      return NextResponse.json({ error: `User with email ${userEmail} not found` }, { status: 404 })
    }

    // Grant credits using the update_credits_balance function
    const { error: creditError } = await serviceSupabase.rpc('update_credits_balance', {
      p_user_id: user.id,
      p_amount: amount,
      p_type: type || 'earned',
      p_description: description,
      p_source: source || 'bonus',
      p_metadata: {
        admin_user_id: currentUser.id,
        admin_email: currentUser.email,
        granted_at: new Date().toISOString()
      }
    })

    if (creditError) {
      console.error('Credit grant error:', creditError)
      return NextResponse.json({ error: `Failed to grant credits: ${creditError.message}` }, { status: 500 })
    }

    // Get updated wallet balance
    const { data: wallet } = await serviceSupabase
      .from('credits_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      message: `Successfully granted ${amount} credits to ${userEmail}`,
      data: {
        user_email: userEmail,
        user_id: user.id,
        amount_granted: amount,
        current_balance: wallet?.balance || 0,
        transaction_type: type,
        description,
        source
      }
    })
  } catch (error) {
    console.error('Credit grant API error:', error)
    return NextResponse.json({ error: 'Internal server error while granting credits' }, { status: 500 })
  }
}
