export interface EmailTemplate {
  subject: string
  html: string
}

/**
 * Escape HTML special characters to prevent XSS / injection
 * in email templates.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatKES(amount: number): string {
  return amount.toLocaleString('en-KE')
}

function wrapInLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pedie Tech</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;">
    <!-- Header -->
    <div style="background-color:#22c55e;padding:24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;">Pedie Tech</h1>
    </div>
    <!-- Content -->
    <div style="padding:32px 24px;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="background-color:#f4f4f5;padding:20px 24px;text-align:center;font-size:13px;color:#71717a;">
      <p style="margin:0 0 4px 0;">&copy; ${new Date().getFullYear()} Pedie Tech</p>
      <p style="margin:0;">Need help? Contact us at support@pedietech.com</p>
    </div>
  </div>
</body>
</html>`
}

export function welcomeEmail(userName: string): EmailTemplate {
  const content = `
    <h2 style="color:#18181b;margin:0 0 16px 0;">Welcome, ${escapeHtml(userName)}!</h2>
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      Thank you for joining Pedie Tech. We're excited to have you on board!
    </p>
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      Browse our collection of quality products and find exactly what you need.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://pedietech.com" style="display:inline-block;background-color:#22c55e;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:bold;">
        Start Shopping
      </a>
    </div>
  `

  return {
    subject: 'Welcome to Pedie Tech!',
    html: wrapInLayout(content),
  }
}

export function orderConfirmationEmail(data: {
  userName: string
  orderId: string
  items: Array<{ name: string; price: number }>
  total: number
  depositAmount: number
  paymentMethod: string
}): EmailTemplate {
  const itemRows = data.items
    .map(
      item =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;color:#3f3f46;">${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;color:#3f3f46;text-align:right;">KES ${formatKES(item.price)}</td>
        </tr>`
    )
    .join('')

  const content = `
    <h2 style="color:#18181b;margin:0 0 16px 0;">Order Confirmed!</h2>
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      Hi ${escapeHtml(data.userName)}, your order <strong>${escapeHtml(data.orderId)}</strong> has been placed successfully.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:2px solid #22c55e;color:#18181b;">Item</th>
          <th style="text-align:right;padding:8px 0;border-bottom:2px solid #22c55e;color:#18181b;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
    <div style="margin:16px 0;padding:16px;background-color:#f4f4f5;border-radius:6px;">
      <p style="margin:0 0 8px 0;color:#3f3f46;"><strong>Total:</strong> KES ${formatKES(data.total)}</p>
      <p style="margin:0 0 8px 0;color:#3f3f46;"><strong>Deposit Paid:</strong> KES ${formatKES(data.depositAmount)}</p>
      <p style="margin:0;color:#3f3f46;"><strong>Payment Method:</strong> ${escapeHtml(data.paymentMethod)}</p>
    </div>
  `

  return {
    subject: `Order Confirmation — ${data.orderId}`,
    html: wrapInLayout(content),
  }
}

export function shippingUpdateEmail(data: {
  userName: string
  orderId: string
  trackingInfo?: string
  carrier?: string
}): EmailTemplate {
  const trackingSection = data.trackingInfo
    ? `<p style="margin:0 0 8px 0;color:#3f3f46;"><strong>Tracking Number:</strong> ${escapeHtml(data.trackingInfo)}</p>`
    : ''
  const carrierSection = data.carrier
    ? `<p style="margin:0 0 8px 0;color:#3f3f46;"><strong>Carrier:</strong> ${escapeHtml(data.carrier)}</p>`
    : ''

  const content = `
    <h2 style="color:#18181b;margin:0 0 16px 0;">Your Order Has Shipped!</h2>
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      Hi ${escapeHtml(data.userName)}, your order <strong>${escapeHtml(data.orderId)}</strong> is on its way!
    </p>
    <div style="margin:16px 0;padding:16px;background-color:#f4f4f5;border-radius:6px;">
      ${carrierSection}
      ${trackingSection}
    </div>
    <p style="color:#3f3f46;line-height:1.6;margin:16px 0 0 0;">
      We'll let you know once it's been delivered. Thank you for shopping with Pedie Tech!
    </p>
  `

  return {
    subject: `Shipping Update — ${data.orderId}`,
    html: wrapInLayout(content),
  }
}

export function deliveryConfirmationEmail(data: {
  userName: string
  orderId: string
}): EmailTemplate {
  const content = `
    <h2 style="color:#18181b;margin:0 0 16px 0;">Your Order Has Been Delivered!</h2>
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      Hi ${escapeHtml(data.userName)}, your order <strong>${escapeHtml(data.orderId)}</strong> has been delivered.
    </p>
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      We hope you love your purchase! If you have any questions or feedback, don't hesitate to reach out.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://pedietech.com/account/orders" style="display:inline-block;background-color:#22c55e;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:bold;">
        View Your Orders
      </a>
    </div>
  `

  return {
    subject: `Delivery Confirmation — ${data.orderId}`,
    html: wrapInLayout(content),
  }
}

export function orderCancelledEmail(data: {
  userName: string
  orderId: string
  reason?: string
}): EmailTemplate {
  const reasonSection = data.reason
    ? `<p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;"><strong>Reason:</strong> ${escapeHtml(data.reason)}</p>`
    : ''

  const content = `
    <h2 style="color:#18181b;margin:0 0 16px 0;">Order Cancelled</h2>
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      Hi ${escapeHtml(data.userName)}, your order <strong>${escapeHtml(data.orderId)}</strong> has been cancelled.
    </p>
    ${reasonSection}
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      If you believe this was a mistake or need assistance, please contact our support team.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://pedietech.com" style="display:inline-block;background-color:#22c55e;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:bold;">
        Continue Shopping
      </a>
    </div>
  `

  return {
    subject: `Order Cancelled — ${data.orderId}`,
    html: wrapInLayout(content),
  }
}

export function paymentConfirmationEmail(data: {
  userName: string
  orderId: string
  amount: number
  paymentMethod: string
  receiptNumber: string
}): EmailTemplate {
  const content = `
    <h2 style="color:#18181b;margin:0 0 16px 0;">Payment Received!</h2>
    <p style="color:#3f3f46;line-height:1.6;margin:0 0 16px 0;">
      Hi ${escapeHtml(data.userName)}, we've received your payment for order <strong>${escapeHtml(data.orderId)}</strong>.
    </p>
    <div style="margin:16px 0;padding:16px;background-color:#f4f4f5;border-radius:6px;">
      <p style="margin:0 0 8px 0;color:#3f3f46;"><strong>Amount:</strong> KES ${formatKES(data.amount)}</p>
      <p style="margin:0 0 8px 0;color:#3f3f46;"><strong>Payment Method:</strong> ${escapeHtml(data.paymentMethod)}</p>
      <p style="margin:0;color:#3f3f46;"><strong>Receipt Number:</strong> ${escapeHtml(data.receiptNumber)}</p>
    </div>
    <p style="color:#3f3f46;line-height:1.6;margin:16px 0 0 0;">
      Thank you for shopping with Pedie Tech!
    </p>
  `

  return {
    subject: `Payment Confirmation — ${data.orderId}`,
    html: wrapInLayout(content),
  }
}
