import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className='mb-12 w-full py-16 md:py-20 lg:py-24'>
      <div className='container mx-auto max-w-7xl px-4 md:px-6'>
        <div className='bg-primary text-primary-foreground rounded-2xl px-6 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20'>
          <div className='flex flex-col items-center justify-center space-y-6 text-center'>
            <div className='space-y-3'>
              <h2 className='text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>
                Ready to create amazing content?
              </h2>
              <p className='text-primary-foreground/90 mx-auto max-w-[600px] text-base md:text-lg'>
                Join the AI content revolution today. Start your free trial - no credit card required!
              </p>
            </div>
            <div className='flex flex-col gap-3 pt-4 min-[400px]:flex-row'>
              <Button size='lg' variant='secondary' asChild className='font-semibold'>
                <Link href='/auth/sign-up'>
                  Start Creating Now
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
              <Button
                size='lg'
                variant='outline'
                asChild
                className='border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground bg-transparent'
              >
                <Link href='#pricing'>View Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
