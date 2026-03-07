'use client'

import { Alert } from '@components/ui/alert'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { createClient } from '@lib/supabase/client'
import { useState } from 'react'

interface ProfileFormProps {
  initialData: {
    fullName: string
    phone: string
    address: {
      street?: string
      city?: string
      county?: string
      postal_code?: string
      country?: string
    }
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const address = initialData.address || {}
  const [fullName, setFullName] = useState(initialData.fullName)
  const [phone, setPhone] = useState(initialData.phone)
  const [street, setStreet] = useState(address.street || '')
  const [city, setCity] = useState(address.city || '')
  const [county, setCounty] = useState(address.county || '')
  const [postalCode, setPostalCode] = useState(address.postal_code || '')
  const [country, setCountry] = useState(address.country || 'Kenya')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage({ type: 'error', text: 'Not authenticated' })
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          address: {
            street,
            city,
            county,
            postal_code: postalCode || undefined,
            country,
          },
        })
        .eq('id', user.id)

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div>
        <label
          htmlFor='fullName'
          className='mb-1 block text-sm text-pedie-text-muted'
        >
          Full Name
        </label>
        <Input
          id='fullName'
          type='text'
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className='bg-pedie-surface'
          placeholder='Your full name'
        />
      </div>

      <div>
        <label
          htmlFor='phone'
          className='mb-1 block text-sm text-pedie-text-muted'
        >
          Phone
        </label>
        <Input
          id='phone'
          type='tel'
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className='bg-pedie-surface'
          placeholder='+254...'
        />
      </div>

      <hr className='border-pedie-border' />
      <h3 className='text-sm font-medium text-pedie-text'>Address</h3>

      <div>
        <label
          htmlFor='street'
          className='mb-1 block text-sm text-pedie-text-muted'
        >
          Street
        </label>
        <Input
          id='street'
          type='text'
          value={street}
          onChange={e => setStreet(e.target.value)}
          className='bg-pedie-surface'
          placeholder='Street address'
        />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='city'
            className='mb-1 block text-sm text-pedie-text-muted'
          >
            City
          </label>
          <Input
            id='city'
            type='text'
            value={city}
            onChange={e => setCity(e.target.value)}
            className='bg-pedie-surface'
            placeholder='City'
          />
        </div>
        <div>
          <label
            htmlFor='county'
            className='mb-1 block text-sm text-pedie-text-muted'
          >
            County
          </label>
          <Input
            id='county'
            type='text'
            value={county}
            onChange={e => setCounty(e.target.value)}
            className='bg-pedie-surface'
            placeholder='County'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='postalCode'
            className='mb-1 block text-sm text-pedie-text-muted'
          >
            Postal Code
          </label>
          <Input
            id='postalCode'
            type='text'
            value={postalCode}
            onChange={e => setPostalCode(e.target.value)}
            className='bg-pedie-surface'
            placeholder='Postal code (optional)'
          />
        </div>
        <div>
          <label
            htmlFor='country'
            className='mb-1 block text-sm text-pedie-text-muted'
          >
            Country
          </label>
          <Input
            id='country'
            type='text'
            value={country}
            onChange={e => setCountry(e.target.value)}
            className='bg-pedie-surface'
            placeholder='Country'
          />
        </div>
      </div>

      <Button type='submit' variant='primary' disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
