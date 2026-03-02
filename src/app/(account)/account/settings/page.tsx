import { ProfileForm } from '@components/account/profileForm'
import { getProfile, requireAuth } from '@helpers/auth'

/**
 * @todo Add theme/appearance settings section.
 * Allow users to choose between light, dark, and system (default) themes
 * from their profile settings instead of the header toggle.
 * Ref: next-themes `useTheme()` — persist preference to `profiles.preferences` JSONB column.
 */
export default async function SettingsPage() {
  await requireAuth()
  const profile = await getProfile()

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold text-pedie-text'>Profile Settings</h1>

      <div className='rounded-lg border border-pedie-border bg-pedie-card p-6'>
        <ProfileForm
          initialData={{
            fullName: profile?.full_name || '',
            phone: profile?.phone || '',
            address: (profile?.address as {
              street?: string
              city?: string
              county?: string
              postal_code?: string
              country?: string
            }) || {
              street: '',
              city: '',
              county: '',
              postal_code: '',
              country: 'Kenya',
            },
          }}
        />
      </div>
    </div>
  )
}
