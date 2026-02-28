'use client'

export function NewsletterExportButton() {
  async function handleExport() {
    try {
      const res = await fetch('/api/admin/newsletter?export=csv')
      if (!res.ok) throw new Error('Export failed')
      const csv = await res.text()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'newsletter-subscribers.csv'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export subscribers')
    }
  }

  return (
    <button
      type='button'
      onClick={handleExport}
      className='rounded bg-pedie-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90'
    >
      Export CSV
    </button>
  )
}
