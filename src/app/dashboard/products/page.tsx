'use client'

import { useState } from 'react'
import {
  Card,
  CardBody,
  Button,
  Chip,
  useDisclosure,
  Spinner,
  Image
} from '@heroui/react'
import { PlusIcon, PencilIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Product } from '@/types/database'
import { useProducts } from '@/hooks/useProducts'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { AddProductModal } from './components/AddProductModal'
import { EditProductModal } from './components/EditProductModal'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { company } = useAuth()
  const { products, loading, deleteProduct, refetch } = useProducts()
  const { limits } = usePlanLimits(company?.id)
  const { t } = useTranslationNamespace('dashboard.products')

  const addModal = useDisclosure()
  const editModal = useDisclosure()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    editModal.onOpen()
  }

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete)
      setProductToDelete(null)
    }
    setShowDeleteConfirm(false)
  }

  const formatPrice = (product: Product) => {
    if (product.is_price_fixed) {
      return `$${product.price?.toFixed(2) || '0.00'}`
    } else {
      return `$${product.min_price?.toFixed(2) || '0.00'} - $${product.max_price?.toFixed(2) || '0.00'}`
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: 'danger' as const, text: t('status.outOfStock') }
    if (quantity < 10) return { color: 'warning' as const, text: t('status.lowStock') }
    return { color: 'success' as const, text: t('status.inStock') }
  }

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
          <p className="text-gray-50">
            {t('subtitle')}
            {limits && (
              <span className="ml-2 text-sm">
                ({limits.current_products}/{limits.max_products} products)
              </span>
            )}
          </p>
        </div>
        <Button
          className="bg-background border border-secondary text-white hover:bg-secondary shadow-lg shadow-secondary/20"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={addModal.onOpen}
          isDisabled={Boolean(limits && !limits.can_add_products)}
        >
          {t('actions.addProduct')}
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="bg-background border border-secondary shadow-lg shadow-secondary/20">
          <CardBody className="text-center py-12">
            <ShoppingBagIcon className="w-12 h-12 text-gray-50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">{t('empty.title')}</h3>
            <p className="text-gray-50 mb-4">
              {t('empty.description')}
            </p>
            <Button
              className="bg-primary text-white hover:bg-primary/80 shadow-lg shadow-secondary/20"
              startContent={<PlusIcon className="w-4 h-4" />}
              onPress={addModal.onOpen}
              isDisabled={Boolean(limits && !limits.can_add_products)}
            >
              {t('actions.addProduct')}
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show upgrade prompt if limit reached */}
          {limits && !limits.can_add_products && (
            <div className="md:col-span-2 lg:col-span-3">
              <UpgradePrompt
                title="Product Limit Reached"
                description={`You've reached the maximum of ${limits.max_products} products for your current plan. Upgrade to add more products and grow your catalog.`}
                currentLimit={limits.max_products}
                limitType="products"
              />
            </div>
          )}
          
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock_quantity)
            
            return (
              <Card key={product.id} className="bg-background border border-secondary shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-shadow">
                <CardBody className="p-0">
                  {/* Product Image */}
                  <div className="relative bg-secondary">
                    {product.image_url ? (
                      <Image
                      width={400}
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-[200px] object-cover"
                        radius="none"
                      />
                    ) : (
                      <div className="w-full h-[200px] flex items-center justify-center">
                        <ShoppingBagIcon className="w-12 h-12 text-gray-50" />
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                     <div className="absolute top-2 right-2 flex space-x-1 z-50">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="solid"
                        color="warning"
                        className="backdrop-blur-sm"
                        onPress={() => handleEditProduct(product)}
                      >
                        <PencilIcon 
                        color='warning'
                        className="w-4 h-4" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="solid"
                        color="danger"
                        className="backdrop-blur-sm"
                        onPress={() => handleDeleteProduct(product.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                   
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white truncate flex-1">
                        {product.name}
                      </h3>
                      <Chip
                        size="sm"
                        color={stockStatus.color}
                        variant="flat"
                        className="ml-2"
                      >
                        {stockStatus.text}
                      </Chip>
                    </div>

                    {product.description && (
                      <p className="text-sm text-gray-50 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-50">{t('info.price')}</span>
                        <span className="font-medium text-white">
                          {formatPrice(product)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-50">{t('info.stock')}</span>
                        <span className="font-medium text-white">
                          {product.stock_quantity} {t('info.units')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-50">{t('info.added')}</span>
                        <span className="text-sm text-white">
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      <AddProductModal
        isOpen={addModal.isOpen}
        onOpenChange={addModal.onOpenChange}
        onProductAdded={() => {
          // The hook handles state updates automatically, but we can trigger a refetch if needed
          // refetch();
        }}
      />

      {selectedProduct && (
        <EditProductModal
          isOpen={editModal.isOpen}
          onOpenChange={editModal.onOpenChange}
          product={selectedProduct}
          onProductUpdated={() => {
            // The hook handles state updates automatically, but we can trigger a refetch if needed
            // refetch();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteProduct}
        title={t('actions.deleteProduct')}
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}