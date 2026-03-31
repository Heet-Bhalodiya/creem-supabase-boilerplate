'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DollarSign, Coins, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { EditCreditProductDialog } from './edit-credit-product-dialog'

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

type CreditProductsTableProps = {
  products?: CreditProduct[]
  isLoading?: boolean
}

export function CreditProductsTable({ products: initialProducts, isLoading = false }: CreditProductsTableProps) {
  const [products, setProducts] = useState<CreditProduct[]>(initialProducts || [])
  const [loading, setLoading] = useState(isLoading)
  const [editingProduct, setEditingProduct] = useState<CreditProduct | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Fetch products if not provided via props
  useEffect(() => {
    if (!initialProducts && !isLoading) {
      fetchProducts()
    }
  }, [initialProducts, isLoading])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/credits/products')
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load credit products')
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: string, is_active: boolean) => {
    try {
      const response = await fetch(`/api/admin/credits/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active })
      })

      if (!response.ok) throw new Error('Failed to update product')

      // Update local state
      setProducts(products.map(product => (product.id === productId ? { ...product, is_active } : product)))

      toast.success(`Product ${is_active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Failed to toggle product:', error)
      toast.error('Failed to update product status')
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this credit product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/credits/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete product')

      // Update local state
      setProducts(products.filter(product => product.id !== productId))
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Failed to delete product')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatPrice = (price: number, currency: string) => {
    const symbols: Record<string, string> = {
      usd: '$',
      eur: '€',
      gbp: '£'
    }
    return `${symbols[currency] || '$'}${(price / 100).toFixed(2)}` // Convert cents to dollars
  }

  const getPricePerCredit = (price: number, credits: number) => {
    return (price / 100 / credits).toFixed(4) // Convert cents to dollars before calculating
  }

  if (loading) {
    return (
      <div className='space-y-2'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='h-16 animate-pulse rounded bg-gray-200'></div>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Stats */}
      <div className='grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3'>
        <div>
          <span className='font-medium'>Total Products:</span> {products.length}
        </div>
        <div>
          <span className='font-medium'>Active Products:</span> {products.filter(p => p.is_active).length}
        </div>
        <div>
          <span className='font-medium'>Total Credits Available:</span>{' '}
          {products
            .filter(p => p.is_active)
            .reduce((sum, p) => sum + p.credits_per_cycle, 0)
            .toLocaleString()}
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Price/Credit</TableHead>
              <TableHead>Creem ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='h-24 text-center text-gray-500'>
                  <div>
                    <Coins className='mx-auto mb-2 h-8 w-8 opacity-50' />
                    No credit products found. Create your first credit package.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className='space-y-1'>
                      <div className='font-medium'>{product.name}</div>
                      {product.description && (
                        <div className='max-w-xs truncate text-sm text-gray-500'>{product.description}</div>
                      )}
                      {product.features && product.features.length > 0 && (
                        <div className='mt-1 flex flex-wrap gap-1'>
                          {product.features.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant='secondary' className='text-xs'>
                              {feature}
                            </Badge>
                          ))}
                          {product.features.length > 2 && (
                            <Badge variant='secondary' className='text-xs'>
                              +{product.features.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex items-center text-sm'>
                      <Coins className='mr-2 h-4 w-4 text-yellow-500' />
                      <span className='font-medium'>{product.credits_per_cycle.toLocaleString()}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex items-center text-sm font-medium'>
                      <DollarSign className='mr-1 h-4 w-4 text-green-500' />
                      {formatPrice(product.price, product.currency)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='text-sm text-gray-500'>
                      ${getPricePerCredit(product.price, product.credits_per_cycle)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='font-mono text-sm'>
                      {product.creem_product_id ? (
                        <span className='text-green-600'>{product.creem_product_id}</span>
                      ) : (
                        <span className='text-red-500'>Missing</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className='flex items-center space-x-2'>
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={checked => toggleProductStatus(product.id, checked)}
                      />
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className='text-sm text-gray-500'>{formatDate(product.created_at)}</TableCell>

                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setEditingProduct(product)
                          setIsEditDialogOpen(true)
                        }}
                        title='Edit product'
                      >
                        <Edit className='h-3 w-3' />
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => deleteProduct(product.id)}
                        className='text-red-600 hover:text-red-700'
                        title='Delete product'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {products.length > 0 && (
        <div className='pt-4 text-center'>
          <p className='text-sm text-gray-500'>
            Showing {products.length} credit product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <EditCreditProductDialog
          product={editingProduct}
          open={isEditDialogOpen}
          onOpenChange={open => {
            setIsEditDialogOpen(open)
            if (!open) {
              setEditingProduct(null)
              fetchProducts() // Refresh the list
            }
          }}
        />
      )}
    </div>
  )
}
