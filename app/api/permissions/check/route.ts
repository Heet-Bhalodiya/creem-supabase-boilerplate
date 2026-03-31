import { NextRequest, NextResponse } from 'next/server'
import { hasPermission, hasAllPermissions } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const { permissions, requireAll } = await request.json()

    let hasAccess = false

    if (requireAll && Array.isArray(permissions)) {
      hasAccess = await hasAllPermissions(permissions)
    } else {
      hasAccess = await hasPermission(permissions)
    }

    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error('Permission check error:', error)
    return NextResponse.json({ hasAccess: false }, { status: 500 })
  }
}
