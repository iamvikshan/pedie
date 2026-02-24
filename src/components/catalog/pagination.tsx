'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  categorySlug: string
}

export function Pagination({
  currentPage,
  totalPages,
  categorySlug,
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const paramsStr = params.toString()
    router.push(
      paramsStr
        ? `/collections/${categorySlug}?${paramsStr}`
        : `/collections/${categorySlug}`
    )
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className='flex items-center justify-center gap-2 mt-12'>
      <Button
        variant='secondary'
        size='sm'
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className='px-3'
      >
        <svg
          className='w-4 h-4 mr-1'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 19l-7-7 7-7'
          />
        </svg>
        Prev
      </Button>

      <div className='flex items-center gap-1'>
        {getPageNumbers().map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className='px-3 py-2 text-pedie-text-muted'>...</span>
            ) : (
              <Button
                variant={currentPage === page ? 'primary' : 'ghost'}
                size='sm'
                onClick={() => handlePageChange(page as number)}
                className={`w-9 h-9 p-0 ${currentPage === page ? 'bg-pedie-accent hover:bg-pedie-accent/90' : ''}`}
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant='secondary'
        size='sm'
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className='px-3'
      >
        Next
        <svg
          className='w-4 h-4 ml-1'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 5l7 7-7 7'
          />
        </svg>
      </Button>
    </div>
  )
}
