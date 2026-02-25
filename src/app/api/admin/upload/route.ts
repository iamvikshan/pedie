import { NextResponse } from 'next/server'
import { getUser } from '@lib/auth/helpers'
import { isUserAdmin } from '@lib/auth/admin'
import { createAdminClient } from '@lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isUserAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Sanitize filename: strip path traversal, keep only alphanumeric + hyphens + dots
    const rawName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '')
    const ext = rawName.split('.').pop() ?? 'jpg'
    const sanitizedExt = ext.replace(/[^a-zA-Z0-9]/g, '') || 'jpg'
    const fileName = `${crypto.randomUUID()}.${sanitizedExt}`
    const path = `product-images/${fileName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(path)

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
