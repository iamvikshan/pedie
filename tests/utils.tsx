/**
 * Shared DOM test utilities.
 * Provides reusable Next.js mocks and RTL re-exports for DOM tests.
 *
 * Usage:
 *   import { mockNextNavigation, mockNextLink, mockNextImage } from '../utils'
 */
import { mock } from 'bun:test'
import React from 'react'

// Re-export RTL for convenience
export { render, screen, within, waitFor } from '@testing-library/react'

/** Mock next/navigation — call before describe() or in beforeAll() */
export function mockNextNavigation(
  overrides: {
    pathname?: string
    searchParams?: URLSearchParams
  } = {}
) {
  const { pathname = '/', searchParams = new URLSearchParams() } = overrides
  mock.module('next/navigation', () => ({
    useRouter: mock(() => ({
      push: mock(),
      replace: mock(),
      back: mock(),
      forward: mock(),
      refresh: mock(),
      prefetch: mock(),
    })),
    useSearchParams: mock(() => searchParams),
    usePathname: mock(() => pathname),
    redirect: mock(),
    notFound: mock(),
  }))
}

/** Mock next/link as a plain <a> tag */
export function mockNextLink() {
  mock.module('next/link', () => ({
    default: mock(
      ({
        children,
        href,
        ...props
      }: {
        children: React.ReactNode
        href: string
        [key: string]: unknown
      }) => React.createElement('a', { href, ...props }, children)
    ),
  }))
}

/** Mock next/image as a plain <img> tag */
export function mockNextImage() {
  mock.module('next/image', () => ({
    default: mock(
      ({
        src,
        alt,
        fill,
        ...props
      }: {
        src: string
        alt: string
        fill?: boolean
        [key: string]: unknown
      }) =>
        React.createElement('img', {
          src,
          alt,
          'data-fill': fill ? 'true' : undefined,
          ...props,
        })
    ),
  }))
}

/** Mock framer-motion — renders children directly without animation */
export function mockFramerMotion() {
  mock.module('framer-motion', () => ({
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          const Component = ({
            children,
            ...props
          }: {
            children?: React.ReactNode
            [key: string]: unknown
          }) => {
            const filteredProps = Object.fromEntries(
              Object.entries(props).filter(
                ([key]) =>
                  ![
                    'animate',
                    'initial',
                    'exit',
                    'variants',
                    'transition',
                    'whileHover',
                    'whileTap',
                    'whileInView',
                    'layout',
                    'layoutId',
                  ].includes(key)
              )
            )
            return React.createElement(prop, filteredProps, children)
          }
          Component.displayName = `motion.${prop}`
          return Component
        },
      }
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useAnimation: mock(() => ({ start: mock(), stop: mock() })),
    useInView: mock(() => true),
  }))
}

/** Setup all common Next.js mocks at once */
export function mockNextModules(
  overrides?: Parameters<typeof mockNextNavigation>[0]
) {
  mockNextNavigation(overrides)
  mockNextLink()
  mockNextImage()
}
