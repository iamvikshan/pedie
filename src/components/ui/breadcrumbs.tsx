import Link from 'next/link'
import { TbChevronRight } from 'react-icons/tb'

export type BreadcrumbSegment = {
  name: string
  href?: string
}

export function Breadcrumbs({ segments }: { segments: BreadcrumbSegment[] }) {
  return (
    <nav aria-label='Breadcrumb' className='my-4'>
      <ol className='flex items-center space-x-2 text-sm text-pedie-text-muted'>
        <li>
          <Link href='/' className='hover:text-pedie-green transition-colors'>
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          return (
            <li key={segment.name} className='flex items-center'>
              <TbChevronRight className='h-4 w-4 mx-1' />
              {isLast || !segment.href ? (
                <span className='text-pedie-text font-medium'>
                  {segment.name}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  className='hover:text-pedie-green transition-colors'
                >
                  {segment.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
