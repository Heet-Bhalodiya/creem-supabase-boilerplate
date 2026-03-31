'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, X, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type CreditProduct = {
  id: string
  name: string
  description: string | null
  credits_per_cycle: number
  price: number
  currency: string
  payment_type: string
  grants_credits: boolean
  is_active: boolean
  features: string[] | null
  creem_product_id: string | null
  created_at: string
  updated_at: string
}

type EditCreditProductDialogProps = {
  product: CreditProduct
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCreditProductDialog({ product, open, onOpenChange }: EditCreditProductDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    credits_per_cycle: product.credits_per_cycle.toString(),
    price: (product.price / 100).toString(),
    currency: product.currency,
    is_active: product.is_active,
    features: product.features || [],
    creem_product_id: product.creem_product_id || '',
    newFeature: ''
  })

  // Update form data when product changes
  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description || '',
      credits_per_cycle: product.credits_per_cycle.toString(),
      price: (product.price / 100).toString(),
      currency: product.currency,
      is_active: product.is_active,
      features: product.features || [],
      creem_product_id: product.creem_product_id || '',
      newFeature: ''
    })
  }, [product])

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
      const response = await fetch(`/api/admin/credits/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          credits_per_cycle: parseInt(formData.credits_per_cycle),
          price: Math.round(parseFloat(formData.price) * 100),
          currency: formData.currency,
          is_active: formData.is_active,
          features: formData.features,
          creem_product_id: formData.creem_product_id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update credit product')
      }

      toast.success('Credit product updated successfully')
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Credit product update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update credit product')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Edit Credit Product
          </DialogTitle>
          <DialogDescription>Update the credit package details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 py-4'>
          {/* Basic Information */}
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='edit-name'>Product Name *</Label>
              <Input
                id='edit-name'
                placeholder='e.g., Starter Pack'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-price'>Price *</Label>
              <div className='relative'>
                <Input
                  id='edit-price'
                  type='number'
                  step='1'
                  min='1'
                  placeholder='9.00'
                  value={Number(formData.price).toFixed(4)}
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
              <Label htmlFor='edit-credits'>Credits Included *</Label>
              <Input
                id='edit-credits'
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
              <Label htmlFor='edit-currency'>Currency</Label>
              <Select value={formData.currency} onValueChange={value => setFormData({ ...formData, currency: value })}>
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
            <Label htmlFor='edit-description'>Description</Label>
            <Textarea
              id='edit-description'
              placeholder='Describe what this credit package offers...'
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Creem Product ID */}
          <div className='space-y-2'>
            <Label htmlFor='edit-creem_product_id'>Creem Product ID *</Label>
            <Input
              id='edit-creem_product_id'
              placeholder='prod_xxxxxxxxxxxxx'
              value={formData.creem_product_id}
              onChange={e => setFormData({ ...formData, creem_product_id: e.target.value })}
              required
            />
            <p className='text-muted-foreground text-sm'>
              Enter the Creem product ID to enable payment processing. Get this from your Creem dashboard.
            </p>
          </div>

          {/* Active Status */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='space-y-0.5'>
              <Label htmlFor='edit-active'>Product Status</Label>
              <p className='text-muted-foreground text-sm'>
                {formData.is_active ? 'Active - Visible to users' : 'Inactive - Hidden from users'}
              </p>
            </div>
            <Switch
              id='edit-active'
              checked={formData.is_active}
              onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
            />
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
                    <span>${Number(formData.price || '0.00').toFixed(4)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-6'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Update Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
