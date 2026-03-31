import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH - Update credit product
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { id: productId } = await params

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

    // If updating creem_product_id, check for uniqueness
    if (body.creem_product_id) {
      const { data: existingProduct } = await supabase
        .from('pricing_plans')
        .select('id')
        .eq('creem_product_id', body.creem_product_id)
        .neq('id', productId)
        .single()

      if (existingProduct) {
        return NextResponse.json(
          { error: 'Creem Product ID already exists. Each product must have a unique ID.' },
          { status: 400 }
        )
      }
    }

    // Validate price if provided (should be in cents)
    if (body.price !== undefined) {
      if (!Number.isInteger(body.price) || body.price <= 0 || body.price > 10000000) {
        return NextResponse.json(
          { error: 'Price must be an integer between 1 and 10,000,000 cents ($0.01 to $100,000)' },
          { status: 400 }
        )
      }
    }

    // Update credit product
    // Transform active field to is_active for database compatibility
    const updateData = { ...body }
    if ('active' in updateData) {
      updateData.is_active = updateData.active
      delete updateData.active
    }
    if ('is_active' in updateData) {
      updateData.is_active = updateData.is_active
    }

    const { data: product, error: updateError } = await supabase
      .from('pricing_plans')
      .update(updateData)
      .eq('id', productId)
      .eq('payment_type', 'one_time')
      .eq('grants_credits', true)
      .select()
      .single()

    if (updateError) {
      console.error('Product update error:', updateError)
      return NextResponse.json({ error: `Failed to update product: ${updateError.message}` }, { status: 500 })
    }

    if (!product) {
      return NextResponse.json({ error: 'Credit product not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully updated credit product',
      product
    })
  } catch (error) {
    console.error('Credit product update API error:', error)
    return NextResponse.json({ error: 'Internal server error while updating product' }, { status: 500 })
  }
}

// DELETE - Remove credit product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params

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

    // Check if product exists and is a credit product
    const { data: existingProduct } = await supabase
      .from('pricing_plans')
      .select('id, name')
      .eq('id', productId)
      .eq('payment_type', 'one_time')
      .eq('grants_credits', true)
      .single()

    if (!existingProduct) {
      return NextResponse.json({ error: 'Credit product not found' }, { status: 404 })
    }

    // Delete credit product - simplified to avoid constraint issues
    const { error: deleteError } = await supabase.from('pricing_plans').delete().eq('id', productId)

    if (deleteError) {
      console.error('Product deletion error:', deleteError)
      return NextResponse.json({ error: `Failed to delete product: ${deleteError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted credit product: ${existingProduct.name}`
    })
  } catch (error) {
    console.error('Credit product deletion API error:', error)
    return NextResponse.json({ error: 'Internal server error while deleting product' }, { status: 500 })
  }
}
