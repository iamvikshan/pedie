import { NextResponse } from 'next/server'
import { createClient } from '@lib/supabase/server'
import { sendWelcomeEmail } from '@lib/email/send'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/'
  // Validate redirect to prevent open-redirect attacks
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure profile exists (upsert on first social login)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                null,
              avatar_url: user.user_metadata?.avatar_url || null,
              phone: user.user_metadata?.phone || null,
              role: 'customer',
            })

          if (insertError) {
            console.error(
              `Failed to create profile for user ${user.id}:`,
              insertError.message
            )
            return NextResponse.redirect(
              `${origin}/auth/signin?error=profile_creation_failed`
            )
          }

          // Fire-and-forget welcome email
          const userName =
            user.user_metadata?.full_name || user.user_metadata?.name || 'there'
          if (user.email) {
            sendWelcomeEmail(user.email, userName).catch(console.error)
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Auth error — redirect to signin with error
  return NextResponse.redirect(
    `${origin}/auth/signin?error=auth_callback_failed`
  )
}
