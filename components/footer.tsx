import { FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Logo from '@/components/logo'
import Link from 'next/link'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className='w-full border-t'>
      <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>
        <Link href='/'>
          <Logo />
        </Link>

        <div className='flex items-center gap-5 whitespace-nowrap'>
          <Link
            href='/#features'
            className='text-muted-foreground hover:text-foreground transition-colors duration-300'
          >
            Features
          </Link>
          <Link href='/#pricing' className='text-muted-foreground hover:text-foreground transition-colors duration-300'>
            Pricing
          </Link>
          <Link
            href='/#how-it-works'
            className='text-muted-foreground hover:text-foreground transition-colors duration-300'
          >
            How It Works
          </Link>
          <Link
            href='/auth/login'
            className='text-muted-foreground hover:text-foreground transition-colors duration-300'
          >
            Sign In
          </Link>
        </div>

        <div className='flex items-center gap-4'>
          <a
            href='https://twitter.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <TwitterIcon className='size-5' />
            <span className='sr-only'>Twitter</span>
          </a>
          <a
            href='https://facebook.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <FacebookIcon className='size-5' />
            <span className='sr-only'>Facebook</span>
          </a>
          <a
            href='https://instagram.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <InstagramIcon className='size-5' />
            <span className='sr-only'>Instagram</span>
          </a>
          <a
            href='https://linkedin.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <LinkedinIcon className='size-5' />
            <span className='sr-only'>LinkedIn</span>
          </a>
        </div>
      </div>

      <Separator />

      <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6'>
        <p className='text-muted-foreground text-center text-sm'>
          © {currentYear}{' '}
          <Link href='/' className='hover:text-foreground transition-colors'>
            AI Content Studio
          </Link>
          . Built with ❤️ for creators and marketers worldwide.
        </p>
      </div>
    </footer>
  )
}
