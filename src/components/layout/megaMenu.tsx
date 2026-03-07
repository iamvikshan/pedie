'use client'

import { CategoryWithChildren } from '@app-types/product'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'

interface MegaMenuProps {
  categories: CategoryWithChildren[]
  activeCategory: string | null
  onClose: () => void
}

export function MegaMenu({
  categories,
  activeCategory,
  onClose,
}: MegaMenuProps) {
  const activeData = activeCategory
    ? categories.find(c => c.slug === activeCategory)
    : null
  const showMenu =
    !!activeData && !!activeData.children && activeData.children.length > 0

  return (
    <AnimatePresence>
      {showMenu && activeData && (
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className='absolute top-full left-0 z-40 w-full glass border-x-0 border-t-0 p-6 shadow-lg'
          onMouseLeave={onClose}
        >
          <div className='pedie-container grid grid-cols-2 md:grid-cols-4 gap-6'>
            {activeData.children!.map(child => (
              <Link
                key={child.id}
                href={`/collections/${child.slug}`}
                className='group flex flex-col p-4 rounded-xl hover:bg-pedie-surface transition-colors'
                onClick={onClose}
              >
                <span className='font-semibold text-pedie-text group-hover:text-pedie-green transition-colors'>
                  {child.name}
                </span>
                {child.description && (
                  <span className='text-sm text-pedie-text-muted mt-1 max-w-xs truncate'>
                    {child.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
