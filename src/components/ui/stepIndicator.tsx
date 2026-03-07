import { TbCheck } from 'react-icons/tb'

export interface Step {
  key: string
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentIndex: number
  className?: string
}

export function StepIndicator({
  steps,
  currentIndex,
  className = '',
}: StepIndicatorProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <div key={step.key} className='flex flex-1 items-center'>
          <div className='flex flex-col items-center'>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                index <= currentIndex
                  ? 'bg-pedie-green text-white'
                  : 'bg-pedie-border text-pedie-text-muted'
              }`}
            >
              {index < currentIndex ? (
                <TbCheck className='h-4 w-4' aria-hidden='true' />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`mt-1 text-xs ${
                index <= currentIndex
                  ? 'text-pedie-text font-medium'
                  : 'text-pedie-text-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-1 h-px flex-1 ${
                index < currentIndex ? 'bg-pedie-green' : 'bg-pedie-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
