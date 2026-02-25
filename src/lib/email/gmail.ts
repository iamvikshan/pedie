import { google } from 'googleapis'

/**
 * Check if all required Gmail environment variables are set.
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN &&
    process.env.GMAIL_SENDER_EMAIL
  )
}

/**
 * Send an email via Gmail API using OAuth2 with a pre-configured refresh token.
 * Throws on failure — callers are responsible for error handling.
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  // Sanitise headers to prevent header injection
  const sanitizedTo = to.replace(/[\r\n]/g, '')
  const sanitizedSubject = subject.replace(/[\r\n]/g, '')

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const senderEmail = process.env.GMAIL_SENDER_EMAIL
  if (!senderEmail) {
    throw new Error('GMAIL_SENDER_EMAIL not set')
  }

  // Build RFC 2822 message
  const messageParts = [
    `From: ${senderEmail}`,
    `To: ${sanitizedTo}`,
    `Subject: ${sanitizedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody,
  ]
  const message = messageParts.join('\r\n')

  // Encode as base64url
  const raw = Buffer.from(message).toString('base64url')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}
