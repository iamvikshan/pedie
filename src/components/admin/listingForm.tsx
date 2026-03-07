'use client'

import { Alert } from '@components/ui/alert'
import { Input } from '@components/ui/input'
import { Select } from '@components/ui/select'
import { generateListingId } from '@helpers'
import { useState } from 'react'

interface Product {
  id: string
  brand: string
  model: string
}

interface ListingData {
  id?: string
  listing_id?: string
  product_id?: string
  storage?: string | null
  color?: string | null
  carrier?: string | null
  condition?: string
  battery_health?: number | null
  price_kes?: number
  original_price_usd?: number | null
  landed_cost_kes?: number | null
  status?: string
  listing_type?: string
  is_featured?: boolean
  notes?: string | null
  images?: string[] | null
}

interface ListingFormProps {
  initialData?: ListingData
  products: Product[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

const CONDITIONS = ['acceptable', 'good', 'excellent', 'premium']
const STATUSES = ['available', 'reserved', 'sold', 'onsale']
const LISTING_TYPES = ['standard', 'preorder', 'affiliate', 'referral']

export function ListingForm({
  initialData,
  products,
  onSubmit,
}: ListingFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    product_id: initialData?.product_id ?? '',
    listing_id: initialData?.listing_id ?? generateListingId(),
    storage: initialData?.storage ?? '',
    color: initialData?.color ?? '',
    carrier: initialData?.carrier ?? '',
    condition: initialData?.condition ?? 'good',
    battery_health: initialData?.battery_health ?? '',
    price_kes: initialData?.price_kes ?? '',
    original_price_usd: initialData?.original_price_usd ?? '',
    landed_cost_kes: initialData?.landed_cost_kes ?? '',
    status: initialData?.status ?? 'available',
    listing_type: initialData?.listing_type ?? 'standard',
    is_featured: initialData?.is_featured ?? false,
    notes: initialData?.notes ?? '',
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const priceKes = Number(formData.price_kes)
      if (isNaN(priceKes) || priceKes < 0) {
        throw new Error('Price must be a valid non-negative number')
      }
      const data: Record<string, unknown> = {
        ...formData,
        price_kes: priceKes,
        battery_health:
          formData.battery_health !== ''
            ? Number(formData.battery_health)
            : null,
        original_price_usd:
          formData.original_price_usd !== ''
            ? Number(formData.original_price_usd)
            : null,
        landed_cost_kes:
          formData.landed_cost_kes !== ''
            ? Number(formData.landed_cost_kes)
            : null,
      }
      await onSubmit(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error && <Alert variant='error'>{error}</Alert>}
      {/* Product Select */}
      <div>
        <label
          htmlFor='product_id'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Product *
        </label>
        <Select
          id='product_id'
          name='product_id'
          value={formData.product_id}
          onChange={handleChange}
          required
        >
          <option value=''>Select a product</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.brand} {p.model}
            </option>
          ))}
        </Select>
      </div>

      {/* Listing ID */}
      <div>
        <label
          htmlFor='listing_id'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Listing ID *
        </label>
        <Input
          id='listing_id'
          name='listing_id'
          type='text'
          value={formData.listing_id}
          onChange={handleChange}
          required
        />
      </div>

      {/* Storage & Color row */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='storage'
            className='mb-1 block text-sm font-medium text-pedie-text'
          >
            Storage
          </label>
          <Input
            id='storage'
            name='storage'
            type='text'
            value={formData.storage}
            onChange={handleChange}
            placeholder='e.g. 256GB'
          />
        </div>
        <div>
          <label
            htmlFor='color'
            className='mb-1 block text-sm font-medium text-pedie-text'
          >
            Color
          </label>
          <Input
            id='color'
            name='color'
            type='text'
            value={formData.color}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Carrier */}
      <div>
        <label
          htmlFor='carrier'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Carrier
        </label>
        <Input
          id='carrier'
          name='carrier'
          type='text'
          value={formData.carrier}
          onChange={handleChange}
          placeholder='e.g. Unlocked'
        />
      </div>

      {/* Condition */}
      <div>
        <label
          htmlFor='condition'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Condition *
        </label>
        <Select
          id='condition'
          name='condition'
          value={formData.condition}
          onChange={handleChange}
          required
          className='capitalize'
        >
          {CONDITIONS.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {/* Battery Health */}
      <div>
        <label
          htmlFor='battery_health'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Battery Health (%)
        </label>
        <Input
          id='battery_health'
          name='battery_health'
          type='number'
          min={0}
          max={100}
          value={formData.battery_health}
          onChange={handleChange}
        />
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor='price_kes'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Price (KES) *
        </label>
        <Input
          id='price_kes'
          name='price_kes'
          type='number'
          min={0}
          value={formData.price_kes}
          onChange={handleChange}
          required
        />
      </div>

      {/* Original Price USD & Landed Cost */}
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='original_price_usd'
            className='mb-1 block text-sm font-medium text-pedie-text'
          >
            Original Price (USD)
          </label>
          <Input
            id='original_price_usd'
            name='original_price_usd'
            type='number'
            value={formData.original_price_usd}
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor='landed_cost_kes'
            className='mb-1 block text-sm font-medium text-pedie-text'
          >
            Landed Cost (KES)
          </label>
          <Input
            id='landed_cost_kes'
            name='landed_cost_kes'
            type='number'
            value={formData.landed_cost_kes}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor='status'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Status
        </label>
        <Select
          id='status'
          name='status'
          value={formData.status}
          onChange={handleChange}
          className='capitalize'
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {/* Listing Type */}
      <div>
        <label
          htmlFor='listing_type'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Listing Type
        </label>
        <Select
          id='listing_type'
          name='listing_type'
          value={formData.listing_type}
          onChange={handleChange}
          className='capitalize'
        >
          {LISTING_TYPES.map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {/* Checkboxes */}
      <div className='flex gap-6'>
        <label className='flex items-center gap-2 text-sm text-pedie-text'>
          <input
            type='checkbox'
            name='is_featured'
            checked={formData.is_featured}
            onChange={handleChange}
          />
          Featured
        </label>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor='notes'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Notes
        </label>
        <textarea
          id='notes'
          name='notes'
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className='w-full rounded-lg border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
        />
      </div>

      {/* Submit */}
      <button
        type='submit'
        disabled={loading}
        className='rounded-lg bg-pedie-green px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50'
      >
        {loading
          ? 'Saving...'
          : initialData?.id
            ? 'Update Listing'
            : 'Create Listing'}
      </button>
    </form>
  )
}
