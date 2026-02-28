/**
 * Magic byte signatures for common image formats.
 * Used to validate file content matches claimed MIME type.
 */
const SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header (WebP starts with RIFF....WEBP)
]

/**
 * Detect MIME type from buffer magic bytes.
 * Returns the detected MIME type or null if unrecognized.
 */
export function detectMimeType(buffer: Buffer | Uint8Array): string | null {
  if (buffer.length < 12) return null

  for (const sig of SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      // Extra check for WebP: bytes 8-11 must be 'WEBP'
      if (sig.mime === 'image/webp') {
        const webpMark = String.fromCharCode(
          buffer[8],
          buffer[9],
          buffer[10],
          buffer[11]
        )
        if (webpMark !== 'WEBP') continue
      }
      return sig.mime
    }
  }

  return null
}

/**
 * Validate that a buffer's actual content matches the claimed MIME type.
 */
export function validateMagicBytes(
  buffer: Buffer | Uint8Array,
  claimedMime: string
): boolean {
  const detected = detectMimeType(buffer)
  if (!detected) return false
  return detected === claimedMime
}
