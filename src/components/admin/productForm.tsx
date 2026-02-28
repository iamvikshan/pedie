'use client'

import { useState } from 'react'
import { productSlug } from '@utils/slug'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductData {
  id?: string
  brand?: string
  model?: string
  slug?: string
  category_id?: string | null
  description?: string | null
  specs?: Record<string, unknown> | null
  key_features?: string[] | null
  original_price_kes?: number | null
  images?: string[] | null
}

interface ProductFormProps {
  initialData?: ProductData
  categories: Category[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    brand: initialData?.brand ?? '',
    model: initialData?.model ?? '',
    slug: initialData?.slug ?? '',
    category_id: initialData?.category_id ?? '',
    description: initialData?.description ?? '',
    original_price_kes: initialData?.original_price_kes ?? '',
  })
  const [keyFeatures, setKeyFeatures] = useState<string[]>(
    initialData?.key_features ?? ['']
  )

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-generate slug when brand or model changes
      if ((name === 'brand' || name === 'model') && !initialData?.id) {
        const brand = name === 'brand' ? value : prev.brand
        const model = name === 'model' ? value : prev.model
        if (brand && model) {
          updated.slug = productSlug(brand, model)
        }
      }
      return updated
    })
  }

  const handleFeatureChange = (index: number, value: string) => {
    setKeyFeatures(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const addFeature = () => setKeyFeatures(prev => [...prev, ''])
  const removeFeature = (index: number) =>
    setKeyFeatures(prev => prev.filter((_, i) => i !== index))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data: Record<string, unknown> = {
        ...formData,
        original_price_kes: formData.original_price_kes
          ? Number(formData.original_price_kes)
          : null,
        category_id: formData.category_id || null,
        key_features: keyFeatures.filter(f => f.trim() !== ''),
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
      {error && (
        <div className='rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700'>
          {error}
        </div>
      )}
      {/* Brand */}
      <div>
        <label
          htmlFor='brand'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Brand *
        </label>
        <input
          id='brand'
          name='brand'
          type='text'
          value={formData.brand}
          onChange={handleChange}
          required
          className='w-full rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
        />
      </div>

      {/* Model */}
      <div>
        <label
          htmlFor='model'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Model *
        </label>
        <input
          id='model'
          name='model'
          type='text'
          value={formData.model}
          onChange={handleChange}
          required
          className='w-full rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
        />
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor='slug'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Slug *
        </label>
        <input
          id='slug'
          name='slug'
          type='text'
          value={formData.slug}
          onChange={handleChange}
          required
          className='w-full rounded border border-pedie-border bg-pedie-card px-3 py-2 font-mono text-sm text-pedie-text'
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor='category_id'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Category
        </label>
        <select
          id='category_id'
          name='category_id'
          value={formData.category_id}
          onChange={handleChange}
          className='w-full rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
        >
          <option value=''>No category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor='description'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Description
        </label>
        <textarea
          id='description'
          name='description'
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className='w-full rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
        />
      </div>

      {/* Key Features */}
      <div>
        <label className='mb-1 block text-sm font-medium text-pedie-text'>
          Key Features
        </label>
        {keyFeatures.map((feature, index) => (
          <div key={index} className='mb-2 flex gap-2'>
            <input
              type='text'
              value={feature}
              onChange={e => handleFeatureChange(index, e.target.value)}
              placeholder='e.g. A16 Bionic chip'
              className='flex-1 rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
            />
            {keyFeatures.length > 1 && (
              <button
                type='button'
                onClick={() => removeFeature(index)}
                className='text-sm text-red-600 hover:underline'
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type='button'
          onClick={addFeature}
          className='text-sm text-pedie-primary hover:underline'
        >
          + Add Feature
        </button>
      </div>

      {/* Original Price */}
      <div>
        <label
          htmlFor='original_price_kes'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Original Price (KES)
        </label>
        <input
          id='original_price_kes'
          name='original_price_kes'
          type='number'
          value={formData.original_price_kes}
          onChange={handleChange}
          className='w-full rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
        />
      </div>

      {/* Submit */}
      <button
        type='submit'
        disabled={loading}
        className='rounded bg-pedie-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50'
      >
        {loading
          ? 'Saving...'
          : initialData?.id
            ? 'Update Product'
            : 'Create Product'}
      </button>
    </form>
  )
}
