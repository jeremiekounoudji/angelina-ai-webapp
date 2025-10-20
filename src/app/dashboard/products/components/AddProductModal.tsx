"use client";

import { useState, useRef } from "react";
import toast from 'react-hot-toast';
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
} from "@heroicons/react/24/outline";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

const createProductSchema = (t: any) => z.object({
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

interface AddProductModalProps {
  isOpen: boolean;
  onProductAdded?: () => void;
  onOpenChange: (open: boolean) => void;
}

export function AddProductModal({
  isOpen,
  onProductAdded,
  onOpenChange,
}: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload();
  const { createProduct } = useProducts();
  const { company } = useAuth();
  const { limits, canAddProduct } = usePlanLimits(company?.id);
  const { t } = useTranslationNamespace('dashboard.products');

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
      name: "",
      description: "",
      is_price_fixed: true,
      price: 0,
      min_price: 0,
      max_price: 0,
      stock_quantity: 0,
    },
  });

  const isPriceFixed = watch("is_price_fixed");

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const result = await upload({
      bucket: "products",
      files,
      path: "product-images",
    });

    if (result.success && result.urls.length > 0) {
      setImageUrl(result.urls[0]);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsLoading(true);

      // Check if product can be added
      const canAdd = await canAddProduct();
      if (!canAdd) {
        toast.error(
          "You have reached the maximum number of products for your current plan. Please upgrade to add more products."
        );
        return;
      }

      const productData = {
        ...data,
        image_url: imageUrl,
      };

      const result = await createProduct(productData);

      if (result) {
        onProductAdded?.();
        onOpenChange(false);
        reset();
        setImageUrl("");
      }
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isDirty) {
      onOpenChange(false);
      return;
    }

    if (confirm("You have unsaved changes. Are you sure you want to close?")) {
      reset();
      setImageUrl("");
      onOpenChange(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
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
              Add New Product
            </ModalHeader>
            <ModalBody className="gap-4">
              {/* Plan Limit Warning */}
              {limits && !limits.can_add_products && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-orange-800 font-medium mb-1">
                      Product Limit Reached
                    </p>
                    <p className="text-orange-700">
                      You have reached the maximum number of products (
                      {limits.max_products}) for your current plan. You
                      currently have {limits.current_products} products. Please
                      upgrade your plan to add more products.
                    </p>
                  </div>
                </div>
              )}
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Product"
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                      <CameraIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="solid"
                    color="primary"
                    className="absolute -bottom-1 -right-1"
                    onPress={() => fileInputRef.current?.click()}
                    isDisabled={uploading}
                  >
                    <CameraIcon className="w-4 h-4" />
                  </Button>
                </div>

                {uploading && (
                  <Progress
                    isIndeterminate
                    className="w-32"
                    size="sm"
                    color="primary"
                  />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
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
                placeholder="Enter product description"
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

              {/* Stock Quantity */}
              <Input
                label="Stock Quantity"
                placeholder="Enter stock quantity"
                type="number"
                {...register("stock_quantity", { valueAsNumber: true })}
                isInvalid={!!errors.stock_quantity}
                errorMessage={errors.stock_quantity?.message}
                isRequired
                classNames={{
                  input: "text-white",
                  label: "text-gray-50",
                  inputWrapper: "border-secondary bg-background"
                }}
              />

              {/* Price Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    {...register("is_price_fixed")}
                    isSelected={isPriceFixed}
                    onValueChange={(value) =>
                      setValue("is_price_fixed", value, { shouldDirty: true })
                    }
                  />
                  <label className="text-sm font-medium text-gray-50">Fixed Price</label>
                </div>

                {isPriceFixed ? (
                  <Input
                    label="Price"
                    placeholder="Enter price"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    isInvalid={!!errors.price}
                    errorMessage={errors.price?.message}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
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
                      placeholder="Min price"
                      type="number"
                      step="0.01"
                      {...register("min_price", { valueAsNumber: true })}
                      isInvalid={!!errors.min_price}
                      errorMessage={errors.min_price?.message}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">$</span>
                        </div>
                      }
                      classNames={{
                        input: "text-white",
                        label: "text-gray-50",
                        inputWrapper: "border-secondary bg-background"
                      }}
                    />
                    <Input
                      label="Max Price"
                      placeholder="Max price"
                      type="number"
                      step="0.01"
                      {...register("max_price", { valueAsNumber: true })}
                      isInvalid={!!errors.max_price}
                      errorMessage={errors.max_price?.message}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">$</span>
                        </div>
                      }
                      classNames={{
                        input: "text-white",
                        label: "text-gray-50",
                        inputWrapper: "border-secondary bg-background"
                      }}
                    />
                  </div>
                )}
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
                isDisabled={!isDirty || Boolean(limits && !limits.can_add_products)}
              >
                Add Product
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
