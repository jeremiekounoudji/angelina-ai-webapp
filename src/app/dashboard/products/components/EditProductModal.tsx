"use client";

import { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
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
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types/database";
import { useProducts } from "@/hooks/useProducts";
import { useUpload } from "@/hooks/useUpload";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { TranslationFunction } from "@/locales";

const createProductSchema = (t: TranslationFunction) => z
  .object({
    name: z.string().min(1, t('form.nameRequired')),
    description: z.string().optional(),
    isPriceFixed: z.boolean(),
    price: z.number().min(0, t('form.priceRequired')).optional(),
    minPrice: z.number().min(0, t('form.priceRequired')).optional(),
    maxPrice: z.number().min(0, t('form.priceRequired')).optional(),
    stockQuantity: z.number().min(0, t('form.stockRequired')),
  })
  .refine(
    (data) => {
      if (data.isPriceFixed) {
        return data.price !== undefined && data.price > 0;
      } else {
        return (
          data.minPrice !== undefined &&
          data.maxPrice !== undefined &&
          data.minPrice > 0 &&
          data.maxPrice > 0 &&
          data.maxPrice >= data.minPrice
        );
      }
    },
    {
      message: "Invalid pricing configuration",
      path: ["price"],
    }
  );

type ProductFormData = {
  name: string;
  description?: string;
  isPriceFixed: boolean;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  stockQuantity: number;
};

interface EditProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onProductUpdated: () => void;
}

export function EditProductModal({
  isOpen,
  onOpenChange,
  product,
  onProductUpdated,
}: EditProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(product.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { editProduct } = useProducts();
  const { upload, uploading } = useUpload();
  const { t } = useTranslationNamespace('dashboard.products');
  const { t: tCommon } = useTranslationNamespace('common');

  const productSchema = createProductSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description || "",
      isPriceFixed: product.is_price_fixed,
      price: product.price || undefined,
      minPrice: product.min_price || undefined,
      maxPrice: product.max_price || undefined,
      stockQuantity: product.stock_quantity,
    },
  });

  const isPriceFixed = watch("isPriceFixed");

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store the file but don't upload yet
    setImageFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
  };

  const removeImage = () => {
    // Clean up preview URL if it exists
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

      let finalImageUrl = product.image_url;

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
      } else if (imageUrl !== product.image_url) {
        // Image was removed
        finalImageUrl = undefined;
      }

      const updateData = {
        name: data.name,
        description: data.description || undefined,
        is_price_fixed: data.isPriceFixed,
        price: data.isPriceFixed ? data.price : undefined,
        min_price: !data.isPriceFixed ? data.minPrice : undefined,
        max_price: !data.isPriceFixed ? data.maxPrice : undefined,
        stock_quantity: data.stockQuantity,
        image_url: finalImageUrl,
      };

      const result = await editProduct(product.id, updateData);

      if (result) {
        onProductUpdated();
        handleClose();
        // Clean up preview URL
        if (imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(imageUrl);
        }
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : tCommon("modals.updateFailed")
      );
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
    setImageUrl(product.image_url || "");
    setImageFile(null);
    setError("");
    // Clean up preview URL
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
        size="3xl"
        scrollBehavior="inside"
        onClose={handleClose}
        classNames={{
          body: "py-6 max-h-[70vh] overflow-y-auto",
          backdrop: "bg-black/50",
          base: "border-0 bg-background",
          header: "border-b-1 border-secondary",
          footer: "border-t-1 border-secondary",
        }}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader className="flex flex-col gap-1 text-white">
                Edit Product
              </ModalHeader>
              <ModalBody className="gap-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Product Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-50 mb-2">
                      Product Images
                    </label>

                    {imageUrl && (
                      <div className="mb-4">
                        <Card className="relative max-w-xs">
                          <CardBody className="p-0">
                            <Image
                              src={imageUrl}
                              alt="Product image"
                              className="w-full aspect-square object-cover"
                              radius="sm"
                            />
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              className="absolute top-1 right-1"
                              onPress={() => removeImage()}
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </Button>
                          </CardBody>
                        </Card>
                      </div>
                    )}

                    <Button
                      variant="bordered"
                      startContent={<PlusIcon className="w-4 h-4" />}
                      onPress={() => fileInputRef.current?.click()}
                      isDisabled={uploading}
                      className="w-full border-secondary text-white hover:bg-secondary"
                    >
                      Add Images
                    </Button>

                    {uploading && (
                      <Progress
                        isIndeterminate
                        className="mt-2"
                        size="sm"
                        color="primary"
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
                    label="Product Name"
                    placeholder="Enter product name"
                    {...register("name")}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                    isRequired
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background"
                    }}
                  />

                  {/* Description */}
                  <Textarea
                    label="Description"
                    placeholder="Enter product description (optional)"
                    {...register("description")}
                    isInvalid={!!errors.description}
                    errorMessage={errors.description?.message}
                    minRows={3}
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background"
                    }}
                  />

                  {/* Pricing */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Switch
                        isSelected={isPriceFixed}
                        onValueChange={(value) =>
                          setValue("isPriceFixed", value, { shouldDirty: true })
                        }
                      />
                      <label className="text-sm font-medium text-gray-50">Fixed Price</label>
                    </div>

                    {isPriceFixed ? (
                      <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        startContent="$"
                        {...register("price", { valueAsNumber: true })}
                        isInvalid={!!errors.price}
                        errorMessage={errors.price?.message}
                        isRequired
                        classNames={{
                          input: "text-white",
                          label: "text-gray-50",
                          inputWrapper: "border-secondary bg-background"
                        }}
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Min Price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          startContent="$"
                          {...register("minPrice", { valueAsNumber: true })}
                          isInvalid={!!errors.minPrice}
                          errorMessage={errors.minPrice?.message}
                          isRequired
                          classNames={{
                            input: "text-white",
                            label: "text-gray-50",
                            inputWrapper: "border-secondary bg-background"
                          }}
                        />
                        <Input
                          label="Max Price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          startContent="$"
                          {...register("maxPrice", { valueAsNumber: true })}
                          isInvalid={!!errors.maxPrice}
                          errorMessage={errors.maxPrice?.message}
                          isRequired
                          classNames={{
                            input: "text-white",
                            label: "text-gray-50",
                            inputWrapper: "border-secondary bg-background"
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Stock Quantity */}
                  <Input
                    label="Stock Quantity"
                    type="number"
                    placeholder="0"
                    {...register("stockQuantity", { valueAsNumber: true })}
                    isInvalid={!!errors.stockQuantity}
                    errorMessage={errors.stockQuantity?.message}
                    isRequired
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background"
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleClose}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={!isDirty}
                >
                  Save Changes
                </Button>
              </ModalFooter>
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
