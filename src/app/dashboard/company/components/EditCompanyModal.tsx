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
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

const createCompanySchema = (t: any) => z.object({
  name: z.string().min(1, t('form.nameRequired')),
  type: z.enum(["restaurant", "shop", "retail", "service",'other']),
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(company.avatar_url || "");
  const { t } = useTranslationNamespace('dashboard.company');

  const companySchema = createCompanySchema(t);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { refreshUser } = useAuth();

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

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setUploadProgress(0);

      // Create a unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${company.id}-${Date.now()}.${fileExt}`;
      const filePath = `company-avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsLoading(true);

      const updateData = {
        ...data,
        avatar_url: avatarUrl || company.avatar_url,
      };

      const { error } = await supabase
        .from("companies")
        .update(updateData)
        .eq("id", company.id);

      if (error) throw error;

      await refreshUser();
      onOpenChange(false);
      reset(data);
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

    if (confirm("You have unsaved changes. Are you sure you want to close?")) {
      reset();
      setAvatarUrl(company.avatar_url || "");
      onOpenChange(false);
    }
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
                        isDisabled={isLoading}
                      >
                        <CameraIcon className="w-4 h-4" />
                      </Button>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <Progress
                        value={uploadProgress}
                        className="w-32"
                        size="sm"
                        color="primary"
                      />
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
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
    </>
  );
}
