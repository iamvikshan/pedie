import { describe, expect, test } from 'bun:test'
import React from 'react'
import { render, screen } from '../utils'
import { Input } from '@components/ui/input'
import { Select } from '@components/ui/select'
import { Badge } from '@components/ui/badge'
import { Alert } from '@components/ui/alert'
import { Spinner } from '@components/ui/spinner'
import { EmptyState } from '@components/ui/emptyState'
import { GoogleIcon } from '@components/ui/googleIcon'
import { StepIndicator } from '@components/ui/stepIndicator'
import {
  CheckboxFilterGroup,
  PriceRangeFilter,
} from '@components/ui/filterGroup'

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
describe('Input', () => {
  test('renders without crashing', () => {
    render(<Input data-testid='input' />)
    expect(screen.getByTestId('input')).toBeInTheDocument()
  })

  test('applies default md size classes', () => {
    render(<Input data-testid='input' />)
    const el = screen.getByTestId('input')
    expect(el.className).toContain('rounded-lg')
    expect(el.className).toContain('py-2')
  })

  test('applies sm size classes', () => {
    render(<Input size='sm' data-testid='input' />)
    const el = screen.getByTestId('input')
    expect(el.className).toContain('rounded-md')
    expect(el.className).toContain('py-1.5')
  })

  test('applies lg size classes', () => {
    render(<Input size='lg' data-testid='input' />)
    const el = screen.getByTestId('input')
    expect(el.className).toContain('text-base')
    expect(el.className).toContain('py-2.5')
  })

  test('passes through className prop', () => {
    render(<Input className='custom-class' data-testid='input' />)
    expect(screen.getByTestId('input').className).toContain('custom-class')
  })

  test('passes through HTML attributes', () => {
    render(
      <Input
        placeholder='Enter email'
        disabled
        type='email'
        data-testid='input'
      />
    )
    const el = screen.getByTestId('input') as HTMLInputElement
    expect(el.placeholder).toBe('Enter email')
    expect(el.disabled).toBe(true)
    expect(el.type).toBe('email')
  })

  test('applies base styles', () => {
    render(<Input data-testid='input' />)
    const el = screen.getByTestId('input')
    expect(el.className).toContain('border-pedie-border')
    expect(el.className).toContain('bg-pedie-card')
    expect(el.className).toContain('text-pedie-text')
  })
})

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------
describe('Select', () => {
  test('renders without crashing', () => {
    render(
      <Select data-testid='select'>
        <option>A</option>
      </Select>
    )
    expect(screen.getByTestId('select')).toBeInTheDocument()
  })

  test('applies default md size classes', () => {
    render(
      <Select data-testid='select'>
        <option>A</option>
      </Select>
    )
    const el = screen.getByTestId('select')
    expect(el.className).toContain('rounded-lg')
    expect(el.className).toContain('py-2')
  })

  test('applies sm size classes', () => {
    render(
      <Select size='sm' data-testid='select'>
        <option>A</option>
      </Select>
    )
    const el = screen.getByTestId('select')
    expect(el.className).toContain('rounded-md')
    expect(el.className).toContain('py-1')
  })

  test('applies lg size classes', () => {
    render(
      <Select size='lg' data-testid='select'>
        <option>A</option>
      </Select>
    )
    const el = screen.getByTestId('select')
    expect(el.className).toContain('text-base')
    expect(el.className).toContain('py-2.5')
  })

  test('passes through className prop', () => {
    render(
      <Select className='custom-class' data-testid='select'>
        <option>A</option>
      </Select>
    )
    expect(screen.getByTestId('select').className).toContain('custom-class')
  })

  test('passes through HTML attributes', () => {
    render(
      <Select disabled data-testid='select'>
        <option>A</option>
      </Select>
    )
    expect((screen.getByTestId('select') as HTMLSelectElement).disabled).toBe(
      true
    )
  })

  test('applies base styles', () => {
    render(
      <Select data-testid='select'>
        <option>A</option>
      </Select>
    )
    const el = screen.getByTestId('select')
    expect(el.className).toContain('appearance-none')
    expect(el.className).toContain('bg-pedie-card')
  })
})

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
describe('Badge', () => {
  test('renders without crashing', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  test('applies default variant classes', () => {
    render(<Badge>Tag</Badge>)
    const el = screen.getByText('Tag')
    expect(el.className).toContain('bg-pedie-surface')
    expect(el.className).toContain('text-pedie-text')
  })

  test('applies success variant classes', () => {
    render(<Badge variant='success'>OK</Badge>)
    const el = screen.getByText('OK')
    expect(el.className).toContain('bg-pedie-success-bg')
    expect(el.className).toContain('text-pedie-success')
  })

  test('applies error variant classes', () => {
    render(<Badge variant='error'>Err</Badge>)
    const el = screen.getByText('Err')
    expect(el.className).toContain('bg-pedie-error-bg')
    expect(el.className).toContain('text-pedie-error')
  })

  test('applies warning variant classes', () => {
    render(<Badge variant='warning'>Warn</Badge>)
    const el = screen.getByText('Warn')
    expect(el.className).toContain('bg-pedie-warning-bg')
    expect(el.className).toContain('text-pedie-warning')
  })

  test('applies info variant classes', () => {
    render(<Badge variant='info'>Info</Badge>)
    const el = screen.getByText('Info')
    expect(el.className).toContain('bg-pedie-info-bg')
    expect(el.className).toContain('text-pedie-info')
  })

  test('applies green variant classes', () => {
    render(<Badge variant='green'>Sale</Badge>)
    const el = screen.getByText('Sale')
    expect(el.className).toContain('bg-pedie-green/10')
    expect(el.className).toContain('text-pedie-green')
  })

  test('applies discount variant classes', () => {
    render(<Badge variant='discount'>-10%</Badge>)
    const el = screen.getByText('-10%')
    expect(el.className).toContain('bg-pedie-discount/10')
    expect(el.className).toContain('text-pedie-discount')
  })

  test('applies sm size classes', () => {
    render(<Badge size='sm'>S</Badge>)
    const el = screen.getByText('S')
    expect(el.className).toContain('px-1.5')
    expect(el.className).toContain('text-[10px]')
  })

  test('applies default md size classes', () => {
    render(<Badge>M</Badge>)
    const el = screen.getByText('M')
    expect(el.className).toContain('px-2')
    expect(el.className).toContain('text-xs')
  })

  test('applies lg size classes', () => {
    render(<Badge size='lg'>L</Badge>)
    const el = screen.getByText('L')
    expect(el.className).toContain('px-2.5')
    expect(el.className).toContain('font-bold')
  })

  test('passes through className prop', () => {
    render(<Badge className='extra'>B</Badge>)
    expect(screen.getByText('B').className).toContain('extra')
  })

  test('renders as a span element', () => {
    render(<Badge>Span</Badge>)
    expect(screen.getByText('Span').tagName).toBe('SPAN')
  })

  test('passes through DOM attributes', () => {
    render(
      <Badge data-testid='badge' id='my-badge' aria-label='status badge'>
        Active
      </Badge>
    )
    const el = screen.getByTestId('badge')
    expect(el.id).toBe('my-badge')
    expect(el.getAttribute('aria-label')).toBe('status badge')
  })
})

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------
describe('Alert', () => {
  test('renders without crashing', () => {
    render(<Alert variant='info'>Hello</Alert>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  test('has role="alert"', () => {
    render(<Alert variant='error'>Oops</Alert>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  test('applies success variant classes', () => {
    render(<Alert variant='success'>Done</Alert>)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('bg-pedie-success-bg')
    expect(el.className).toContain('text-pedie-success')
  })

  test('applies error variant classes', () => {
    render(<Alert variant='error'>Fail</Alert>)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('bg-pedie-error-bg')
    expect(el.className).toContain('text-pedie-error')
  })

  test('applies warning variant classes', () => {
    render(<Alert variant='warning'>Careful</Alert>)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('bg-pedie-warning-bg')
    expect(el.className).toContain('text-pedie-warning')
  })

  test('applies info variant classes', () => {
    render(<Alert variant='info'>FYI</Alert>)
    const el = screen.getByRole('alert')
    expect(el.className).toContain('bg-pedie-info-bg')
    expect(el.className).toContain('text-pedie-info')
  })

  test('passes through className prop', () => {
    render(
      <Alert variant='info' className='my-alert'>
        Note
      </Alert>
    )
    expect(screen.getByRole('alert').className).toContain('my-alert')
  })

  test('passes through DOM attributes', () => {
    render(
      <Alert variant='info' id='my-alert' data-category='system'>
        Info
      </Alert>
    )
    const el = screen.getByRole('alert')
    expect(el.id).toBe('my-alert')
    expect(el.getAttribute('data-category')).toBe('system')
  })
})

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------
describe('Spinner', () => {
  test('renders without crashing', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('has role="status"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  test('contains visually hidden loading text', () => {
    render(<Spinner />)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  test('applies default md size classes', () => {
    render(<Spinner />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('h-5')
    expect(svg?.getAttribute('class')).toContain('w-5')
  })

  test('applies sm size classes', () => {
    render(<Spinner size='sm' />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('h-4')
    expect(svg?.getAttribute('class')).toContain('w-4')
  })

  test('applies lg size classes', () => {
    render(<Spinner size='lg' />)
    const svg = screen.getByRole('status').querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('h-8')
    expect(svg?.getAttribute('class')).toContain('w-8')
  })

  test('passes through className prop', () => {
    render(<Spinner className='text-red-500' />)
    const el = screen.getByRole('status')
    expect(el.className).toContain('text-red-500')
  })

  test('passes through DOM attributes', () => {
    render(<Spinner id='loader' aria-label='Loading data' />)
    const el = screen.getByRole('status')
    expect(el.id).toBe('loader')
    expect(el.getAttribute('aria-label')).toBe('Loading data')
  })
})

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------
describe('EmptyState', () => {
  const MockIcon = ({ className }: { className?: string }) => (
    <svg data-testid='mock-icon' className={className} />
  )

  test('renders without crashing', () => {
    render(<EmptyState icon={MockIcon} title='No items' />)
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  test('renders the icon', () => {
    render(<EmptyState icon={MockIcon} title='No items' />)
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  test('renders title', () => {
    render(<EmptyState icon={MockIcon} title='Nothing here' />)
    expect(screen.getByText('Nothing here').tagName).toBe('H3')
  })

  test('renders description when provided', () => {
    render(
      <EmptyState
        icon={MockIcon}
        title='Empty'
        description='Try adding something'
      />
    )
    expect(screen.getByText('Try adding something')).toBeInTheDocument()
  })

  test('does not render description when not provided', () => {
    const { container } = render(<EmptyState icon={MockIcon} title='Empty' />)
    expect(container.querySelector('p')).toBeNull()
  })

  test('renders children', () => {
    render(
      <EmptyState icon={MockIcon} title='Empty'>
        <button>Add item</button>
      </EmptyState>
    )
    expect(screen.getByText('Add item')).toBeInTheDocument()
  })

  test('passes through className prop', () => {
    const { container } = render(
      <EmptyState icon={MockIcon} title='Empty' className='my-empty' />
    )
    expect(container.firstElementChild?.className).toContain('my-empty')
  })

  test('passes through DOM attributes', () => {
    render(
      <EmptyState
        icon={MockIcon}
        title='Empty'
        data-testid='empty'
        id='empty-state'
      />
    )
    const el = screen.getByTestId('empty')
    expect(el.id).toBe('empty-state')
  })
})

// ---------------------------------------------------------------------------
// GoogleIcon
// ---------------------------------------------------------------------------
describe('GoogleIcon', () => {
  test('renders with aria-hidden', () => {
    const { container } = render(<GoogleIcon />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  test('applies className prop', () => {
    const { container } = render(<GoogleIcon className='w-6 h-6' />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('w-6')
  })

  test('renders four colored paths', () => {
    const { container } = render(<GoogleIcon />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(4)
  })
})

// ---------------------------------------------------------------------------
// StepIndicator
// ---------------------------------------------------------------------------
describe('StepIndicator', () => {
  const steps = [
    { key: 'a', label: 'Step A' },
    { key: 'b', label: 'Step B' },
    { key: 'c', label: 'Step C' },
  ]

  test('renders all step labels', () => {
    render(<StepIndicator steps={steps} currentIndex={0} />)
    expect(screen.getByText('Step A')).toBeInTheDocument()
    expect(screen.getByText('Step B')).toBeInTheDocument()
    expect(screen.getByText('Step C')).toBeInTheDocument()
  })

  test('marks completed steps with check icon', () => {
    const { container } = render(
      <StepIndicator steps={steps} currentIndex={2} />
    )
    // Steps 0 and 1 are completed (index < currentIndex), should have TbCheck svg
    // The check icons have aria-hidden
    const circles = container.querySelectorAll('.rounded-full')
    // First two should have SVG (check), third should have number "3"
    expect(circles[0]?.querySelector('svg')).not.toBeNull()
    expect(circles[1]?.querySelector('svg')).not.toBeNull()
    expect(circles[2]?.textContent).toBe('3')
  })

  test('marks future steps as muted', () => {
    const { container } = render(
      <StepIndicator steps={steps} currentIndex={0} />
    )
    const circles = container.querySelectorAll('.rounded-full')
    // Step 0 is current (green), steps 1 and 2 are future (muted)
    expect(circles[0]?.className).toContain('bg-pedie-green')
    expect(circles[1]?.className).toContain('bg-pedie-border')
    expect(circles[2]?.className).toContain('bg-pedie-border')
  })

  test('current step shows number not check', () => {
    render(<StepIndicator steps={steps} currentIndex={1} />)
    const circles = document.querySelectorAll('.rounded-full')
    // Current step (index 1) shows number "2"
    expect(circles[1]?.textContent).toBe('2')
  })

  test('applies className prop', () => {
    const { container } = render(
      <StepIndicator steps={steps} currentIndex={0} className='my-indicator' />
    )
    expect(container.firstElementChild?.className).toContain('my-indicator')
  })
})

// ---------------------------------------------------------------------------
// CheckboxFilterGroup
// ---------------------------------------------------------------------------
describe('CheckboxFilterGroup', () => {
  const options = [
    { value: 'apple', label: 'Apple', count: 5 },
    { value: 'samsung', label: 'Samsung', count: 3 },
  ]

  test('renders title and options', () => {
    render(
      <CheckboxFilterGroup
        title='Brand'
        options={options}
        selected={[]}
        onChange={() => {}}
      />
    )
    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Samsung')).toBeInTheDocument()
  })

  test('renders counts when provided', () => {
    render(
      <CheckboxFilterGroup
        title='Brand'
        options={options}
        selected={[]}
        onChange={() => {}}
      />
    )
    expect(screen.getByText('(5)')).toBeInTheDocument()
    expect(screen.getByText('(3)')).toBeInTheDocument()
  })

  test('checks selected options', () => {
    render(
      <CheckboxFilterGroup
        title='Brand'
        options={options}
        selected={['apple']}
        onChange={() => {}}
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true)
    expect((checkboxes[1] as HTMLInputElement).checked).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// PriceRangeFilter
// ---------------------------------------------------------------------------
describe('PriceRangeFilter', () => {
  test('renders min and max inputs', () => {
    render(
      <PriceRangeFilter
        min='100'
        max='500'
        onMinChange={() => {}}
        onMaxChange={() => {}}
      />
    )
    expect(screen.getByPlaceholderText('Min')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Max')).toBeInTheDocument()
  })

  test('renders title', () => {
    render(
      <PriceRangeFilter
        min=''
        max=''
        onMinChange={() => {}}
        onMaxChange={() => {}}
      />
    )
    expect(screen.getByText('Price Range')).toBeInTheDocument()
  })

  test('shows current values', () => {
    render(
      <PriceRangeFilter
        min='100'
        max='500'
        onMinChange={() => {}}
        onMaxChange={() => {}}
      />
    )
    const minInput = screen.getByPlaceholderText('Min') as HTMLInputElement
    const maxInput = screen.getByPlaceholderText('Max') as HTMLInputElement
    expect(minInput.value).toBe('100')
    expect(maxInput.value).toBe('500')
  })
})
