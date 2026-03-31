import { AuthButton } from '@/components/auth-button'
import { AuthRedirect } from '@/components/auth-redirect'
import Hero from '@/components/hero'
import { FeaturesSection } from '@/components/features-section'
import { HowItWorksSection } from '@/components/how-it-works-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { CTASection } from '@/components/cta-section'
import { Footer } from '@/components/footer'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { ClientPricingSection } from '@/components/client-pricing-section'
import Logo from '@/components/logo'
import Link from 'next/link'
import { Suspense } from 'react'

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center'>
      <AuthRedirect />
      <div className='flex w-full flex-1 flex-col items-center'>
        <nav className='border-b-foreground/10 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-16 w-full justify-center border-b backdrop-blur'>
          <div className='flex w-full max-w-7xl items-center justify-between p-3 px-5 text-sm'>
            <Link href={'/'} className='flex items-center'>
              <Logo showIcon={true} showText={true} />
            </Link>

            <div className='absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 sm:flex'>
              <Link href='/#features' className='text-muted-foreground hover:text-foreground transition-colors'>
                Features
              </Link>
              <Link href='/#pricing' className='text-muted-foreground hover:text-foreground transition-colors'>
                Plans
              </Link>
              <Link href='/#how-it-works' className='text-muted-foreground hover:text-foreground transition-colors'>
                How It Works
              </Link>
            </div>

            <div className='flex items-center gap-2'>
              <ThemeSwitcher />
              <Suspense>
                <AuthButton />
              </Suspense>
            </div>
          </div>
        </nav>

        <div className='flex w-full max-w-7xl flex-1 flex-col'>
          <Hero />
          <div id='features'>
            <FeaturesSection />
          </div>
          <div id='how-it-works'>
            <HowItWorksSection />
          </div>
          <div id='pricing'>
            <ClientPricingSection />
          </div>

          <TestimonialsSection />
          <CTASection />
        </div>

        <Footer />
      </div>
    </main>
  )
}
