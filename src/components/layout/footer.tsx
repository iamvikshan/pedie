import Link from 'next/link'
import {
  TbBrandGithub,
  TbBrandInstagram,
  TbBrandTiktok,
  TbBrandX,
  TbBrandYoutube,
  TbChevronDown,
} from 'react-icons/tb'
import { URLS, FOOTER_LINKS } from '@/config'
import { NewsletterSignup } from './newsletterSignup'

export { FOOTER_LINKS }

const SOCIAL_LINKS = [
  { icon: TbBrandTiktok, href: URLS.social.tiktok, label: 'TikTok' },
  {
    icon: TbBrandInstagram,
    href: URLS.social.instagram,
    label: 'Instagram',
  },
  { icon: TbBrandX, href: URLS.social.x, label: 'X (Twitter)' },
  { icon: TbBrandYoutube, href: URLS.social.youtube, label: 'YouTube' },
  { icon: TbBrandGithub, href: URLS.social.github, label: 'GitHub' },
]

export function Footer() {
  return (
    <footer className='glass-footer bg-pedie-surface pt-16 pb-8 overflow-x-hidden'>
      <div className='w-full max-w-7xl mx-auto px-4 md:px-6'>
        {/* Brand + Newsletter */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6'>
          <div className='lg:col-span-2'>
            <Link
              href='/'
              className='flex items-center gap-1 text-2xl font-bold tracking-tight mb-4'
            >
              <span className='text-2xl font-bold tracking-tight text-pedie-green'>
                pedie
              </span>
            </Link>
            <p className='text-pedie-text-muted mb-6 max-w-sm'>
              Quality refurbished electronics for Kenya. Every device tested,
              graded, and backed by a 3-month warranty.
            </p>
            <NewsletterSignup />
          </div>

          {/* Links Grid */}
          {FOOTER_LINKS.map(group => (
            <details key={group.title} className='footer-accordion group'>
              <summary className='flex cursor-pointer items-center justify-between text-lg font-semibold text-pedie-text mb-4 list-none md:cursor-default [&::-webkit-details-marker]:hidden'>
                {group.title}
                <TbChevronDown className='h-4 w-4 transition-transform group-open:rotate-180 md:hidden' />
              </summary>
              <ul className='flex flex-col gap-3 text-sm text-pedie-text-muted'>
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className='hover:text-pedie-green transition-colors'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        {/* Socials + Payment Badges */}
        <div className='mt-16 flex flex-col items-center justify-between gap-6 border-t border-pedie-border pt-8 md:flex-row'>
          <p className='text-sm text-pedie-text-muted'>
            © {new Date().getFullYear()} Pedie. All rights reserved.
          </p>

          <div className='flex items-center gap-4'>
            <span className='rounded bg-pedie-glass px-2 py-1 text-xs font-bold text-pedie-text border border-pedie-glass-border backdrop-blur-sm'>
              M-PESA
            </span>
            <span className='rounded bg-pedie-glass px-2 py-1 text-xs font-bold text-pedie-text border border-pedie-glass-border backdrop-blur-sm'>
              PayPal
            </span>
          </div>

          <div className='flex items-center gap-4 text-pedie-text-muted'>
            {SOCIAL_LINKS.map(social => (
              <a
                key={social.label}
                href={social.href}
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-pedie-green transition-colors'
                aria-label={social.label}
              >
                <social.icon className='h-5 w-5' />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
