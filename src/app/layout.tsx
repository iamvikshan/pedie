import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@components/layout/header'
import { Footer } from '@components/layout/footer'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Pedie Tech | Quality Refurbished Electronics in Kenya',
  description:
    'Shop quality refurbished smartphones, laptops, and electronics at affordable prices in Kenya. Every device tested, graded, and backed by a 3-month warranty.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${inter.variable} antialiased bg-pedie-dark text-pedie-text min-h-screen flex flex-col`}
      >
        <Header />
        <main className='flex-1'>{children}</main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  )
}
