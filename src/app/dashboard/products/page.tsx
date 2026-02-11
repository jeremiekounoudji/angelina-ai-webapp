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
import { ProductModal } from './components/ProductModal'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { company } = useAuth()
  const { products, loading, deleteProduct } = useProducts()
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
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="success" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-gray-600">
            {t('subtitle')}
            {limits && (
              <span className="ml-2 text-sm">
                ({limits.current_products}/{limits.max_products} products)
              </span>
            )}
          </p>
        </div>
        <Button
          className="bg-[#328E6E] text-white hover:bg-[#15803d]"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={addModal.onOpen}
          isDisabled={Boolean(limits && !limits.can_add_products)}
        >
          {t('actions.addProduct')}
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardBody className="text-center py-12">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('empty.title')}</h3>
            <p className="text-gray-600 mb-4">
              {t('empty.description')}
            </p>
            <Button
              className="bg-[#328E6E] text-white hover:bg-[#15803d]"
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
              <Card key={product.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="p-0">
                  {/* Product Image */}
                  <div className="relative bg-gray-100">
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
                        <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                     <div className="absolute top-2 right-2 flex space-x-1 z-50">
                      <Button
                        isIconOnly
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm hover:bg-white"
                        onPress={() => handleEditProduct(product)}
                      >
                        <PencilIcon className="w-4 h-4 text-gray-700" />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm hover:bg-white"
                        onPress={() => handleDeleteProduct(product.id)}
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                   
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate flex-1">
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
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('info.price')}</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(product)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('info.stock')}</span>
                        <span className="font-medium text-gray-900">
                          {product.stock_quantity} {t('info.units')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{t('info.added')}</span>
                        <span className="text-sm text-gray-900">
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

      <ProductModal
        isOpen={addModal.isOpen || editModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            addModal.onClose();
            editModal.onClose();
            setSelectedProduct(null);
          }
        }}
        product={selectedProduct}
        onSuccess={() => {
          addModal.onClose();
          editModal.onClose();
          setSelectedProduct(null);
        }}
      />

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