import { spendCredits, hasCredits } from '@/lib/actions/credits'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Example API route demonstrating how to use credits for metered AI content features
 *
 * Use this as a template for any AI content feature that consumes credits:
 * - AI Copywriting (marketing copy, emails, social posts)
 * - Image Generation (graphics, illustrations, visuals)
 * - Document Analysis (PDF extraction, summarization)
 * - Text-to-Voice (audio narration, podcasts)
 * - Any AI-powered content creation
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Parse request body
    const { action, data } = await request.json()

    // Define credit costs for different AI content actions
    const CREDIT_COSTS = {
      'ai-copywriter': 10,
      'image-generator': 15,
      'document-analyzer': 8,
      'text-to-voice': 12
    } as const

    type ActionType = keyof typeof CREDIT_COSTS
    const creditCost = CREDIT_COSTS[action as ActionType] || 1

    // 1. Check if user has enough credits BEFORE performing the action
    const creditCheck = await hasCredits(creditCost)

    if (!creditCheck.hasCredits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          balance: creditCheck.balance,
          required: creditCost,
          message: `You need ${creditCost} credits but only have ${creditCheck.balance}. Please purchase more credits or upgrade your plan.`
        },
        { status: 402 } // 402 Payment Required
      )
    }

    // 2. Perform your actual AI content generation here
    // This is where you'd call OpenAI, Replicate, ElevenLabs, etc.
    const result = await performAction(action, data)

    // 3. Deduct credits AFTER successful action
    const spendResult = await spendCredits({
      amount: creditCost,
      description: `AI Content: ${action}`,
      source: 'usage',
      referenceId: result.id, // Track which content generation consumed credits
      metadata: {
        action,
        contentType: action,
        timestamp: new Date().toISOString(),
        inputData: data
      }
    })

    if (!spendResult.success) {
      console.error('Failed to deduct credits:', spendResult.error)
      // Note: The action was successful but credit deduction failed
      // You may want to log this for manual reconciliation
    }

    // 4. Return success with credit information
    return NextResponse.json({
      success: true,
      result,
      credits: {
        spent: creditCost,
        remainingBalance: creditCheck.balance - creditCost
      }
    })
  } catch (error) {
    console.error('Action error:', error)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}

// Placeholder function - replace with your actual AI API integration
// Examples: OpenAI GPT-4, DALL-E, Replicate, ElevenLabs, etc.
async function performAction(action: string, data: unknown) {
  // Simulate AI API call or processing
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    id: `content_${Date.now()}`,
    action,
    data,
    result: 'AI content generated successfully'
  }
}
