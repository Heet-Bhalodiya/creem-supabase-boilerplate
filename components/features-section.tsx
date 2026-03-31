// Next Imports
import Link from 'next/link'

// Third-party Imports
import { Wand2, FileSearch, Mic, ImageIcon, BarChart, Users, ArrowRightIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Utility Imports
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Wand2,
    title: 'AI Copywriter',
    description:
      'Generate compelling marketing copy, emails, and social media posts in seconds with advanced AI. Create professional content that converts and engages your audience.',
    cardBorderColor: 'border-primary/40 hover:border-primary',
    avatarTextColor: 'text-primary',
    avatarBgColor: 'bg-primary/10'
  },
  {
    icon: ImageIcon,
    title: 'Image Generation',
    description:
      'Create stunning visuals, graphics, and illustrations for your content with AI-powered tools. Transform ideas into beautiful images instantly.',
    cardBorderColor: 'border-pink-600/40 hover:border-pink-600 dark:border-pink-400/40 dark:hover:border-pink-400',
    avatarTextColor: 'text-pink-600 dark:text-pink-400',
    avatarBgColor: 'bg-pink-600/10 dark:bg-pink-400/10'
  },
  {
    icon: FileSearch,
    title: 'Document Analysis',
    description:
      'Extract insights, summarize content, and analyze documents with intelligent AI processing. Save time and effortlessly understand complex documents.',
    cardBorderColor: 'border-blue-600/40 hover:border-blue-600 dark:border-blue-400/40 dark:hover:border-blue-400',
    avatarTextColor: 'text-blue-600 dark:text-blue-400',
    avatarBgColor: 'bg-blue-600/10 dark:bg-blue-400/10'
  },
  {
    icon: Mic,
    title: 'Text-to-Voice',
    description:
      'Convert your written content into natural-sounding voice narration for podcasts and videos. Make your content accessible and engaging for all audiences.',
    cardBorderColor: 'border-green-600/40 hover:border-green-600 dark:border-green-400/40 dark:hover:border-green-400',
    avatarTextColor: 'text-green-600 dark:text-green-400',
    avatarBgColor: 'bg-green-600/10 dark:bg-green-400/10'
  },
  {
    icon: BarChart,
    title: 'Content Analytics',
    description:
      'Track performance, engagement, and ROI of all your AI-generated content with detailed insights. Make data-driven decisions to optimize your content strategy.',
    cardBorderColor: 'border-amber-600/40 hover:border-amber-600 dark:border-amber-400/40 dark:hover:border-amber-400',
    avatarTextColor: 'text-amber-600 dark:text-amber-400',
    avatarBgColor: 'bg-amber-600/10 dark:bg-amber-400/10'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Work together with your team, share content, and manage projects with role-based access control. Ensure secure environment for all team activities.',
    cardBorderColor: 'border-sky-600/40 hover:border-sky-600 dark:border-sky-400/40 dark:hover:border-sky-400',
    avatarTextColor: 'text-sky-600 dark:text-sky-400',
    avatarBgColor: 'bg-sky-600/10 dark:bg-sky-400/10'
  }
]

export function FeaturesSection() {
  return (
    <section className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-12 space-y-4 sm:mb-16'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Discover Our AI-Powered Features</h2>
          <p className='text-muted-foreground text-xl'>
            Explore key features designed to enhance your content creation with intelligent AI tools, seamless
            collaboration, and powerful analytics.
          </p>
          <Button variant='outline' className='rounded-lg text-base shadow-none has-[>svg]:px-6' size='lg' asChild>
            <Link href='/user/demo'>
              Try AI Content Studio
              <ArrowRightIcon className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <Card key={index} className={cn('shadow-none transition-colors duration-300', feature.cardBorderColor)}>
              <CardContent className='pt-6'>
                <Avatar className='mb-6 size-10 rounded-md'>
                  <AvatarFallback
                    className={cn('rounded-md [&>svg]:size-6', feature.avatarBgColor, feature.avatarTextColor)}
                  >
                    <feature.icon />
                  </AvatarFallback>
                </Avatar>
                <h6 className='mb-2 text-lg font-semibold'>{feature.title}</h6>
                <p className='text-muted-foreground'>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
