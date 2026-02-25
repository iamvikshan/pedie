import { sendEmail, isEmailConfigured } from '@lib/email/gmail'
import {
  welcomeEmail,
  orderConfirmationEmail,
  paymentConfirmationEmail,
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
