'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wand2, Mic, Loader2, CheckCircle2, XCircle, ImageIcon, FileSearch } from 'lucide-react'
import { toast } from 'sonner'

type DemoActionsProps = {
  balance: number
}

type ActionType = 'ai-copywriter' | 'image-generator' | 'document-analyzer' | 'text-to-voice'

type ActionConfig = {
  id: ActionType
  title: string
  description: string
  cost: number
  icon: ReactNode
  color: string
}

const ACTIONS: ActionConfig[] = [
  {
    id: 'ai-copywriter',
    title: 'AI Copywriter',
    description: 'Generate marketing copy, emails & social posts',
    cost: 10,
    icon: <Wand2 className='h-5 w-5' />,
    color: 'text-purple-600'
  },
  {
    id: 'image-generator',
    title: 'Image Generator',
    description: 'Create stunning visuals & graphics with AI',
    cost: 15,
    icon: <ImageIcon className='h-5 w-5' />,
    color: 'text-pink-600'
  },
  {
    id: 'document-analyzer',
    title: 'Document Analyzer',
    description: 'Extract insights from PDFs & documents',
    cost: 8,
    icon: <FileSearch className='h-5 w-5' />,
    color: 'text-blue-600'
  },
  {
    id: 'text-to-voice',
    title: 'Text-to-Voice',
    description: 'Convert articles to natural audio narration',
    cost: 12,
    icon: <Mic className='h-5 w-5' />,
    color: 'text-green-600'
  }
]

export function DemoActions({ balance }: DemoActionsProps) {
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null)
  const [completedActions, setCompletedActions] = useState<Set<ActionType>>(new Set())

  const handleAction = async (action: ActionConfig) => {
    if (balance < action.cost) {
      toast.error(`Insufficient credits. You need ${action.cost} credits but only have ${balance}.`, {
        description: 'Purchase more credits or upgrade your plan.'
      })
      return
    }

    setLoadingAction(action.id)

    try {
      // Call the example API route
      const response = await fetch('/api/example-credit-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.id,
          data: {
            timestamp: new Date().toISOString(),
            demo: true
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          toast.error(result.message || 'Insufficient credits')
        } else {
          toast.error(result.error || 'Action failed')
        }
        return
      }

      // Success!
      setCompletedActions(prev => new Set([...prev, action.id]))
      toast.success(`${action.title} completed!`, {
        description: `${action.cost} credits spent. ${result.credits.remainingBalance} credits remaining.`
      })

      // Refresh the page to update balance
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Action error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <>
      {ACTIONS.map(action => {
        const isLoading = loadingAction === action.id
        const isCompleted = completedActions.has(action.id)
        const hasEnoughCredits = balance >= action.cost

        return (
          <Card key={action.id} className='relative overflow-hidden'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className={`bg-muted rounded-lg p-2 ${action.color}`}>{action.icon}</div>
                <div className='text-right'>
                  <div className='text-muted-foreground text-sm'>Cost</div>
                  <div className='text-lg font-bold'>{action.cost} credits</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <CardTitle className='text-base'>{action.title}</CardTitle>
                <CardDescription className='text-sm'>{action.description}</CardDescription>
              </div>

              <Button
                className='w-full'
                onClick={() => handleAction(action)}
                disabled={isLoading || !hasEnoughCredits}
                variant={hasEnoughCredits ? 'default' : 'secondary'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Processing...
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className='mr-2 h-4 w-4' />
                    Completed
                  </>
                ) : !hasEnoughCredits ? (
                  <>
                    <XCircle className='mr-2 h-4 w-4' />
                    Insufficient Credits
                  </>
                ) : (
                  <>Try {action.title}</>
                )}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
