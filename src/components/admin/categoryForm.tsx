'use client'

import { slugify } from '@utils/slug'
import { useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryData {
  id?: string
  name?: string
  slug?: string
  parent_id?: string | null
  image_url?: string | null
  sort_order?: number | null
}

interface CategoryFormProps {
  initialData?: CategoryData
  categories: Category[]
  onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export function CategoryForm({
  initialData,
  categories,
  onSubmit,
}: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    parent_id: initialData?.parent_id ?? '',
    image_url: initialData?.image_url ?? '',
    sort_order: initialData?.sort_order ?? 0,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-generate slug when name changes (only for new categories)
      if (name === 'name' && !initialData?.id) {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data: Record<string, unknown> = {
        name: formData.name,
        slug: formData.slug,
        parent_id: formData.parent_id || null,
        image_url: formData.image_url || null,
        sort_order: Number(formData.sort_order),
      }
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  // Filter out self from parent options when editing
  const parentOptions = categories.filter(c => c.id !== initialData?.id)

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Name */}
      <div>
        <label
          htmlFor='name'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Name *
        </label>
        <input
          id='name'
          name='name'
          type='text'
          value={formData.name}
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

      {/* Parent Category */}
      <div>
        <label
          htmlFor='parent_id'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Parent Category
        </label>
        <select
          id='parent_id'
          name='parent_id'
          value={formData.parent_id}
          onChange={handleChange}
          className='w-full rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
        >
          <option value=''>None (top level)</option>
          {parentOptions.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image URL */}
      <div>
        <label
          htmlFor='image_url'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Image URL
        </label>
        <input
          id='image_url'
          name='image_url'
          type='text'
          value={formData.image_url}
          onChange={handleChange}
          placeholder='https://...'
          className='w-full rounded border border-pedie-border bg-pedie-card px-3 py-2 text-sm text-pedie-text'
        />
      </div>

      {/* Sort Order */}
      <div>
        <label
          htmlFor='sort_order'
          className='mb-1 block text-sm font-medium text-pedie-text'
        >
          Sort Order
        </label>
        <input
          id='sort_order'
          name='sort_order'
          type='number'
          value={formData.sort_order}
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
            ? 'Update Category'
            : 'Create Category'}
      </button>
    </form>
  )
}
