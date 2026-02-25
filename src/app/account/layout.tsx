import Link from 'next/link'
import { requireAuth } from '@lib/auth/helpers'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  const navLinks = [
    { href: '/account', label: 'Dashboard' },
    { href: '/account/orders', label: 'Orders' },
    { href: '/account/wishlist', label: 'Wishlist' },
    { href: '/account/settings', label: 'Settings' },
  ]

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-col md:flex-row md:gap-8'>
        {/* Mobile horizontal nav */}
        <nav className='mb-6 flex gap-2 overflow-x-auto md:hidden'>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className='whitespace-nowrap rounded-lg border border-pedie-border bg-pedie-card px-4 py-2 text-sm text-pedie-text hover:bg-pedie-card-hover transition-colors'
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop sidebar */}
        <aside className='hidden md:block md:w-56 md:shrink-0'>
          <nav className='space-y-1'>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className='block rounded-lg px-4 py-2.5 text-sm text-pedie-text hover:bg-pedie-card transition-colors'
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className='min-w-0 flex-1'>{children}</main>
      </div>
    </div>
  )
}
