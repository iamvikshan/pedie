'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import type { ComponentType } from 'react'
import { useEffect, useRef, useState } from 'react'
import { TbLeaf, TbRecycle, TbShieldCheck } from 'react-icons/tb'

export const SUSTAINABILITY_STATS = [
  { label: 'Devices Saved', value: 1000, suffix: '+', icon: 'TbRecycle' },
  { label: 'Average Savings', value: 40, suffix: '%', icon: 'TbLeaf' },
  { label: 'Warranty', value: 3, suffix: '-Month', icon: 'TbShieldCheck' },
] as const

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  TbRecycle,
  TbLeaf,
  TbShieldCheck,
}

interface AnimatedCounterProps {
  target: number
  suffix: string
}

function AnimatedCounter({ target, suffix }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const steps = 60
    const increment = target / steps
    const stepDuration = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <motion.span ref={ref} className='text-3xl font-bold text-pedie-green'>
      {count}
      {suffix}
    </motion.span>
  )
}

export function SustainabilitySection() {
  return (
    <motion.section
      className='py-20 bg-pedie-card border-y border-pedie-border relative overflow-hidden'
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient orbs */}
      <div
        className='absolute top-0 left-1/4 w-96 h-96 rounded-full bg-pedie-green/10 blur-3xl'
        aria-hidden='true'
      />
      <div
        className='absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-pedie-green/10 blur-3xl'
        aria-hidden='true'
      />
      <div
        className='absolute top-1/2 left-3/4 w-64 h-64 rounded-full bg-pedie-green/10 blur-3xl'
        aria-hidden='true'
      />

      <div className='container mx-auto px-4 md:px-6 relative z-10'>
        <div className='max-w-3xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-pedie-text mb-6'>
            Join the Circular Economy
          </h2>
          <p className='text-lg text-pedie-text-muted mb-10'>
            By choosing refurbished electronics, you&apos;re not just saving
            money—you&apos;re actively reducing e-waste and extending the
            lifecycle of perfectly good devices. Every purchase makes a
            difference.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
            {SUSTAINABILITY_STATS.map(stat => {
              const Icon = ICON_MAP[stat.icon]
              return (
                <div
                  key={stat.label}
                  className='p-6 glass rounded-2xl border border-pedie-border flex flex-col items-center gap-3'
                >
                  {Icon && <Icon className='w-8 h-8 text-pedie-green' />}
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  <div className='text-sm text-pedie-text-muted'>
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>

          <Link
            href='/collections/smartphones'
            className='inline-flex items-center justify-center rounded-md bg-pedie-green px-8 py-3 text-base font-medium text-white transition-colors hover:bg-pedie-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pedie-green focus-visible:ring-offset-2 focus-visible:ring-offset-pedie-dark'
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
