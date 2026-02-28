interface CheckoutStepsProps {
  currentStep: number
}

const steps = ['Shipping', 'Payment', 'Review']

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className='flex items-center justify-center gap-2 mb-8'>
      {steps.map((step, index) => (
        <div key={step} className='flex items-center'>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              index + 1 <= currentStep
                ? 'bg-pedie-green text-white'
                : 'bg-pedie-border text-pedie-text-muted'
            }`}
          >
            {index + 1 < currentStep ? (
              <svg
                className='h-4 w-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          <span
            className={`ml-2 text-sm ${
              index + 1 <= currentStep
                ? 'text-pedie-text font-medium'
                : 'text-pedie-text-muted'
            }`}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <div
              className={`mx-4 h-px w-8 ${
                index + 1 < currentStep ? 'bg-pedie-green' : 'bg-pedie-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
