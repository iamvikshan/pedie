interface ProductDescriptionProps {
  description: string | null
  keyFeatures: string[] | null
}

export function ProductDescription({
  description,
  keyFeatures,
}: ProductDescriptionProps) {
  const hasDescription = description && description.trim().length > 0
  const hasFeatures = keyFeatures && keyFeatures.length > 0

  if (!hasDescription && !hasFeatures) {
    return null
  }

  return (
    <div>
      <h2 className='text-xl font-bold text-pedie-text mb-4'>
        About This Product
      </h2>

      {hasDescription && (
        <p className='text-pedie-text-muted leading-relaxed mb-4'>
          {description}
        </p>
      )}

      {hasFeatures && (
        <ul className='space-y-2'>
          {keyFeatures.map((feature, index) => (
            <li key={index} className='flex items-start gap-2 text-pedie-text'>
              <svg
                className='h-5 w-5 flex-shrink-0 text-pedie-green mt-0.5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
