import { describe, expect, test } from 'bun:test'
import { Pagination } from '@components/catalog/pagination'
import React from 'react'
import { mockNextNavigation, render, screen } from '../../utils'

mockNextNavigation({ pathname: '/collections/smartphones' })

describe('Pagination', () => {
  test('renders page numbers', () => {
    render(
      <Pagination currentPage={2} totalPages={5} categorySlug='smartphones' />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  test('does not render when totalPages <= 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} categorySlug='smartphones' />
    )

    expect(container.innerHTML).toBe('')
  })

  test('disables prev button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} categorySlug='smartphones' />
    )

    const prevButton = screen.getByText('Prev').closest('button')
    expect(prevButton).toBeDisabled()
  })
})
