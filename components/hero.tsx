import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { TypingAnimation } from '@/components/ui/typing-animation'

const Hero = () => {
  return (
    <div className='flex flex-col items-center gap-12 px-4 py-16 text-center md:py-24'>
      <div className='bg-muted inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm'>
        <Sparkles className='h-4 w-4' />
        <span>AI-Powered Content Creation Made Simple ✨</span>
      </div>

      <div className='flex max-w-4xl flex-col gap-6'>
        <h1 className='text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl'>
          Create Amazing <br />
          <TypingAnimation
            words={['Content', 'Blogs', 'Images', 'Videos', 'Podcasts']}
            className='from-primary to-primary/60 inline-block bg-gradient-to-r bg-clip-text text-transparent'
            duration={100}
            loop
          />
          <br />
          with AI Studio
        </h1>
        <p className='text-muted-foreground mx-auto max-w-[700px] text-base md:text-lg lg:text-xl'>
          Generate marketing copy, create stunning images, analyze documents, and produce voice content with our
          complete AI-powered content platform. From idea to execution - we&apos;ve got you covered.
        </p>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
        <Button size='lg' asChild className='font-semibold'>
          <Link href='/auth/sign-up'>
            Start Creating Content
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
        <Button size='lg' variant='outline' asChild className='font-semibold'>
          <Link href='#features'>See How It Works</Link>
        </Button>
      </div>

      <div className='mt-4 grid grid-cols-3 gap-8 text-center md:gap-12'>
        <div>
          <div className='text-2xl font-bold md:text-3xl'>50K+</div>
          <div className='text-muted-foreground mt-1 text-xs md:text-sm'>Content Pieces</div>
        </div>
        <div>
          <div className='text-2xl font-bold md:text-3xl'>5K+</div>
          <div className='text-muted-foreground mt-1 text-xs md:text-sm'>Happy Creators</div>
        </div>
        <div>
          <div className='text-2xl font-bold md:text-3xl'>10sec</div>
          <div className='text-muted-foreground mt-1 text-xs md:text-sm'>Avg Generation</div>
        </div>
      </div>
    </div>
  )
}

export default Hero
