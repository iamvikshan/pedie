import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@components/layout/header'
import { Footer } from '@components/layout/footer'
import { CartHydration } from '@components/cart/cartHydration'
import { AuthProvider } from '@components/auth/authProvider'
import { WishlistProvider } from '@components/wishlist/wishlistProvider'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { organizationJsonLd, safeJsonLd } from '@lib/seo/structuredData'
import { ThemeProvider } from 'next-themes'
import { SITE_URL } from '@/config'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pedie | Quality Refurbished Electronics in Kenya',
    template: '%s | Pedie',
  },
  description:
    'Shop quality refurbished smartphones, laptops, and electronics at affordable prices in Kenya. Every device tested, graded, and backed by a 3-month warranty.',
  openGraph: {
    type: 'website',
    siteName: 'Pedie',
    locale: 'en_KE',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(organizationJsonLd()),
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased bg-pedie-bg text-pedie-text min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <AuthProvider>
            <WishlistProvider>
              <CartHydration />
              <Header />
              <main className='flex-1'>{children}</main>
              <Footer />
            </WishlistProvider>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
