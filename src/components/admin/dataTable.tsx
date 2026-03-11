'use client'

import { DataTablePagination } from '@components/admin/dataTablePagination'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalPages?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  perPage?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  onPerPageChange,
  perPage = 10,
}: DataTableProps<TData, TValue>) {
  'use no memo'
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  })

  return (
    <div>
      <div className='rounded-lg border border-pedie-border'>
        <table className='w-full text-left text-sm'>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr
                key={headerGroup.id}
                className='border-b border-pedie-border bg-pedie-card'
              >
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className='px-4 py-3 font-medium text-pedie-text-muted'
                    scope='col'
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    style={{
                      cursor: header.column.getCanSort()
                        ? 'pointer'
                        : 'default',
                    }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type='button'
                        className='inline-flex items-center gap-1 font-medium'
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === 'asc' && ' ↑'}
                        {header.column.getIsSorted() === 'desc' && ' ↓'}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-4 py-8 text-center text-pedie-text-muted'
                >
                  No results found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className='border-b border-pedie-border last:border-0 hover:bg-pedie-card-hover'
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className='px-4 py-3 text-pedie-text'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={onPageChange ?? (() => {})}
        onPerPageChange={onPerPageChange ?? (() => {})}
      />
    </div>
  )
}
