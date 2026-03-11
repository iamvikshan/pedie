import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'

const sendSource = readFileSync('src/lib/email/send.ts', 'utf8')

const exportedFunctions = [
  'sendWelcomeEmail',
  'sendOrderConfirmation',
  'sendPaymentConfirmation',
  'sendShippingUpdate',
  'sendDeliveryConfirmation',
  'sendOrderCancelled',
] as const

const templateMap: Record<string, string> = {
  sendWelcomeEmail: 'welcomeEmail',
  sendOrderConfirmation: 'orderConfirmationEmail',
  sendPaymentConfirmation: 'paymentConfirmationEmail',
  sendShippingUpdate: 'shippingUpdateEmail',
  sendDeliveryConfirmation: 'deliveryConfirmationEmail',
  sendOrderCancelled: 'orderCancelledEmail',
}

describe('send.ts source analysis', () => {
  test('imports isEmailConfigured and sendEmail from @lib/email/gmail', () => {
    expect(sendSource).toContain('isEmailConfigured')
    expect(sendSource).toContain('sendEmail')
    expect(sendSource).toMatch(
      /import\s*\{[^}]*isEmailConfigured[^}]*\}\s*from\s*['"]@lib\/email\/gmail['"]/
    )
    expect(sendSource).toMatch(
      /import\s*\{[^}]*sendEmail[^}]*\}\s*from\s*['"]@lib\/email\/gmail['"]/
    )
  })

  for (const fn of exportedFunctions) {
    describe(fn, () => {
      test('is exported as async', () => {
        expect(sendSource).toMatch(
          new RegExp(`export\\s+async\\s+function\\s+${fn}`)
        )
      })

      test('is wrapped in try/catch', () => {
        const fnMatch = sendSource.match(
          new RegExp(
            `export\\s+async\\s+function\\s+${fn}[\\s\\S]*?\\n\\}`,
            'm'
          )
        )
        expect(fnMatch).not.toBeNull()
        expect(fnMatch![0]).toContain('try')
        expect(fnMatch![0]).toContain('catch')
      })

      test('checks isEmailConfigured() before calling sendEmail', () => {
        const fnMatch = sendSource.match(
          new RegExp(
            `export\\s+async\\s+function\\s+${fn}[\\s\\S]*?\\n\\}`,
            'm'
          )
        )
        expect(fnMatch).not.toBeNull()
        const body = fnMatch![0]
        expect(body).toContain('isEmailConfigured()')
        const configIdx = body.indexOf('isEmailConfigured()')
        const sendIdx = body.indexOf('sendEmail(')
        expect(configIdx).toBeLessThan(sendIdx)
      })

      test(`calls ${templateMap[fn]} from @lib/email/templates`, () => {
        const fnMatch = sendSource.match(
          new RegExp(
            `export\\s+async\\s+function\\s+${fn}[\\s\\S]*?\\n\\}`,
            'm'
          )
        )
        expect(fnMatch).not.toBeNull()
        expect(fnMatch![0]).toContain(templateMap[fn])
      })
    })
  }
})
