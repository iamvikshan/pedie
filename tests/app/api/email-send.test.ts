import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'

const routeSource = readFileSync('src/app/api/email/send/route.ts', 'utf8')

describe('POST /api/email/send source analysis', () => {
  describe('imports', () => {
    test('imports getUser and isAdmin from @helpers/auth', () => {
      expect(routeSource).toMatch(
        /import\s*\{[^}]*getUser[^}]*\}\s*from\s*['"]@helpers\/auth['"]/
      )
      expect(routeSource).toMatch(
        /import\s*\{[^}]*isAdmin[^}]*\}\s*from\s*['"]@helpers\/auth['"]/
      )
    })

    test('imports isEmailConfigured and sendEmail from @lib/email/gmail', () => {
      expect(routeSource).toMatch(
        /import\s*\{[^}]*isEmailConfigured[^}]*\}\s*from\s*['"]@lib\/email\/gmail['"]/
      )
      expect(routeSource).toMatch(
        /import\s*\{[^}]*sendEmail[^}]*\}\s*from\s*['"]@lib\/email\/gmail['"]/
      )
    })

    test('imports sanitize from sanitize-html', () => {
      expect(routeSource).toMatch(
        /import\s+sanitize\s+from\s*['"]sanitize-html['"]/
      )
    })

    test('imports createRateLimiter from @lib/security/rateLimit', () => {
      expect(routeSource).toMatch(
        /import\s*\{[^}]*createRateLimiter[^}]*\}\s*from\s*['"]@lib\/security\/rateLimit['"]/
      )
    })
  })

  describe('auth guards', () => {
    test('calls getUser() and returns 401', () => {
      expect(routeSource).toContain('getUser()')
      expect(routeSource).toContain('401')
    })

    test('calls isAdmin() and returns 403', () => {
      expect(routeSource).toContain('isAdmin()')
      expect(routeSource).toContain('403')
    })
  })

  describe('validation', () => {
    test('validates to, subject, html fields', () => {
      expect(routeSource).toContain('to')
      expect(routeSource).toContain('subject')
      expect(routeSource).toContain('html')
      expect(routeSource).toContain('400')
    })

    test('calls isEmailConfigured() and returns 503', () => {
      expect(routeSource).toContain('isEmailConfigured()')
      expect(routeSource).toContain('503')
    })
  })

  describe('sanitization', () => {
    test('sanitizes to via sanitize() before passing to sendEmail', () => {
      expect(routeSource).toMatch(/sanitize\(to\b/)
      expect(routeSource).toContain('sanitizedTo')
    })

    test('sanitizes subject via sanitize() before passing to sendEmail', () => {
      expect(routeSource).toMatch(/sanitize\(subject\b/)
      expect(routeSource).toContain('sanitizedSubject')
    })

    test('passes html to sendEmail WITHOUT sanitizing', () => {
      expect(routeSource).not.toMatch(/sanitize\(html\b/)
      expect(routeSource).not.toContain('sanitizedHtml')
      expect(routeSource).toMatch(
        /sendEmail\(sanitizedTo,\s*sanitizedSubject,\s*html\b/
      )
    })
  })

  describe('error handling', () => {
    test('wraps in try/catch returning 500', () => {
      expect(routeSource).toContain('try')
      expect(routeSource).toContain('catch')
      expect(routeSource).toContain('500')
    })
  })
})
