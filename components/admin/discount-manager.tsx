'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { createDiscount } from '@/lib/actions/billing'
import { toast } from '@/lib/toast'

type DiscountProduct = {
  id: string
  name: string
  creem_product_id: string | null
}

export function DiscountManager({ products }: { products: DiscountProduct[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    duration: 'once' as 'forever' | 'once' | 'repeating',
    durationMonths: '',
    maxRedemptions: '',
    expiryDate: '',
    productIds: [] as string[]
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate product selection
      if (formData.productIds.length === 0) {
        toast('error', 'Please select at least one product')
        setLoading(false)
        return
      }

      const params = {
        name: formData.name,
        code: formData.code || undefined,
        type: formData.type,
        percentage: formData.type === 'percentage' ? parseFloat(formData.value) : undefined,
        amount: formData.type === 'fixed' ? parseFloat(formData.value) * 100 : undefined,
        currency: formData.type === 'fixed' ? 'USD' : undefined,
        duration: formData.duration,
        duration_in_months: formData.duration === 'repeating' ? parseInt(formData.durationMonths) : undefined,
        max_redemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : undefined,
        expiry_date: formData.expiryDate || undefined,
        applies_to_products: formData.productIds
      }

      const result = await createDiscount(params)

      if (result.success) {
        toast('success', 'Discount code created successfully')
        setOpen(false)
        setFormData({
          name: '',
          code: '',
          type: 'percentage',
          value: '',
          duration: 'once',
          durationMonths: '',
          maxRedemptions: '',
          expiryDate: '',
          productIds: []
        })
        // Refresh the page to show new discount
        window.location.reload()
      } else {
        toast('error', result.error || 'Failed to create discount')
      }
    } catch (error) {
      toast('error', 'Failed to create discount')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const productOptions = products.filter(p => p.creem_product_id)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className='mr-2 h-4 w-4' />
        Create Discount
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Create Discount Code</DialogTitle>
            <DialogDescription>Create a new promotional discount code for your products</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Display Name *</Label>
                <Input
                  id='name'
                  placeholder='Holiday Sale 2024'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='code'>Discount Code</Label>
                <Input
                  id='code'
                  placeholder='HOLIDAY2024 (auto-generated if empty)'
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='type'>Discount Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='percentage'>Percentage</SelectItem>
                    <SelectItem value='fixed'>Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='value'>{formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *</Label>
                <Input
                  id='value'
                  type='number'
                  placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  min='0'
                  max={formData.type === 'percentage' ? '100' : undefined}
                  required
                />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='duration'>Duration *</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value: 'forever' | 'once' | 'repeating') =>
                    setFormData({ ...formData, duration: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='once'>Once</SelectItem>
                    <SelectItem value='forever'>Forever</SelectItem>
                    <SelectItem value='repeating'>Repeating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.duration === 'repeating' && (
                <div className='space-y-2'>
                  <Label htmlFor='durationMonths'>Duration (Months) *</Label>
                  <Input
                    id='durationMonths'
                    type='number'
                    placeholder='6'
                    value={formData.durationMonths}
                    onChange={e => setFormData({ ...formData, durationMonths: e.target.value })}
                    min='1'
                    required={formData.duration === 'repeating'}
                  />
                </div>
              )}
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='maxRedemptions'>Max Redemptions</Label>
                <Input
                  id='maxRedemptions'
                  type='number'
                  placeholder='100 (leave empty for unlimited)'
                  value={formData.maxRedemptions}
                  onChange={e => setFormData({ ...formData, maxRedemptions: e.target.value })}
                  min='1'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='expiryDate'>Expiry Date</Label>
                <Input
                  id='expiryDate'
                  type='datetime-local'
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='products'>Applies to Products *</Label>
              <Select
                value={formData.productIds[0] || ''}
                onValueChange={value => setFormData({ ...formData, productIds: [value] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a product' />
                </SelectTrigger>
                <SelectContent>
                  {productOptions.map(product => (
                    <SelectItem key={product.id} value={product.creem_product_id!}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-xs'>Select which product this discount applies to</p>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? 'Creating...' : 'Create Discount'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
