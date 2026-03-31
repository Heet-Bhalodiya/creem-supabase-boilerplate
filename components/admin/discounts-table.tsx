'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteDiscount } from '@/lib/actions/billing'
import { useRouter } from 'next/navigation'

type LocalDiscount = {
  id: string
  code: string
  discount_percentage: number | null
  discount_amount: number | null
  max_uses: number | null
  used_count: number
  expires_at: string | null
  is_active: boolean
  creem_discount_id: string
  created_at: string
}

export function DiscountsTable({ discounts }: { discounts: LocalDiscount[] }) {
  const router = useRouter()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<LocalDiscount | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    if (!selectedDiscount?.creem_discount_id) {
      toast.error('Invalid discount ID')
      return
    }

    setIsPending(true)
    try {
      const result = await deleteDiscount(selectedDiscount.creem_discount_id)

      if (result.success) {
        toast.success('Discount deleted successfully')
        setIsDeleteOpen(false)
        setSelectedDiscount(null)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete discount')
      }
    } catch {
      toast.error('Failed to delete discount')
    } finally {
      setIsPending(false)
    }
  }

  const openDeleteDialog = (discount: LocalDiscount) => {
    setSelectedDiscount(discount)
    setIsDeleteOpen(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Min Purchase</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className='w-20'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts && discounts.length > 0 ? (
            discounts.map((discount: LocalDiscount) => (
              <TableRow key={discount.id}>
                <TableCell className='font-mono font-medium'>{discount.code}</TableCell>
                <TableCell className='capitalize'>{discount.discount_percentage ? 'percentage' : 'fixed'}</TableCell>
                <TableCell>
                  {discount.discount_percentage
                    ? `${discount.discount_percentage}%`
                    : `$${(discount.discount_amount || 0).toFixed(2)}`}
                </TableCell>
                <TableCell>
                  {discount.used_count} / {discount.max_uses || '∞'}
                </TableCell>
                <TableCell>No minimum</TableCell>
                <TableCell>
                  <Badge variant={discount.is_active ? 'default' : 'secondary'}>
                    {discount.is_active ? 'active' : 'inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {discount.expires_at ? new Date(discount.expires_at).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => openDeleteDialog(discount)}
                    title='Delete discount'
                  >
                    <Trash2 className='text-destructive h-4 w-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className='text-muted-foreground h-24 text-center'>
                <div className='flex flex-col items-center gap-2'>
                  <p className='text-lg font-medium'>No discount codes created yet</p>
                  <p className='text-sm'>Create your first discount code to offer promotions to customers</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Discount Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the discount code <strong>{selectedDiscount?.code}</strong>? This will
              delete it from both your database and Creem. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
