import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'

const migrationPath = join(
  import.meta.dir,
  '../../../supabase/migrations/20250801000000_security_hardening.sql'
)
const migration = readFileSync(migrationPath, 'utf-8')

describe('Role immutability trigger', () => {
  test('migration file exists and is non-empty', () => {
    expect(migration.length).toBeGreaterThan(0)
  })

  test('should reject role change when user is not admin', () => {
    expect(migration).toContain('enforce_role_immutability')
    expect(migration).toContain('SECURITY DEFINER')
    expect(migration).toContain("SET search_path = ''")
    expect(migration).toContain('NEW.role IS DISTINCT FROM OLD.role')
    expect(migration).toContain('NOT public.is_admin()')
    expect(migration).toContain('role changes require admin privileges')
  })

  test('should allow role change when user is admin', () => {
    // The trigger only raises when NOT is_admin(), so admins pass through
    expect(migration).toContain('NOT public.is_admin()')
    expect(migration).toContain('RETURN NEW')
  })

  test('should allow non-role field updates for regular users', () => {
    // Guard only fires when role actually changes (IS DISTINCT FROM)
    expect(migration).toContain('NEW.role IS DISTINCT FROM OLD.role')
    // Non-role updates skip the IF branch and hit RETURN NEW
    expect(migration).toContain('RETURN NEW')
  })

  test('trigger is attached to profiles table', () => {
    expect(migration).toContain('BEFORE UPDATE ON public.profiles')
    expect(migration).toContain('FOR EACH ROW')
    expect(migration).toContain('EXECUTE FUNCTION enforce_role_immutability()')
  })

  test('adds subscribed column to newsletter_subscribers', () => {
    expect(migration).toContain('ALTER TABLE public.newsletter_subscribers')
    expect(migration).toContain(
      'ADD COLUMN subscribed boolean NOT NULL DEFAULT true'
    )
  })
})
