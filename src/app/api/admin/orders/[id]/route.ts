import { NextResponse } from 'next/server'
import { getUser } from '@lib/auth/helpers'
import { isUserAdmin } from '@lib/auth/admin'
import { getAdminOrderDetail, updateOrder } from '@lib/data/admin'
import { createAdminClient } from '@lib/supabase/admin'
import {
  sendShippingUpdate,
  sendDeliveryConfirmation,
  sendOrderCancelled,
} from '@lib/email/send'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const detail = await getAdminOrderDetail(id)

    if (!detail.order) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(detail)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, tracking_info, notes } = body

    // Validate status against allowed values
    const allowedStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ] as const

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate tracking_info is a plain object if provided
    if (tracking_info !== undefined && tracking_info !== null) {
      if (typeof tracking_info !== 'object' || Array.isArray(tracking_info)) {
        return NextResponse.json(
          { error: 'tracking_info must be a plain object' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (tracking_info !== undefined) updateData.tracking_info = tracking_info
    if (notes !== undefined) updateData.notes = notes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      )
    }

    const order = await updateOrder(id, updateData)

    // Fire-and-forget email notifications on status change
    if (status) {
      void sendStatusEmail(id, status, order)
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendStatusEmail(
  orderId: string,
  status: string,
  order: Record<string, unknown>
) {
  try {
    const supabase = createAdminClient()
    const userId = order.user_id as string
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    // Look up user email from auth.users via admin client
    const {
      data: { user: authUser },
    } = await supabase.auth.admin.getUserById(userId)

    const email = authUser?.email
    if (!email) return

    const userName = (profile?.full_name as string) ?? 'Customer'
    const trackingInfo = order.tracking_info as Record<string, string> | null

    if (status === 'shipped') {
      await sendShippingUpdate(email, {
        userName,
        orderId,
        trackingInfo: trackingInfo?.tracking_number,
        carrier: trackingInfo?.carrier,
      })
    } else if (status === 'delivered') {
      await sendDeliveryConfirmation(email, { userName, orderId })
    } else if (status === 'cancelled') {
      await sendOrderCancelled(email, {
        userName,
        orderId,
        reason: (order.notes as string) ?? undefined,
      })
    }
  } catch (error) {
    console.error('Failed to send status email:', error)
  }
}
