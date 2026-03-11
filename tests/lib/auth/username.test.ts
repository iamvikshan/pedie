import { describe, expect, test } from 'bun:test'

import { isEmail, isValidUsername } from '@lib/auth/username'

describe('isValidUsername', () => {
  test('accepts valid usernames', () => {
    expect(isValidUsername('abc')).toBe(true)
    expect(isValidUsername('john_doe')).toBe(true)
    expect(isValidUsername('user123')).toBe(true)
    expect(isValidUsername('a1b2c3')).toBe(true)
    expect(isValidUsername('test_user_name')).toBe(true)
  })

  test('rejects too short', () => {
    expect(isValidUsername('ab')).toBe(false)
    expect(isValidUsername('a')).toBe(false)
    expect(isValidUsername('')).toBe(false)
  })

  test('rejects too long', () => {
    expect(isValidUsername('a'.repeat(21))).toBe(false)
  })

  test('rejects invalid characters', () => {
    expect(isValidUsername('UPPER')).toBe(false)
    expect(isValidUsername('has space')).toBe(false)
    expect(isValidUsername('has-dash')).toBe(false)
    expect(isValidUsername('has.dot')).toBe(false)
    expect(isValidUsername('user@name')).toBe(false)
  })

  test('rejects leading digit or underscore', () => {
    expect(isValidUsername('1abc')).toBe(false)
    expect(isValidUsername('_abc')).toBe(false)
  })

  test('rejects trailing or consecutive underscores', () => {
    expect(isValidUsername('abc_')).toBe(false)
    expect(isValidUsername('abc__def')).toBe(false)
  })
})

describe('isEmail', () => {
  test('detects email addresses', () => {
    expect(isEmail('user@example.com')).toBe(true)
    expect(isEmail('a@b')).toBe(true)
  })

  test('does not detect usernames as email', () => {
    expect(isEmail('john_doe')).toBe(false)
    expect(isEmail('username123')).toBe(false)
  })
})
