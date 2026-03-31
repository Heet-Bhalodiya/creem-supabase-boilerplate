'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ManualCreditGrant() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    userEmail: '',
    amount: '',
    type: 'earned',
    description: '',
    source: 'bonus'
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.userEmail || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/credits/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: formData.userEmail,
          amount: parseInt(formData.amount),
          type: formData.type,
          description: formData.description,
          source: formData.source
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to grant credits')
      }

      toast.success(`Successfully granted ${formData.amount} credits to ${formData.userEmail}`)
      setIsOpen(false)
      setFormData({
        userEmail: '',
        amount: '',
        type: 'earned',
        description: '',
        source: 'bonus'
      })
      router.refresh()
    } catch (error) {
      console.error('Credit grant error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to grant credits')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Grant Credits
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Grant Credits to User</DialogTitle>
            <DialogDescription>Manually add credits to a user&apos;s wallet with a custom reason</DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='email'>User Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='user@example.com'
                value={formData.userEmail}
                onChange={e => setFormData({ ...formData, userEmail: e.target.value })}
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='amount'>Credit Amount</Label>
              <Input
                id='amount'
                type='number'
                min='1'
                max='100000'
                placeholder='100'
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='type'>Transaction Type</Label>
              <Select value={formData.type} onValueChange={value => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='earned'>Earned (Add Credits)</SelectItem>
                  <SelectItem value='refunded'>Refunded (Add Credits)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Reason/Description</Label>
              <Textarea
                id='description'
                placeholder='Manual credit grant for...'
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='source'>Source</Label>
              <Select value={formData.source} onValueChange={value => setFormData({ ...formData, source: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='bonus'>Bonus Credits</SelectItem>
                  <SelectItem value='refund'>Refund</SelectItem>
                  <SelectItem value='purchase'>Purchase</SelectItem>
                  <SelectItem value='subscription'>Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Grant Credits
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
