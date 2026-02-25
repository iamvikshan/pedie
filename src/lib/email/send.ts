import { sendEmail, isEmailConfigured } from '@lib/email/gmail'
import {
  welcomeEmail,
  orderConfirmationEmail,
  paymentConfirmationEmail,
  shippingUpdateEmail,
  deliveryConfirmationEmail,
  orderCancelledEmail,
} from '@lib/email/templates'

export interface OrderConfirmationData {
  userName: string
  orderId: string
  items: Array<{ name: string; price: number }>
  total: number
  depositAmount: number
  paymentMethod: string
}

export interface PaymentConfirmationData {
  userName: string
  orderId: string
  amount: number
  paymentMethod: string
  receiptNumber: string
}

export interface ShippingUpdateData {
  userName: string
  orderId: string
  trackingInfo?: string
  carrier?: string
}

export interface DeliveryConfirmationData {
  userName: string
  orderId: string
}

export interface OrderCancelledData {
  userName: string
  orderId: string
  reason?: string
}

/**
 * Send a welcome email to a new user. Fire-and-forget.
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      console.warn('Email not configured, skipping welcome email')
      return
    }
    const { subject, html } = welcomeEmail(userName)
    await sendEmail(email, subject, html)
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

/**
 * Send an order confirmation email. Fire-and-forget.
 */
export async function sendOrderConfirmation(
  email: string,
  data: OrderConfirmationData
): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      console.warn('Email not configured, skipping order confirmation email')
      return
    }
    const { subject, html } = orderConfirmationEmail(data)
    await sendEmail(email, subject, html)
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
  }
}

/**
 * Send a payment confirmation email. Fire-and-forget.
 */
export async function sendPaymentConfirmation(
  email: string,
  data: PaymentConfirmationData
): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      console.warn('Email not configured, skipping payment confirmation email')
      return
    }
    const { subject, html } = paymentConfirmationEmail(data)
    await sendEmail(email, subject, html)
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error)
  }
}

/**
 * Send a shipping update email. Fire-and-forget.
 */
export async function sendShippingUpdate(
  email: string,
  data: ShippingUpdateData
): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      console.warn('Email not configured, skipping shipping update email')
      return
    }
    const { subject, html } = shippingUpdateEmail(data)
    await sendEmail(email, subject, html)
  } catch (error) {
    console.error('Failed to send shipping update email:', error)
  }
}

/**
 * Send a delivery confirmation email. Fire-and-forget.
 */
export async function sendDeliveryConfirmation(
  email: string,
  data: DeliveryConfirmationData
): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      console.warn('Email not configured, skipping delivery confirmation email')
      return
    }
    const { subject, html } = deliveryConfirmationEmail(data)
    await sendEmail(email, subject, html)
  } catch (error) {
    console.error('Failed to send delivery confirmation email:', error)
  }
}

/**
 * Send an order cancelled email. Fire-and-forget.
 */
export async function sendOrderCancelled(
  email: string,
  data: OrderCancelledData
): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      console.warn('Email not configured, skipping order cancelled email')
      return
    }
    const { subject, html } = orderCancelledEmail(data)
    await sendEmail(email, subject, html)
  } catch (error) {
    console.error('Failed to send order cancelled email:', error)
  }
}
