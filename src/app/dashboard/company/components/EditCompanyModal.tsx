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
  Select,
  SelectItem,
  Avatar,
  Progress,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Company, CompanyType } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { useUpload } from "@/hooks/useUpload";
import { useCompany } from "@/hooks/useCompany";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const createCompanySchema = (t: any) => z.object({
  name: z.string().min(1, t('form.nameRequired')),
  type: z.enum(["restaurant", "retail", "service", "other"]),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(t('form.emailInvalid')).optional().or(z.literal("")),
  description: z.string().optional(),
});

type CompanyFormData = {
  name: string;
  type: CompanyType;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
};

interface EditCompanyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

export function EditCompanyModal({
  isOpen,
  onOpenChange,
  company,
}: EditCompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(company.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const { t } = useTranslationNamespace('dashboard.company');
  const { t: tCommon } = useTranslationNamespace('common');

  const companySchema = createCompanySchema(t);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshUser } = useAuth();
  const { upload, uploading } = useUpload();
  const { updateCompany } = useCompany();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name,
      type: company.type,
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      description: company.description || "",
    },
  });

  const companyType = watch("type");

  const companyTypes: { value: CompanyType; label: string }[] = [
    { value: "restaurant", label: "Restaurant" },
    { value: "retail", label: "Retail" },
    { value: "service", label: "Service" },
    { value: "other", label: "Other" },

  ];

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store the file but don't upload yet
    setAvatarFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
  };

  const onSubmit: (data: CompanyFormData) => Promise<void> = async (data) => {
    try {
      setIsLoading(true);

      let finalAvatarUrl = company.avatar_url;

      // Upload avatar if selected
      if (avatarFile) {
        const result = await upload({
          bucket: "avatars",
          files: [avatarFile],
          path: "company-avatars"
        });

        if (result.success && result.urls.length > 0) {
          finalAvatarUrl = result.urls[0];
        }
      }

      const updateData = {
        ...data,
        avatar_url: finalAvatarUrl,
      };

      const result = await updateCompany(updateData);

      if (result) {
        await refreshUser();
        onOpenChange(false);
        reset(data);
        // Clean up preview URL
        if (avatarUrl.startsWith('blob:')) {
          URL.revokeObjectURL(avatarUrl);
        }
      }
    } catch (error) {
      console.error("Error updating company:", error);
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
    setAvatarUrl(company.avatar_url || "");
    setAvatarFile(null);
    // Clean up preview URL
    if (avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }
    setShowConfirmClose(false);
    onOpenChange(false);
  };

  return (
    <>
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
                Edit Company Profile
              </ModalHeader>
              <ModalBody className="gap-4">
                <div className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar
                        src={avatarUrl}
                        name={company.name}
                        size="lg"
                        className="w-24 h-24"
                      />
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
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Company Name */}
                  <Input
                    label="Company Name"
                    placeholder="Enter company name"
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

                  {/* Company Type */}
                  <Select
                    label="Company Type"
                    placeholder="Select company type"
                    selectedKeys={companyType ? [companyType] : []}
                    onSelectionChange={(keys) => {
                      const selectedType = Array.from(keys)[0] as CompanyType;
                      setValue("type", selectedType, { shouldDirty: true });
                    }}
                    isInvalid={!!errors.type}
                    errorMessage={errors.type?.message}
                    isRequired
                    classNames={{
                      trigger: "border-secondary bg-background",
                      label: "text-gray-50",
                      value: "text-white"
                    }}
                  >
                    {companyTypes.map((type) => (
                      <SelectItem key={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>

                  {/* Email */}
                  <Input
                    label="Email"
                    placeholder="Enter company email"
                    type="email"
                    {...register("email")}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background"
                    }}
                  />

                  {/* Phone */}
                  <Input
                    label="Phone"
                    placeholder="Enter company phone"
                    {...register("phone")}
                    isInvalid={!!errors.phone}
                    errorMessage={errors.phone?.message}
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background"
                    }}
                  />

                  {/* Address */}
                  <Textarea
                    label="Address"
                    placeholder="Enter company address"
                    {...register("address")}
                    isInvalid={!!errors.address}
                    errorMessage={errors.address?.message}
                    minRows={2}
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background"
                    }}
                  />

                  {/* Description */}
                  <Textarea
                    label="Description"
                    placeholder="Enter company description"
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
