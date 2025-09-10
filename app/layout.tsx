import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Virtual Product Owner | AI-Powered SAFe Assistant for Colruyt Group',
  description: 'Transform your product management with AI-powered insights, role-based workflows, and intelligent automation designed specifically for SAFe practitioners at Colruyt Group Xtra.',
  keywords: 'product owner, SAFe, agile, Colruyt Group, Xtra, AI assistant, product management, scrum, sprint planning',
  authors: [{ name: 'Colruyt Group Digital Team' }],
  openGraph: {
    title: 'Virtual Product Owner | AI-Powered SAFe Assistant',
    description: 'Transform your product management with AI-powered insights designed for Colruyt Group Xtra.',
    url: 'https://virtual-po.colruyt-group.com',
    siteName: 'Virtual Product Owner',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Virtual Product Owner Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtual Product Owner | AI-Powered SAFe Assistant',
    description: 'Transform your product management with AI-powered insights designed for Colruyt Group Xtra.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${poppins.className} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
}