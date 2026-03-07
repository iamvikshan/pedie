// Shared Framer Motion animation variants for the Pedie design system

import type { Variants, Transition } from 'framer-motion'

// Standard spring transition used across overlays/panels
export const springTransition: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
}

// Fade in from below - used for whileInView scroll reveals
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// Stagger container for lists of animated children
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Individual stagger item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// Slide in from side
export const slideIn: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}
