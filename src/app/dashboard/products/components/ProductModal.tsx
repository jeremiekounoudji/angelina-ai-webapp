"use client";

import { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Textarea,
  Switch,
  Progress,
  Image,
  Card,
  CardBody,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useUpload } from "@/hooks/useUpload";
import { useProducts } from "@/hooks/useProducts";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useAuth } from "@/contexts/AuthContext";
import {
  CameraIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { TranslationFunction } from "@/locales";
import { Product } from "@/types/database";

const createProductSchema = (t: TranslationFunction) => z.object({
  name: z.string().min(1, t('form.nameRequired')),
  description: z.string().optional(),
  is_price_fixed: z.boolean(),
  price: z.number().min(0).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  stock_quantity: z.number().min(0, t('form.stockRequired')),
});

type ProductFormData = {
  name: string;
  description?: string;
  is_price_fixed: boolean;
  price?: number;
  min_price?: number;
  max_price?: number;
  stock_quantity: number;
};

interface ProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess?: () => void;
}

export function ProductModal({
  isOpen,
  onOpenChange,
  product,
  onSuccess,
}: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload();
  const { createProduct, editProduct } = useProducts();
  const { company } = useAuth();
  const { limits, canAddProduct } = usePlanLimits(company?.id);
  const { t } = useTranslationNamespace('dashboard.products');
  const { t: tCommon } = useTranslationNamespace('common');

  const isEditMode = !!product;
  const productSchema = createProductSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      is_price_fixed: product?.is_price_fixed ?? true,
      price: product?.price || 0,
      min_price: product?.min_price || 0,
      max_price: product?.max_price || 0,
      stock_quantity: product?.stock_quantity || 0,
    },
  });

  const isPriceFixed = watch("is_price_fixed");

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        is_price_fixed: product.is_price_fixed,
        price: product.price || 0,
        min_price: product.min_price || 0,
        max_price: product.max_price || 0,
        stock_quantity: product.stock_quantity,
      });
      setImageUrl(product.image_url || "");
    } else {
      reset({
        name: "",
        description: "",
        is_price_fixed: true,
        price: 0,
        min_price: 0,
        max_price: 0,
        stock_quantity: 0,
      });
      setImageUrl("");
    }
    setImageFile(null);
    setError("");
  }, [product, reset]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
  };

  const removeImage = () => {
    if (imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl("");
    setImageFile(null);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      setError("");

      // Check if product can be added (only for new products)
      if (!isEditMode) {
        const canAdd = await canAddProduct();
        if (!canAdd) {
          toast.error(
            "You have reached the maximum number of products for your current plan. Please upgrade to add more products."
          );
          return;
        }
      }

      let finalImageUrl = product?.image_url || "";

      // Upload image if selected
      if (imageFile) {
        const result = await upload({
          bucket: "products",
          files: [imageFile],
          path: "product-images"
        });

        if (result.success && result.urls.length > 0) {
          finalImageUrl = result.urls[0];
        }
      } else if (!imageUrl && product?.image_url) {
        // Image was removed
        finalImageUrl = "";
      }

      const productData = {
        ...data,
        image_url: finalImageUrl || undefined,
      };

      if (isEditMode && product) {
        await editProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      // Clean up preview URL
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }

      onSuccess?.();
      onOpenChange(false);
      reset();
      setImageUrl("");
      setImageFile(null);
    } catch (error) {
      console.error("Error saving product:", error);
      setError(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isDirty) {
      onOpenChange(false);
      return;
    }
    setShowConfirmClose(true);
  };

  const confirmClose = () => {
    reset();
    setImageUrl(product?.image_url || "");
    setImageFile(null);
    setError("");
    if (imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    setShowConfirmClose(false);
    onOpenChange(false);
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
      scrollBehavior="inside"
      onClose={handleClose}
      classNames={{
        body: "py-6 max-h-[60vh]",
        backdrop: "bg-black/50",
        base: "border-0 bg-white max-w-[450px]",
        header: "border-b border-gray-200",
        footer: "border-t border-gray-200 bg-white",
      }}
    >
      <ModalContent>
        {() => (
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader className="text-gray-900">
              {isEditMode ? t('form.editTitle') : t('form.addTitle')}
            </ModalHeader>
            <ModalBody className="gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Plan Limit Warning */}
              {!isEditMode && limits && !limits.can_add_products && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-orange-800 font-medium mb-1">
                      Product Limit Reached
                    </p>
                    <p className="text-orange-700">
                      You have reached the maximum of {limits.max_products} products for your current plan.
                    </p>
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="flex flex-col items-center gap-4">
                {imageUrl ? (
                  <Card className="relative max-w-xs">
                    <CardBody className="p-0">
                      <Image
                        src={imageUrl}
                        alt="Product"
                        className="w-full aspect-square object-cover"
                        radius="sm"
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        className="absolute top-1 right-1 bg-white/90"
                        onPress={removeImage}
                      >
                        <XMarkIcon className="w-4 h-4 text-red-600" />
                      </Button>
                    </CardBody>
                  </Card>
                ) : (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CameraIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      className="absolute -bottom-1 -right-1 bg-[#328E6E] text-white hover:bg-[#15803d]"
                      onPress={() => fileInputRef.current?.click()}
                      isDisabled={uploading}
                    >
                      <CameraIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {uploading && (
                  <Progress
                    isIndeterminate
                    className="w-32"
                    size="sm"
                    color="success"
                  />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Product Name */}
              <Input
                label={t('form.name')}
                placeholder={t('form.namePlaceholder')}
                {...register("name")}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700",
                  inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                }}
              />

              {/* Description */}
              <Textarea
                label={t('form.description')}
                placeholder={t('form.descriptionPlaceholder')}
                {...register("description")}
                isInvalid={!!errors.description}
                errorMessage={errors.description?.message}
                minRows={3}
                variant="bordered"
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700",
                  inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                }}
              />

              {/* Stock Quantity */}
              <Input
                label={t('form.stock')}
                placeholder={t('form.stockPlaceholder')}
                type="number"
                {...register("stock_quantity", { valueAsNumber: true })}
                isInvalid={!!errors.stock_quantity}
                errorMessage={errors.stock_quantity?.message}
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700",
                  inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                }}
              />

              {/* Price Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    isSelected={isPriceFixed}
                    onValueChange={(value) =>
                      setValue("is_price_fixed", value, { shouldDirty: true })
                    }
                  />
                  <label className="text-sm font-medium text-gray-700">Fixed Price</label>
                </div>

                {isPriceFixed ? (
                  <Input
                    label={t('form.price')}
                    placeholder={t('form.pricePlaceholder')}
                    type="number"
                    step="0.01"
                    variant="bordered"
                    {...register("price", { valueAsNumber: true })}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-gray-400 text-small">$</span>
                      </div>
                    }
                    classNames={{
                      input: "text-gray-900",
                      label: "text-gray-700",
                      inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Min Price"
                      placeholder={t('form.pricePlaceholder')}
                      type="number"
                      step="0.01"
                      variant="bordered"
                      {...register("min_price", { valueAsNumber: true })}
                      isInvalid={!!errors.min_price}
                      errorMessage={errors.min_price?.message}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-gray-400 text-small">$</span>
                        </div>
                      }
                      classNames={{
                        input: "text-gray-900",
                        label: "text-gray-700",
                        inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                      }}
                    />
                    <Input
                      label="Max Price"
                      placeholder={t('form.pricePlaceholder')}
                      type="number"
                      step="0.01"
                      variant="bordered"
                      {...register("max_price", { valueAsNumber: true })}
                      isInvalid={!!errors.max_price}
                      errorMessage={errors.max_price?.message}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-gray-400 text-small">$</span>
                        </div>
                      }
                      classNames={{
                        input: "text-gray-900",
                        label: "text-gray-700",
                        inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleClose}
                  isDisabled={isLoading}
                >
                  {tCommon('modals.cancel') || 'Cancel'}
                </Button>
                <Button
                  className="bg-[#328E6E] text-white hover:bg-[#15803d]"
                  type="submit"
                  isLoading={isLoading || uploading}
                  isDisabled={!isDirty || (!isEditMode && Boolean(limits && !limits.can_add_products))}
                >
                  {uploading ? 'Uploading...' : isEditMode ? tCommon('modals.saveChanges') || 'Save Changes' : t('actions.addProduct')}
                </Button>
              </div>
            </ModalBody>
          </form>
        )}
      </ModalContent>
    </Modal>

    <ConfirmationModal
      isOpen={showConfirmClose}
      onClose={() => setShowConfirmClose(false)}
      onConfirm={confirmClose}
      title={tCommon("modals.unsavedChanges")}
      message={tCommon("modals.unsavedChangesMessage")}
      confirmText={tCommon("modals.discardChanges")}
      cancelText={tCommon("modals.keepEditing")}
      variant="warning"
    />
    </>
  );
}
