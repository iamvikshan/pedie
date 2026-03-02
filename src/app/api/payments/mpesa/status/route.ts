import { querySTKStatus } from '@lib/payments/mpesa'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const checkoutRequestId = searchParams.get('checkoutRequestId')

  if (!checkoutRequestId) {
    return NextResponse.json(
      { error: 'checkoutRequestId is required' },
      { status: 400 }
    )
  }

  try {
    const result = await querySTKStatus(checkoutRequestId)
    // Sanitize: return only relevant fields
    return NextResponse.json({
      ResultCode: result.ResultCode,
      ResultDesc: result.ResultDesc,
      MpesaReceiptNumber: result.MpesaReceiptNumber,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
