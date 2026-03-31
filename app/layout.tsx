// Next Imports
import { ThemeProvider } from 'next-themes'
import { Geist, Inter } from 'next/font/google'
import type { Metadata } from 'next'

// React Imports
import { ReactNode } from 'react'

// Component Imports
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ImpersonationBanner } from '@/components/impersonation-banner'

// Hook Imports
import { AuthProvider } from '@/hooks/use-auth'

// Utility Imports
import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'AI Content Studio - Create Amazing Content with AI',
  description:
    'Professional AI-powered content creation platform. Generate copy, images, analyze documents, and create voice content with advanced AI tools.'
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin']
})

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning className={cn('font-sans', inter.variable)}>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ImpersonationBanner />
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position='top-right' richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
