/**
 * M-Pesa Daraja API client (sandbox)
 * https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 */

const SANDBOX_URL = 'https://sandbox.safaricom.co.ke'

/** Format phone for Daraja (254XXXXXXXXX) */
export function formatPhoneForDaraja(phone: string): string {
  // Strip leading '+' before removing non-digits so we detect international prefix
  const stripped = phone.startsWith('+') ? phone.slice(1) : phone
  let cleaned = stripped.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1)
  }
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned
  }
  return cleaned
}

/** Get OAuth access token */
export async function getOAuthToken(): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa consumer key/secret not configured')
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    'base64'
  )
  const res = await fetch(
    `${SANDBOX_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  )
  if (!res.ok) throw new Error(`OAuth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

/** Generate STK Push password */
export function generatePassword(
  shortcode: string,
  passkey: string,
  timestamp: string
): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
}

/** Format timestamp for Daraja (YYYYMMDDHHmmss) */
export function getTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

export interface STKPushRequest {
  phone: string
  amount: number
  orderId: string
  description?: string
}

export interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

/** Initiate STK Push */
export async function initiateSTKPush(
  req: STKPushRequest
): Promise<STKPushResponse> {
  const token = await getOAuthToken()
  const shortcode = process.env.MPESA_SHORTCODE || '174379'
  const passkey = process.env.MPESA_PASSKEY || ''
  const callbackUrl = process.env.MPESA_CALLBACK_URL
  if (!callbackUrl) {
    throw new Error('MPESA_CALLBACK_URL is required')
  }

  const timestamp = getTimestamp()
  const password = generatePassword(shortcode, passkey, timestamp)
  const phone = formatPhoneForDaraja(req.phone)

  const res = await fetch(`${SANDBOX_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(req.amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: req.orderId,
      TransactionDesc: req.description || `Pedie Tech Order ${req.orderId}`,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`STK Push failed: ${res.status} ${error}`)
  }

  return res.json()
}

export interface STKCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value: string | number }>
      }
    }
  }
}

/** Parse callback from Safaricom */
export function parseCallback(body: STKCallback) {
  const cb = body.Body.stkCallback
  const success = cb.ResultCode === 0
  const metadata: Record<string, string | number> = {}

  if (cb.CallbackMetadata?.Item) {
    for (const item of cb.CallbackMetadata.Item) {
      metadata[item.Name] = item.Value
    }
  }

  return {
    success,
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    amount: metadata.Amount as number | undefined,
    mpesaReceiptNumber: metadata.MpesaReceiptNumber as string | undefined,
    transactionDate: metadata.TransactionDate as string | undefined,
    phoneNumber: metadata.PhoneNumber as string | undefined,
  }
}

/** Query STK Push status */
export async function querySTKStatus(checkoutRequestId: string) {
  const token = await getOAuthToken()
  const shortcode = process.env.MPESA_SHORTCODE || '174379'
  const passkey = process.env.MPESA_PASSKEY || ''
  const timestamp = getTimestamp()
  const password = generatePassword(shortcode, passkey, timestamp)

  const res = await fetch(`${SANDBOX_URL}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  })

  if (!res.ok) throw new Error(`STK query failed: ${res.status}`)
  return res.json()
}
