import { describe, expect, test } from 'bun:test'
import { CustomerReviews } from '@components/listing/customerReviews'
import { renderToString } from 'react-dom/server'

const mockStats = {
  averageRating: 4.2,
  totalReviews: 5,
  histogram: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 } as Record<
    1 | 2 | 3 | 4 | 5,
    number
  >,
}

const mockReviews = [
  {
    id: 'r1',
    product_id: 'p1',
    user_id: 'u1',
    rating: 5,
    title: 'Great phone!',
    body: 'Love it',
    verified_purchase: true,
    created_at: '2024-06-01',
  },
  {
    id: 'r2',
    product_id: 'p1',
    user_id: 'u2',
    rating: 4,
    title: 'Good value',
    body: 'Works well',
    verified_purchase: false,
    created_at: '2024-05-15',
  },
]

describe('CustomerReviews', () => {
  test('renders review stats with average rating and total', () => {
    const html = renderToString(
      <CustomerReviews
        reviews={mockReviews}
        stats={mockStats}
        totalReviews={5}
      />
    )

    expect(html).toContain('Customer Reviews')
    expect(html).toContain('4.2')
    expect(html).toContain('reviews')
    // Verify the total count is present
    expect(html).toContain('>5')
  })

  test('renders individual reviews with title and body', () => {
    const html = renderToString(
      <CustomerReviews
        reviews={mockReviews}
        stats={mockStats}
        totalReviews={5}
      />
    )

    expect(html).toContain('Great phone!')
    expect(html).toContain('Love it')
    expect(html).toContain('Good value')
    expect(html).toContain('Works well')
    expect(html).toContain('Verified Purchase')
  })

  test('shows empty state when no reviews', () => {
    const emptyStats = {
      averageRating: 0,
      totalReviews: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<
        1 | 2 | 3 | 4 | 5,
        number
      >,
    }

    const html = renderToString(
      <CustomerReviews reviews={[]} stats={emptyStats} totalReviews={0} />
    )

    expect(html).toContain('Customer Reviews')
    expect(html).toContain('No reviews yet')
    expect(html).toContain('Be the first to leave a review!')
  })
})
