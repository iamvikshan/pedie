import { describe, expect, test, mock } from 'bun:test'
import { ThemeToggle } from '@components/ui/themeToggle'
import React from 'react'
import { render, screen } from '../../utils'

const mockSetTheme = mock()
mock.module('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: mockSetTheme }),
}))

describe('ThemeToggle', () => {
  test('renders theme toggle button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
