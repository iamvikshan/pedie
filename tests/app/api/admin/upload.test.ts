import { describe, test, expect, mock, beforeEach } from 'bun:test'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockGetUser = mock(() => Promise.resolve(null as any))
const mockIsUserAdmin = mock(() => Promise.resolve(false))

mock.module('@helpers/auth', () => ({
  getUser: mockGetUser,
}))

mock.module('@lib/auth/admin', () => ({
  isUserAdmin: mockIsUserAdmin,
}))

const mockUpload = mock(() =>
  Promise.resolve({ data: { path: 'product-images/test.jpg' }, error: null })
)
const mockGetPublicUrl = mock(() => ({
  data: { publicUrl: 'https://storage.example.com/product-images/test.jpg' },
}))

mock.module('@lib/supabase/admin', () => ({
  createAdminClient: () => ({
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}))

// Import AFTER mocking
const { POST } = await import('@/app/api/admin/upload/route')

// ── Helpers ────────────────────────────────────────────────────────────────

function makeFileRequest(
  file?: File | null,
  fieldName = 'file'
): Request {
  const formData = new FormData()
  if (file) {
    formData.append(fieldName, file)
  }
  return new Request('http://localhost:3000/api/admin/upload', {
    method: 'POST',
    body: formData,
  })
}

const adminUser = { id: 'admin-user-1', email: 'admin@test.com' }

// ── Tests ──────────────────────────────────────────────────────────────────

describe('POST /api/admin/upload', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockIsUserAdmin.mockReset()
    mockUpload.mockReset()
    mockUpload.mockResolvedValue({
      data: { path: 'product-images/test.jpg' },
      error: null,
    })
  })

  test('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue(null)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const res = await POST(makeFileRequest(file))
    expect(res.status).toBe(401)
  })

  test('returns 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({ id: 'user-1' })
    mockIsUserAdmin.mockResolvedValue(false)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const res = await POST(makeFileRequest(file))
    expect(res.status).toBe(403)
  })

  test('returns 400 when no file provided', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    const res = await POST(makeFileRequest(null))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('No file provided')
  })

  test('returns 400 for invalid MIME type', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    const file = new File(['test'], 'test.pdf', {
      type: 'application/pdf',
    })
    const res = await POST(makeFileRequest(file))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Invalid file type')
  })

  test('returns 400 for file exceeding 5MB', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    // Create a file larger than 5MB
    const largeContent = new Uint8Array(5 * 1024 * 1024 + 1)
    const file = new File([largeContent], 'large.jpg', {
      type: 'image/jpeg',
    })
    const res = await POST(makeFileRequest(file))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('File too large')
  })

  test('accepts valid image upload', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    // PNG magic bytes (min 12 bytes for magic byte detection)
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ])
    const file = new File([pngBytes], 'photo.png', {
      type: 'image/png',
    })
    const res = await POST(makeFileRequest(file))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.url).toBeDefined()
  })

  test('accepts webp images', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    // WebP magic bytes: RIFF....WEBP
    const webpBytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
    ])
    const file = new File([webpBytes], 'photo.webp', { type: 'image/webp' })
    const res = await POST(makeFileRequest(file))
    expect(res.status).toBe(201)
  })

  test('accepts gif images', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    // GIF magic bytes
    const gifBytes = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0,
    ])
    const file = new File([gifBytes], 'anim.gif', { type: 'image/gif' })
    const res = await POST(makeFileRequest(file))
    expect(res.status).toBe(201)
  })

  test('returns 400 when magic bytes do not match MIME type', async () => {
    mockGetUser.mockResolvedValue(adminUser)
    mockIsUserAdmin.mockResolvedValue(true)
    // PNG magic bytes but claiming JPEG MIME type
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ])
    const file = new File([pngBytes], 'fake.jpg', { type: 'image/jpeg' })
    const res = await POST(makeFileRequest(file))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('File content does not match declared type')
  })
})
