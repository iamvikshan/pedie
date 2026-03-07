import type { Review, ReviewStats } from '@data/reviews'

interface CustomerReviewsProps {
  reviews: Review[]
  stats: ReviewStats
  totalReviews: number
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${filled ? 'text-pedie-warning' : 'text-pedie-text-muted'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke='currentColor'
      viewBox='0 0 24 24'
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
      />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map(star => (
        <StarIcon key={star} filled={star <= rating} />
      ))}
    </div>
  )
}

function ReviewHistogram({ stats }: { stats: ReviewStats }) {
  const maxCount = Math.max(...Object.values(stats.histogram), 1)

  return (
    <div className='space-y-2'>
      {([5, 4, 3, 2, 1] as const).map(star => {
        const count = stats.histogram[star]
        const width = maxCount > 0 ? (count / maxCount) * 100 : 0

        return (
          <div key={star} className='flex items-center gap-2'>
            <span className='w-8 text-sm text-pedie-text-muted text-right'>
              {star} ★
            </span>
            <div className='flex-1 h-3 rounded-full bg-pedie-sunken overflow-hidden'>
              <div
                className='h-full rounded-full bg-pedie-warning'
                style={{ width: `${width}%` }}
              />
            </div>
            <span className='w-8 text-sm text-pedie-text-muted'>{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div className='border-b border-pedie-border py-6 last:border-b-0'>
      <div className='flex items-center justify-between mb-2'>
        <StarRating rating={review.rating} />
        <span className='text-sm text-pedie-text-muted'>{date}</span>
      </div>
      {review.title && (
        <h4 className='font-bold text-pedie-text mb-1'>{review.title}</h4>
      )}
      {review.body && (
        <p className='text-pedie-text-muted mb-2'>{review.body}</p>
      )}
      {review.verified_purchase && (
        <span className='inline-flex items-center gap-1 text-xs text-pedie-green font-medium'>
          ✓ Verified Purchase
        </span>
      )}
    </div>
  )
}

export function CustomerReviews({
  reviews,
  stats,
  totalReviews,
}: CustomerReviewsProps) {
  if (totalReviews === 0 || stats.totalReviews === 0) {
    return (
      <section className='pb-12'>
        <h2 className='text-2xl font-bold text-pedie-text mb-6'>
          Customer Reviews
        </h2>
        <p className='text-pedie-text-muted'>
          No reviews yet. Be the first to leave a review!
        </p>
      </section>
    )
  }

  return (
    <section className='pb-12'>
      <h2 className='text-2xl font-bold text-pedie-text mb-6'>
        Customer Reviews
      </h2>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8'>
        {/* Average rating */}
        <div className='flex flex-col items-center justify-center'>
          <span className='text-5xl font-bold text-pedie-text'>
            {stats.averageRating.toFixed(1)}
          </span>
          <StarRating rating={Math.round(stats.averageRating)} />
          <span className='text-sm text-pedie-text-muted mt-1'>
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Histogram */}
        <div className='lg:col-span-2'>
          <ReviewHistogram stats={stats} />
        </div>
      </div>

      {/* Reviews list */}
      <div>
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
