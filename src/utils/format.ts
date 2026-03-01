/**
 * Shared formatting utilities.
 *
 * Import from '@utils/format'.
 */

/**
 * Format a date string consistently for the admin UI.
 * Uses en-KE locale and Africa/Nairobi timezone.
 */
export function formatAdminDate(
  date: string | Date | null | undefined,
  options?: { includeTime?: boolean }
): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '—'
    if (options?.includeTime) {
      return d.toLocaleString('en-KE', {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    return d.toLocaleDateString('en-KE', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Validate that a URL is safe (http/https only).
 * Returns true if the URL is a valid http(s) URL, false otherwise.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
