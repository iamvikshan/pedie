import { createClient } from '@lib/supabase/server'

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  sort_order: number
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient()
  const { data, error } = await (
    supabase as unknown as {
      from: (table: string) => ReturnType<typeof supabase.from>
    }
  )
    .from('brands')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching brands:', error)
    return []
  }

  return (data ?? []) as unknown as Brand[]
}
