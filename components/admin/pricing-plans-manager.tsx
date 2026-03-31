'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Plus } from 'lucide-react'
import { createPricingPlan, updatePricingPlan, deletePricingPlan } from '@/lib/actions/billing'
import { toast } from '@/lib/toast'
import type { PricingPlan } from '@/lib/actions/billing'
import { createPricingPlanColumns } from './pricing-plan-columns'

type PricingPlansManagerProps = {
  plans: PricingPlan[]
}

export function PricingPlansManager({ plans: initialPlans }: PricingPlansManagerProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '0',
    currency: 'usd',
    payment_type: 'subscription' as 'subscription' | 'one_time',
    interval: 'month',
    features: '',
    is_active: true,
    creem_product_id: '',
    sort_order: '0'
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '0',
      currency: 'usd',
      payment_type: 'subscription',
      interval: 'month',
      features: '',
      is_active: true,
      creem_product_id: '',
      sort_order: '0'
    })
  }

  const handleCreate = () => {
    setEditingPlan(null)
    resetForm()
    setIsCreateOpen(true)
  }

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: (plan.price / 100).toString(), // Convert cents to dollars for display
      currency: plan.currency,
      payment_type: (plan.payment_type as 'subscription' | 'one_time') || 'subscription',
      interval: plan.interval,
      features: ((plan.features as string[]) || []).join('\n'),
      is_active: plan.is_active ?? false,
      creem_product_id: plan.creem_product_id || '',
      sort_order: plan.sort_order?.toString() || '0'
    })
    setIsCreateOpen(true)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const planData = {
        name: formData.name,
        description: formData.description || null,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        currency: formData.currency,
        payment_type: formData.payment_type,
        interval:
          formData.payment_type === 'one_time'
            ? ('one_time' as const)
            : ((formData.interval === 'year' ? 'year' : 'month') as 'month' | 'year'),
        features: formData.features.split('\n').filter(f => f.trim()),
        is_active: formData.is_active,
        creem_product_id: formData.creem_product_id || null,
        sort_order: parseInt(formData.sort_order)
      }

      if (editingPlan) {
        await updatePricingPlan(editingPlan.id, planData)
        toast('success', 'Pricing plan has been updated successfully')
      } else {
        await createPricingPlan(planData)
        toast('success', 'New pricing plan has been created successfully')
      }

      setIsCreateOpen(false)
      resetForm()
      // Refresh plans
      window.location.reload()
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to save plan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsLoading(true)
    try {
      await deletePricingPlan(deleteId)
      setPlans(plans.filter(p => p.id !== deleteId))
      toast('success', 'Pricing plan has been deleted successfully')
      setDeleteId(null)
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Failed to delete plan')
    } finally {
      setIsLoading(false)
    }
  }

  const columns = createPricingPlanColumns(handleEdit, setDeleteId)

  return (
    <>
      <div className='mb-4 flex justify-end'>
        <Button onClick={handleCreate}>
          <Plus className='mr-2 h-4 w-4' />
          Add Plan
        </Button>
      </div>

      <DataTable columns={columns} data={plans} searchKey='name' searchPlaceholder='Search plans...' />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit' : 'Create'} Pricing Plan</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update' : 'Add a new'} pricing plan for your application
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Plan Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder='Pro Plan'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder='Perfect for growing businesses'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='price'>Price</Label>
                <Input
                  id='price'
                  type='number'
                  step='0.01'
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='currency'>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={value => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='usd'>USD</SelectItem>
                    <SelectItem value='eur'>EUR</SelectItem>
                    <SelectItem value='gbp'>GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='bg-muted/50 grid gap-3 rounded-lg border p-4'>
              <div>
                <Label className='text-base'>Payment Type</Label>
                <p className='text-muted-foreground text-xs'>Choose how customers will be charged</p>
              </div>
              <Tabs
                value={formData.payment_type}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    payment_type: value as 'subscription' | 'one_time',
                    interval: value === 'one_time' ? 'one_time' : 'month'
                  })
                }
                className='w-full'
              >
                <TabsList className='grid h-auto w-full grid-cols-2 p-1'>
                  <TabsTrigger value='one_time' className='py-2 text-sm'>
                    Single Payment
                  </TabsTrigger>
                  <TabsTrigger value='subscription' className='py-2 text-sm'>
                    Subscription
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className='grid gap-4 rounded-md border p-4'>
              <div>
                <h4 className='text-sm font-semibold'>Payment Details</h4>
                <p className='text-muted-foreground text-xs'>Configure how this Creem product will be charged.</p>
              </div>

              {formData.payment_type === 'subscription' ? (
                <div className='grid gap-2'>
                  <Label htmlFor='interval'>Billing Interval</Label>
                  <Select
                    value={formData.interval}
                    onValueChange={value => setFormData({ ...formData, interval: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='month'>Monthly</SelectItem>
                      <SelectItem value='year'>Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className='rounded-md border border-dashed p-3 text-sm'>
                  <p className='font-medium'>One-time Purchase</p>
                  <p className='text-muted-foreground text-xs'>
                    Customers are charged once at checkout with no recurring billing cycle.
                  </p>
                </div>
              )}

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='creem_product_id'>Creem Product ID</Label>
                  <Input
                    id='creem_product_id'
                    value={formData.creem_product_id}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        creem_product_id: e.target.value
                      })
                    }
                    placeholder='prod_xxxxxxxxxxxxx'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='sort_order'>Sort Order</Label>
                  <Input
                    id='sort_order'
                    type='number'
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='features'>Features (one per line)</Label>
              <Textarea
                id='features'
                value={formData.features}
                onChange={e => setFormData({ ...formData, features: e.target.value })}
                placeholder='Unlimited projects&#10;Priority support&#10;Advanced analytics'
                rows={5}
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='is_active'
                checked={formData.is_active}
                onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor='is_active'>Active (display on pricing page)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
              {isLoading ? 'Saving...' : editingPlan ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pricing plan? Users with active subscriptions to this plan will not
              be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
