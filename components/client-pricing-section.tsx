'use client'
import { getActivePricingPlans, type PricingPlan } from '@/lib/actions/billing'
import { PricingPlans } from '@/components/pricing-plans'
import { useEffect, useState } from 'react'

export function ClientPricingSection() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const activePlans = await getActivePricingPlans()
        setPlans(activePlans)
      } catch (err) {
        console.error('Failed to fetch pricing plans:', err)
        setError('Failed to load pricing plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  if (loading) {
    return (
      <section className='bg-muted/50 w-full py-12 md:py-24 lg:py-32'>
        <div className='container mx-auto max-w-7xl px-4 md:px-6'>
          <div className='mb-12 flex flex-col items-center justify-center space-y-4 text-center'>
            <div className='space-y-2'>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>Choose Your Content Plan</h2>
              <p className='text-muted-foreground max-w-3xl text-lg'>
                From solo creators to enterprise teams, we have the perfect plan for your content needs. Start creating
                amazing AI-powered content today!
              </p>
            </div>
          </div>
          <div className='mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='bg-card animate-pulse rounded-xl border p-8'>
                <div className='bg-muted mb-4 h-4 w-24 rounded'></div>
                <div className='bg-muted mb-6 h-12 w-20 rounded'></div>
                <div className='space-y-3'>
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className='bg-muted h-3 rounded'></div>
                  ))}
                </div>
                <div className='bg-muted mt-6 h-10 w-full rounded'></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id='pricing' className='bg-muted/50 w-full py-12 md:py-24 lg:py-32'>
        <div className='container px-4 md:px-6'>
          <div className='text-center'>
            <p className='text-red-500'>Failed to load pricing plans. Please try again later.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='bg-muted/50 w-full py-12 md:py-24 lg:py-32'>
      <div className='container mx-auto max-w-7xl px-4 md:px-6'>
        <div className='mb-12 flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold tracking-tighter sm:text-5xl'>Choose Your Content Plan</h2>
            <p className='text-muted-foreground max-w-3xl text-lg'>
              From solo creators to enterprise teams, we have the perfect plan for your content needs. Start creating
              amazing AI-powered content today!
            </p>
          </div>
        </div>
        <PricingPlans plans={plans} />
      </div>
    </section>
  )
}
