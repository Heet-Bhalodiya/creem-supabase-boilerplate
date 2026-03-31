import { Wand2, Sparkles, Download, BarChart } from 'lucide-react'

const steps = [
  {
    step: 1,
    icon: Wand2,
    title: 'Choose AI Tool',
    description:
      'Select from our suite of AI-powered tools: copywriter, image generator, document analyzer, or text-to-voice.'
  },
  {
    step: 2,
    icon: Sparkles,
    title: 'Generate Content',
    description:
      'Provide your input and let AI create professional-quality content in seconds. Customize to your needs.'
  },
  {
    step: 3,
    icon: Download,
    title: 'Download & Use',
    description: 'Export your generated content in multiple formats and use it across all your marketing channels.'
  },
  {
    step: 4,
    icon: BarChart,
    title: 'Track Performance',
    description: 'Monitor your content usage, credit spending, and ROI with comprehensive analytics dashboards.'
  }
]

export function HowItWorksSection() {
  return (
    <section className='bg-muted/50 w-full py-12 md:py-24 lg:py-32'>
      <div className='container mx-auto max-w-7xl px-4 md:px-6'>
        <div className='mb-12 flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>How It Works</h2>
            <p className='text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
              From idea to execution in four simple steps. Create professional content with AI in minutes.
            </p>
          </div>
        </div>

        <div className='mx-auto max-w-6xl'>
          <div className='relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {/* Horizontal connecting line - only visible on large screens */}
            <div className='absolute top-6 right-0 left-0 hidden lg:block'>
              <div className='mx-auto flex h-0.5 w-full items-center px-16'>
                <div className='bg-border h-full w-full' />
              </div>
            </div>

            {steps.map(step => (
              <div key={step.step} className='relative flex flex-col items-center text-center'>
                {/* Step number */}
                <div className='bg-primary text-primary-foreground relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold'>
                  {step.step}
                </div>

                {/* Icon */}
                <div className='bg-background mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm'>
                  <step.icon className='text-primary h-8 w-8' />
                </div>

                {/* Content */}
                <h3 className='mb-2 text-xl font-semibold'>{step.title}</h3>
                <p className='text-muted-foreground text-sm leading-relaxed'>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
