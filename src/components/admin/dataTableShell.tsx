'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { DataTable } from '@components/admin/dataTable'
import { DataTableToolbar } from '@components/admin/dataTableToolbar'
import type { ColumnDef } from '@tanstack/react-table'

interface DataTableShellProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  totalPages: number
  currentPage: number
  perPage?: number
  searchKey?: string
  searchPlaceholder?: string
  searchValue?: string
}

export function DataTableShell<TData>({
  columns,
  data,
  totalPages,
  currentPage,
  perPage = 10,
  searchKey = 'search',
  searchPlaceholder = 'Search...',
  searchValue = '',
}: DataTableShellProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      return params.toString()
    },
    [searchParams]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      const qs = createQueryString({ page: String(page) })
      router.push(`${pathname}?${qs}`)
    },
    [router, pathname, createQueryString]
  )

  const handlePerPageChange = useCallback(
    (newPerPage: number) => {
      const qs = createQueryString({
        limit: String(newPerPage),
        page: '1',
      })
      router.push(`${pathname}?${qs}`)
    },
    [router, pathname, createQueryString]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      const qs = createQueryString({
        [searchKey]: value || null,
        page: '1',
      })
      router.replace(`${pathname}?${qs}`)
    },
    [router, pathname, createQueryString, searchKey]
  )

  return (
    <div>
      <DataTableToolbar
        searchValue={searchValue}
        searchPlaceholder={searchPlaceholder}
        onSearchChange={handleSearchChange}
      />
      <DataTable
        columns={columns}
        data={data}
        totalPages={totalPages}
        currentPage={currentPage}
        perPage={perPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  )
}
