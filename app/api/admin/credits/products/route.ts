import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all credit products
export async function GET() {
  try {
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

    // Fetch credit products
    const { data: products, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('payment_type', 'one_time')
      .eq('grants_credits', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Products fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch credit products' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: products || []
    })
  } catch (error) {
    console.error('Credit products API error:', error)
    return NextResponse.json({ error: 'Internal server error while fetching products' }, { status: 500 })
  }
}

// POST - Create new credit product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, credits_per_cycle, price, currency, active, features, creem_product_id } = body

    // Validation
    if (!name || !credits_per_cycle || !price || !creem_product_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, credits_per_cycle, price, creem_product_id' },
        { status: 400 }
      )
    }

    if (credits_per_cycle <= 0 || credits_per_cycle > 100000) {
      return NextResponse.json({ error: 'Credits per cycle must be between 1 and 100,000' }, { status: 400 })
    }

    if (!Number.isInteger(price) || price <= 0 || price > 10000000) {
      return NextResponse.json(
        { error: 'Price must be an integer between 1 and 10,000,000 cents ($0.01 to $100,000)' },
        { status: 400 }
      )
    }

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

    // Check if creem_product_id already exists
    const { data: existingProduct } = await supabase
      .from('pricing_plans')
      .select('id')
      .eq('creem_product_id', creem_product_id)
      .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Creem Product ID already exists. Each product must have a unique ID.' },
        { status: 400 }
      )
    }

    // Create credit product
    const { data: product, error: createError } = await supabase
      .from('pricing_plans')
      .insert({
        name,
        description,
        credits_per_cycle: credits_per_cycle,
        price,
        currency: currency || 'usd',
        interval: 'one_time',
        payment_type: 'one_time',
        grants_credits: true,
        is_active: active ?? true,
        features: features || [],
        creem_product_id
      })
      .select()
      .single()

    if (createError) {
      console.error('Product creation error:', createError)
      return NextResponse.json({ error: `Failed to create product: ${createError.message}` }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully created credit product: ${name}`,
        product
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Credit product creation API error:', error)
    return NextResponse.json({ error: 'Internal server error while creating product' }, { status: 500 })
  }
}
