import Link from 'next/link'
import { FooterNewsletterForm } from './footer-newsletter-form'

export function Footer() {
  return (
    <footer className='border-t border-pedie-border bg-pedie-dark pt-16 pb-8'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6'>
          <div className='lg:col-span-2'>
            <Link
              href='/'
              className='flex items-center gap-1 text-2xl font-bold tracking-tight mb-4'
            >
              <span className='text-pedie-green'>PEDIE</span>
              <span className='text-pedie-text'>TECH</span>
            </Link>
            <p className='text-pedie-text-muted mb-6 max-w-sm'>
              Quality refurbished electronics for Kenya. Every device tested,
              graded, and backed by a 3-month warranty.
            </p>
            <FooterNewsletterForm />
          </div>

          <div>
            <h3 className='mb-4 text-lg font-semibold text-pedie-text'>
              About Pedie Tech
            </h3>
            <ul className='flex flex-col gap-3 text-sm text-pedie-text-muted'>
              <li>
                <Link
                  href='/about'
                  className='hover:text-pedie-green transition-colors'
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='/story'
                  className='hover:text-pedie-green transition-colors'
                >
                  Our Story
                </Link>
              </li>
              <li>
                <Link
                  href='/sustainability'
                  className='hover:text-pedie-green transition-colors'
                >
                  Sustainability
                </Link>
              </li>
              <li>
                <Link
                  href='/careers'
                  className='hover:text-pedie-green transition-colors'
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 text-lg font-semibold text-pedie-text'>Shop</h3>
            <ul className='flex flex-col gap-3 text-sm text-pedie-text-muted'>
              <li>
                <Link
                  href='/collections/smartphones'
                  className='hover:text-pedie-green transition-colors'
                >
                  Smartphones
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/laptops'
                  className='hover:text-pedie-green transition-colors'
                >
                  Laptops
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/tablets'
                  className='hover:text-pedie-green transition-colors'
                >
                  Tablets
                </Link>
              </li>
              <li>
                <Link
                  href='/collections/accessories'
                  className='hover:text-pedie-green transition-colors'
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href='/deals'
                  className='hover:text-pedie-green transition-colors'
                >
                  Daily Deals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 text-lg font-semibold text-pedie-text'>Help</h3>
            <ul className='flex flex-col gap-3 text-sm text-pedie-text-muted'>
              <li>
                <Link
                  href='/contact'
                  className='hover:text-pedie-green transition-colors'
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href='/faq'
                  className='hover:text-pedie-green transition-colors'
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href='/shipping'
                  className='hover:text-pedie-green transition-colors'
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href='/returns'
                  className='hover:text-pedie-green transition-colors'
                >
                  Returns & Warranty
                </Link>
              </li>
              <li>
                <Link
                  href='/track'
                  className='hover:text-pedie-green transition-colors'
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-4 text-lg font-semibold text-pedie-text'>
              Policies
            </h3>
            <ul className='flex flex-col gap-3 text-sm text-pedie-text-muted'>
              <li>
                <Link
                  href='/privacy'
                  className='hover:text-pedie-green transition-colors'
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='hover:text-pedie-green transition-colors'
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href='/cookies'
                  className='hover:text-pedie-green transition-colors'
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-16 flex flex-col items-center justify-between gap-6 border-t border-pedie-border pt-8 md:flex-row'>
          <p className='text-sm text-pedie-text-muted'>
            © {new Date().getFullYear()} Pedie Tech. All rights reserved.
          </p>

          <div className='flex items-center gap-4'>
            <span className='rounded bg-pedie-card px-2 py-1 text-xs font-bold text-pedie-text border border-pedie-border'>
              M-PESA
            </span>
            <span className='rounded bg-pedie-card px-2 py-1 text-xs font-bold text-pedie-text border border-pedie-border'>
              PayPal
            </span>
          </div>

          <div className='flex items-center gap-4 text-pedie-text-muted'>
            <a
              href='https://tiktok.com/@pedietech'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-pedie-green transition-colors'
              aria-label='TikTok'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5' />
              </svg>
            </a>
            <a
              href='https://instagram.com/pedietech'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-pedie-green transition-colors'
              aria-label='Instagram'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
                <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
              </svg>
            </a>
            <a
              href='https://x.com/pedietech'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-pedie-green transition-colors'
              aria-label='X (Twitter)'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
