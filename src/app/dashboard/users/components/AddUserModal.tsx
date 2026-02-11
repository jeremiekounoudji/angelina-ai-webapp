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
  Select,
  SelectItem,
  Avatar,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpload } from "@/hooks/useUpload";
import { useUsers } from "@/hooks/useUsers";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useAuth } from "@/contexts/AuthContext";
import { CameraIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import toast from 'react-hot-toast';
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { UserRole } from "@/types/database";

const userSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(["customer", "manager", "staff"] as const), // Exclude admin from options
});

type UserFormData = z.infer<typeof userSchema>;

interface AddUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserModal({
  isOpen,
  onOpenChange,
  onUserAdded
}: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload();
  const { createUser } = useUsers();
  const { company } = useAuth();
  const { limits, canAddUser } = usePlanLimits(company?.id);
  const { t } = useTranslationNamespace('dashboard.users');
  const { t: tCommon } = useTranslationNamespace('common');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      role: "customer",
    },
  });

  const userRole = watch("role");

  const userRoles: { value: UserRole; label: string }[] = [
    { value: "customer", label: t('roles.customer') },
    { value: "staff", label: t('roles.staff') },
    { value: "manager", label: t('roles.manager') },
    // Admin is excluded - only company owner can be admin
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

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);

      // Check if user can be added
      const canAdd = await canAddUser();
      if (!canAdd) {
        toast.error("You have reached the maximum number of users for your current plan. Please upgrade to add more users.");
        return;
      }

      let finalAvatarUrl = "";

      // Upload avatar if selected
      if (avatarFile) {
        const result = await upload({
          bucket: "avatars",
          files: [avatarFile],
          path: "user-avatars"
        });

        if (result.success && result.urls.length > 0) {
          finalAvatarUrl = result.urls[0];
        }
      }

      const userData = {
        ...data,
        avatar_url: finalAvatarUrl,
      };

      const result = await createUser(userData);
      
      if (result) {
        onUserAdded();
        onOpenChange(false);
        reset();
        setAvatarUrl("");
        setAvatarFile(null);
        // Clean up preview URL
        if (avatarUrl.startsWith('blob:')) {
          URL.revokeObjectURL(avatarUrl);
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);
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
    setAvatarUrl("");
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
            <ModalHeader className="flex flex-col gap-1 text-gray-900">
              {t('form.addTitle')}
            </ModalHeader>
            <ModalBody className="gap-4">
              {/* Plan Limit Warning */}
              {limits && !limits.can_add_users && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-orange-800 font-medium mb-1">
                      {t('limits.reached')}
                    </p>
                    <p className="text-orange-700">
                      {t('limits.message')}
                    </p>
                  </div>
                </div>
              )}
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar
                    src={avatarUrl}
                    name={watch("full_name") || "User"}
                    size="lg"
                    className="w-24 h-24 bg-green-100 text-[#328E6E]"
                  />
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

                <p className="text-sm text-gray-600">
                  {t('form.avatar')}
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>

              {/* Full Name */}
              <Input
                label={t('form.fullName')}
                placeholder={t('form.enterFullName')}
                {...register("full_name")}
                isInvalid={!!errors.full_name}
                errorMessage={errors.full_name?.message}
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700",
                  inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                }}
              />

              {/* Email */}
              <Input
                label={t('form.email')}
                placeholder={t('form.enterEmail')}
                type="email"
                {...register("email")}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700",
                  inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                }}
              />

              {/* Phone */}
              <Input
                label={t('form.phone')}
                placeholder={t('form.enterPhone')}
                {...register("phone")}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone?.message}
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-gray-900",
                  label: "text-gray-700",
                  inputWrapper: "border-gray-300 bg-white hover:border-[#328E6E] focus-within:border-[#328E6E]"
                }}
              />

              {/* Role */}
              <Select
                label={t('form.role')}
                placeholder={t('form.selectRole')}
                variant="bordered"
                selectedKeys={userRole ? [userRole] : []}
                onSelectionChange={(keys) => {
                  const selectedRole = Array.from(keys)[0] as "customer" | "manager" | "staff";
                  setValue("role", selectedRole, { shouldDirty: true });
                }}
                isInvalid={!!errors.role}
                errorMessage={errors.role?.message}
                isRequired
                classNames={{
                  trigger: "border-gray-300 bg-white hover:border-[#328E6E]",
                  label: "text-gray-700",
                  value: "text-gray-900"
                }}
              >
                {userRoles.map((role) => (
                  <SelectItem key={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={handleClose}
                isDisabled={isLoading}
              >
                {t('form.cancel')}
              </Button>
              <Button
                className="bg-[#328E6E] text-white hover:bg-[#15803d]"
                type="submit"
                isLoading={isLoading || uploading}
                isDisabled={!isDirty || Boolean(limits && !limits.can_add_users)}
              >
                {uploading ? t('form.uploading') : t('form.addUser')}
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