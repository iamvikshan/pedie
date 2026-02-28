export const BADGE_TITLES = [
  '3-Month Warranty',
  'Free Delivery',
  'Quality Tested',
  '7-Day Returns',
]

export function TrustBadges() {
  const badges = [
    {
      title: BADGE_TITLES[0],
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-pedie-green'
          aria-hidden='true'
        >
          <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10' />
        </svg>
      ),
    },
    {
      title: BADGE_TITLES[1],
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-pedie-green'
          aria-hidden='true'
        >
          <path d='M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2' />
          <path d='M15 18H9' />
          <path d='M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14' />
          <circle cx='17' cy='18' r='2' />
          <circle cx='7' cy='18' r='2' />
        </svg>
      ),
    },
    {
      title: BADGE_TITLES[2],
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-pedie-green'
          aria-hidden='true'
        >
          <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14' />
          <polyline points='22 4 12 14.01 9 11.01' />
        </svg>
      ),
    },
    {
      title: BADGE_TITLES[3],
      icon: (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-pedie-green'
          aria-hidden='true'
        >
          <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
          <path d='M3 3v5h5' />
        </svg>
      ),
    },
  ]

  return (
    <section className='py-8 border-b border-pedie-border bg-pedie-dark'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {badges.map((badge, index) => (
            <div
              key={index}
              className='flex flex-col items-center text-center gap-3 p-4'
            >
              <div className='p-3 rounded-full bg-pedie-card border border-pedie-border'>
                {badge.icon}
              </div>
              <span className='font-medium text-sm md:text-base text-pedie-text'>
                {badge.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
