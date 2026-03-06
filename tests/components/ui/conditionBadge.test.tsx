import { describe, expect, test } from 'bun:test'
import {
  ConditionBadge,
  CONDITION_ICONS,
  CONDITION_BADGE_VARIANTS,
} from '@components/ui/conditionBadge'
import React from 'react'
import { render, screen } from '../../utils'

describe('ConditionBadge Component', () => {
  test('exports CONDITION_ICONS mapping', () => {
    expect(CONDITION_ICONS).toBeDefined()
    expect(CONDITION_ICONS.premium).toBe('TbCrown')
    expect(CONDITION_ICONS.excellent).toBe('TbDiamond')
    expect(CONDITION_ICONS.good).toBe('TbThumbUp')
    expect(CONDITION_ICONS.acceptable).toBe('TbCircleCheck')
  })

  test('exports CONDITION_BADGE_VARIANTS', () => {
    expect(CONDITION_BADGE_VARIANTS).toBeDefined()
    expect(CONDITION_BADGE_VARIANTS).toContain('default')
    expect(CONDITION_BADGE_VARIANTS).toContain('circle')
  })

  test('renders tooltip via title attribute and sr-only label', () => {
    render(<ConditionBadge condition='excellent' />)
    const badge = screen.getByTitle('Excellent')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('text-pedie-badge-excellent')

    // Check sr-only label
    const srLabel = screen.getByText('Excellent')
    expect(srLabel).toBeInTheDocument()
    expect(srLabel.className).toContain('sr-only')
  })

  test('circle variant uses glassmorphed background', () => {
    render(<ConditionBadge condition='good' variant='circle' />)
    const badge = screen.getByTitle('Good')
    expect(badge.className).toContain('backdrop-blur')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('p-1.5')
  })
})
