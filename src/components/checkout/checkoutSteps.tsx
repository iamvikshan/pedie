import { StepIndicator } from '@components/ui/stepIndicator'

const CHECKOUT_STEPS = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
]

interface CheckoutStepsProps {
  currentStep: number
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <StepIndicator
      steps={CHECKOUT_STEPS}
      currentIndex={currentStep - 1}
      className='mb-8 justify-center gap-2'
    />
  )
}
