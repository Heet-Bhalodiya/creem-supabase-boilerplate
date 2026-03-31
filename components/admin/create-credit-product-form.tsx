'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Loader2, Plus, X, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Badge } from '../ui/badge'

export function CreateCreditProductForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    credits_per_cycle: string
    price: string
    currency: string
    active: boolean
    features: string[]
    newFeature: string
    creem_product_id: string
  }>({
    name: '',
    description: '',
    credits_per_cycle: '',
    price: '',
    currency: 'usd',
    active: true,
    features: [],
    newFeature: '',
    creem_product_id: ''
  })

  const predefinedPackages = [
    { name: 'Starter Pack', credits: 100, price: 9, description: 'Perfect for getting started' },
    { name: 'Power Pack', credits: 500, price: 39, description: 'Great value package' },
    { name: 'Pro Pack', credits: 1000, price: 69, description: 'Best for power users' },
    { name: 'Enterprise Pack', credits: 5000, price: 299, description: 'Large credit package' }
  ]

  const handlePredefinedSelect = (pkg: (typeof predefinedPackages)[0]) => {
    setFormData({
      ...formData,
      name: pkg.name,
      description: pkg.description,
      credits_per_cycle: pkg.credits.toString(),
      price: pkg.price.toString()
    })
  }

  const handleAddFeature = () => {
    if (formData.newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, formData.newFeature.trim()],
        newFeature: ''
      })
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.credits_per_cycle || !formData.price || !formData.creem_product_id) {
      toast.error('Please fill in all required fields including Creem Product ID')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/credits/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          credits_per_cycle: parseInt(formData.credits_per_cycle),
          price: Math.round(parseFloat(formData.price) * 100),
          currency: formData.currency,
          payment_type: 'one-time',
          grants_credits: true,
          active: formData.active,
          features: formData.features,
          creem_product_id: formData.creem_product_id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create credit product')
      }

      toast.success(`Successfully created credit product: ${formData.name}`)

      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        credits_per_cycle: '',
        price: '',
        currency: 'usd',
        active: true,
        features: [],
        newFeature: '',
        creem_product_id: ''
      })
      setOpen(false)

      router.refresh()
    } catch (error) {
      console.error('Credit product creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create credit product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] min-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Create New Credit Product
          </DialogTitle>
          <DialogDescription>Create a one-time credit package that users can purchase</DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Quick Templates */}
          <div className='space-y-4'>
            <h4 className='font-semibold'>Quick Templates</h4>
            <div className='grid gap-3 md:grid-cols-4'>
              {predefinedPackages.map((pkg, index) => (
                <Card
                  key={index}
                  className='hover:bg-accent cursor-pointer transition-colors'
                  onClick={() => handlePredefinedSelect(pkg)}
                >
                  <CardContent className='p-4'>
                    <div className='mb-2 flex items-start justify-between'>
                      <h5 className='font-semibold'>{pkg.name}</h5>
                      <Badge variant='outline'>${pkg.price}</Badge>
                    </div>
                    <p className='text-muted-foreground mb-2 text-sm'>{pkg.description}</p>
                    <Badge variant='secondary'>{pkg.credits.toLocaleString()} credits</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Create Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Information */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Product Name *</Label>
                <Input
                  id='name'
                  placeholder='e.g., Starter Pack'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='price'>Price *</Label>
                <div className='relative'>
                  <Input
                    id='price'
                    type='number'
                    step='0.01'
                    min='0.01'
                    placeholder='9.00'
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className='pl-8'
                    required
                  />
                  <span className='text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform text-sm'>
                    $
                  </span>
                </div>
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='credits'>Credits Included *</Label>
                <Input
                  id='credits'
                  type='number'
                  min='1'
                  max='100000'
                  placeholder='100'
                  value={formData.credits_per_cycle}
                  onChange={e => setFormData({ ...formData, credits_per_cycle: e.target.value })}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='currency'>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={value => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='usd'>USD ($)</SelectItem>
                    <SelectItem value='eur'>EUR (€)</SelectItem>
                    <SelectItem value='gbp'>GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder='Describe what this credit package offers...'
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Creem Product ID */}
            <div className='space-y-2'>
              <Label htmlFor='creem_product_id'>Creem Product ID *</Label>
              <Input
                id='creem_product_id'
                placeholder='prod_xxxxxxxxxxxxx'
                value={formData.creem_product_id}
                onChange={e => setFormData({ ...formData, creem_product_id: e.target.value })}
                required
              />
              <p className='text-muted-foreground text-sm'>
                Enter the Creem product ID to enable payment processing. Get this from your Creem dashboard.
              </p>
            </div>

            {/* Features */}
            <div className='space-y-4'>
              <Label>Package Features (Optional)</Label>

              {/* Feature Input */}
              <div className='flex gap-2'>
                <Input
                  placeholder='Add a feature description...'
                  value={formData.newFeature}
                  onChange={e => setFormData({ ...formData, newFeature: e.target.value })}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <Button type='button' onClick={handleAddFeature} size='sm' variant='outline'>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>

              {/* Features List */}
              {formData.features.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {formData.features.map((feature, index) => (
                    <Badge key={index} variant='secondary' className='gap-1'>
                      {feature}
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveFeature(index)}
                        className='ml-1 h-auto p-0 hover:bg-transparent'
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Preview */}
            {(formData.credits_per_cycle || formData.price) && (
              <Card className='bg-muted/50'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg'>Pricing Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span>Credits per purchase:</span>
                      <span className='font-medium'>{formData.credits_per_cycle || '0'} credits</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Price per credit:</span>
                      <span className='font-medium'>
                        $
                        {formData.credits_per_cycle && formData.price
                          ? (parseFloat(formData.price) / parseInt(formData.credits_per_cycle)).toFixed(4)
                          : '0.0000'}
                      </span>
                    </div>
                    <div className='flex justify-between border-t pt-2 font-bold'>
                      <span>Total price:</span>
                      <span>${parseFloat(formData.price || '0').toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className='flex justify-end gap-3 pt-6'>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Create Product
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
