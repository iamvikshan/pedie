import { describe, expect, test } from 'bun:test'
import {
  fadeInUp,
  slideIn,
  springTransition,
  staggerContainer,
  staggerItem,
} from '@lib/motion'

describe('motion library', () => {
  test('fadeInUp has hidden and visible keys with correct shape', () => {
    expect(fadeInUp.hidden).toEqual({ opacity: 0, y: 20 })
    expect(fadeInUp.visible).toEqual({ opacity: 1, y: 0 })
  })

  test('staggerContainer defines staggerChildren in visible transition', () => {
    expect(staggerContainer.hidden).toEqual({})
    const visible = staggerContainer.visible as Record<string, unknown>
    expect(visible).toHaveProperty('transition')
    const transition = visible.transition as Record<string, unknown>
    expect(transition.staggerChildren).toBe(0.1)
  })

  test('staggerItem has hidden and visible keys matching fadeInUp', () => {
    expect(staggerItem.hidden).toEqual({ opacity: 0, y: 20 })
    expect(staggerItem.visible).toEqual({ opacity: 1, y: 0 })
  })

  test('slideIn has hidden and visible keys with x offset', () => {
    expect(slideIn.hidden).toEqual({ opacity: 0, x: -20 })
    expect(slideIn.visible).toEqual({ opacity: 1, x: 0 })
  })

  test('springTransition has type, damping, and stiffness', () => {
    expect(springTransition).toHaveProperty('type', 'spring')
    expect(springTransition).toHaveProperty('damping', 25)
    expect(springTransition).toHaveProperty('stiffness', 300)
  })
})
