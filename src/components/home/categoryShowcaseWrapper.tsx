'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { TbArrowRight } from 'react-icons/tb'

interface CategoryShowcaseWrapperProps {
  children: ReactNode
}

export function CategoryShowcaseWrapper({
  children,
}: CategoryShowcaseWrapperProps) {
  return (
    <motion.section
      className='py-16'
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.section>
  )
}

/** Client arrow icon for "View All" links in server components */
export function ViewAllArrow() {
  return <TbArrowRight className='w-4 h-4' aria-hidden='true' />
}
