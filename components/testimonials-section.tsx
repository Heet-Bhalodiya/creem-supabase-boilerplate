import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Marquee } from '@/components/ui/marquee'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marketing Director, TechFlow Inc.',
    content:
      'AI Content Studio revolutionized our content creation! We generate 10x more content in half the time. Absolute game-changer.',
    avatar: '/avatars/01.svg',
    fallback: 'SC'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Founder, Creative Agency Co.',
    content:
      'The AI copywriter and image generator are incredible. Our team productivity increased by 300% and clients love the quality!',
    avatar: '/avatars/02.svg',
    fallback: 'MR'
  },
  {
    name: 'Emily Thompson',
    role: 'Content Manager, GrowthLabs',
    content:
      'From blog posts to social media graphics, everything we need in one place. The credits system makes budgeting so easy!',
    avatar: '/avatars/03.svg',
    fallback: 'ET'
  },
  {
    name: 'David Park',
    role: 'CEO, StartupVentures',
    content:
      "The ROI is incredible. We've cut our content production costs by 60% while doubling our output. Game-changing platform!",
    avatar: '/avatars/04.svg',
    fallback: 'DP'
  },
  {
    name: 'Lisa Anderson',
    role: 'Content Lead, Digital First',
    content:
      'Amazing tool for our team! The AI generates high-quality content that needs minimal editing. Saves us hours every day.',
    avatar: '/avatars/05.svg',
    fallback: 'LA'
  },
  {
    name: 'James Wilson',
    role: 'Marketing Manager, BrandCo',
    content:
      "Best content creation investment we've made. The platform is intuitive, fast, and the results are consistently impressive.",
    avatar: '/avatars/06.svg',
    fallback: 'JW'
  }
]

const TestimonialCard = ({ testimonial }: { testimonial: (typeof testimonials)[0] }) => (
  <div className='bg-card relative mx-2 w-87.5 overflow-hidden rounded-lg border p-6'>
    <div className='flex flex-col gap-4'>
      <p className='text-muted-foreground text-sm'>&ldquo;{testimonial.content}&rdquo;</p>
      <div className='flex items-center gap-4'>
        <Avatar>
          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
          <AvatarFallback>{testimonial.fallback}</AvatarFallback>
        </Avatar>
        <div>
          <p className='text-sm font-semibold'>{testimonial.name}</p>
          <p className='text-muted-foreground text-xs'>{testimonial.role}</p>
        </div>
      </div>
    </div>
  </div>
)

export function TestimonialsSection() {
  return (
    <section className='w-full overflow-hidden py-12 md:py-24 lg:py-32'>
      <div className='container px-4 md:px-6'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>Loved by content creators everywhere</h2>
            <p className='text-muted-foreground max-w-225 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
              Join thousands of marketers and creators already scaling their content production with AI Content Studio.
            </p>
          </div>
        </div>
      </div>
      <div className='mt-12'>
        <Marquee pauseOnHover className='[--duration:20s]'>
          {testimonials.map(testimonial => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </Marquee>
      </div>
    </section>
  )
}
