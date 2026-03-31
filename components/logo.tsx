import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  showIcon?: boolean
  showText?: boolean
}

export default function Logo({ className, showIcon = true, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <div className='bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg'>
          <Sparkles className='h-5 w-5' />
        </div>
      )}
      {showText && <span className='text-lg font-semibold'>AI Content Studio</span>}
    </div>
  )
}
