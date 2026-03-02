'use client'

import { Button } from '@components/ui/button'
import { useState } from 'react'

export interface ShippingData {
  fullName: string
  phone: string
  address: string
  city: string
  county: string
  postalCode: string
  notes: string
}

interface ShippingFormProps {
  onSubmit: (data: ShippingData) => void
  initialData?: Partial<ShippingData>
}

/** Validate Kenyan phone: +254XXXXXXXXX, 07XXXXXXXX, or 01XXXXXXXX */
export function validateKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '')
  return /^(\+?254|0)(7|1)\d{8}$/.test(cleaned)
}

export function ShippingForm({ onSubmit, initialData }: ShippingFormProps) {
  const [form, setForm] = useState<ShippingData>({
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    county: initialData?.county || '',
    postalCode: initialData?.postalCode || '',
    notes: initialData?.notes || '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShippingData, string>>
  >({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingData, string>> = {}
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validateKenyanPhone(form.phone)) {
      newErrors.phone = 'Enter a valid Kenyan phone number (+254... or 07...)'
    }
    if (!form.address.trim()) newErrors.address = 'Address is required'
    if (!form.city.trim()) newErrors.city = 'City is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      const trimmed: ShippingData = {
        ...form,
        fullName: form.fullName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        county: form.county.trim(),
        postalCode: form.postalCode.trim(),
        notes: form.notes.trim(),
      }
      onSubmit(trimmed)
    }
  }

  const updateField = (field: keyof ShippingData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <h2 className='text-lg font-semibold text-pedie-text'>
        Shipping Information
      </h2>

      <div>
        <label
          htmlFor='fullName'
          className='block text-sm font-medium text-pedie-text-muted mb-1'
        >
          Full Name *
        </label>
        <input
          id='fullName'
          type='text'
          value={form.fullName}
          onChange={e => updateField('fullName', e.target.value)}
          className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
        />
        {errors.fullName && (
          <p className='mt-1 text-sm text-red-500'>{errors.fullName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='phone'
          className='block text-sm font-medium text-pedie-text-muted mb-1'
        >
          Phone Number *
        </label>
        <input
          id='phone'
          type='tel'
          placeholder='+254 7XX XXX XXX'
          value={form.phone}
          onChange={e => updateField('phone', e.target.value)}
          className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
        />
        {errors.phone && (
          <p className='mt-1 text-sm text-red-500'>{errors.phone}</p>
        )}
      </div>

      <div>
        <label
          htmlFor='address'
          className='block text-sm font-medium text-pedie-text-muted mb-1'
        >
          Street Address *
        </label>
        <input
          id='address'
          type='text'
          value={form.address}
          onChange={e => updateField('address', e.target.value)}
          className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
        />
        {errors.address && (
          <p className='mt-1 text-sm text-red-500'>{errors.address}</p>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='city'
            className='block text-sm font-medium text-pedie-text-muted mb-1'
          >
            City *
          </label>
          <input
            id='city'
            type='text'
            value={form.city}
            onChange={e => updateField('city', e.target.value)}
            className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
          />
          {errors.city && (
            <p className='mt-1 text-sm text-red-500'>{errors.city}</p>
          )}
        </div>
        <div>
          <label
            htmlFor='county'
            className='block text-sm font-medium text-pedie-text-muted mb-1'
          >
            County
          </label>
          <input
            id='county'
            type='text'
            value={form.county}
            onChange={e => updateField('county', e.target.value)}
            className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
          />
        </div>
      </div>

      <div>
        <label
          htmlFor='postalCode'
          className='block text-sm font-medium text-pedie-text-muted mb-1'
        >
          Postal Code
        </label>
        <input
          id='postalCode'
          type='text'
          value={form.postalCode}
          onChange={e => updateField('postalCode', e.target.value)}
          className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
        />
      </div>

      <div>
        <label
          htmlFor='notes'
          className='block text-sm font-medium text-pedie-text-muted mb-1'
        >
          Delivery Notes
        </label>
        <textarea
          id='notes'
          rows={3}
          value={form.notes}
          onChange={e => updateField('notes', e.target.value)}
          className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green'
          placeholder='Any special delivery instructions...'
        />
      </div>

      <Button type='submit' variant='primary' className='w-full'>
        Continue to Payment
      </Button>
    </form>
  )
}
