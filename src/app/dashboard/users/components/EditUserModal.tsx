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
  Progress,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CameraIcon } from "@heroicons/react/24/outline";
import { User, UserRole } from "@/types/database";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { useUpload } from "@/hooks/useUpload";
import { useUsers } from "@/hooks/useUsers";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  role: z.enum(["admin", "manager", "staff", "customer"]),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onUserUpdated: () => void;
}

export function EditUserModal({
  isOpen,
  onOpenChange,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload();
  const { editUser } = useUsers();
  const { t } = useTranslationNamespace("dashboard.users");
  const { t: tCommon } = useTranslationNamespace("common");

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
      fullName: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role,
    },
  });

  const selectedRole = watch("role");

  const roles: { value: UserRole; label: string }[] = [
    { value: "admin", label: t("roles.admin") },
    { value: "manager", label: t("roles.manager") },
    { value: "staff", label: t("roles.staff") },
    { value: "customer", label: t("roles.customer") },
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
      setError("");

      let finalAvatarUrl = user.avatar_url;

      // Upload avatar if selected
      if (avatarFile) {
        const result = await upload({
          bucket: "avatars",
          files: [avatarFile],
          path: "user-avatars",
        });

        if (result.success && result.urls.length > 0) {
          finalAvatarUrl = result.urls[0];
        }
      }

      const updateData = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        avatar_url: finalAvatarUrl,
      };

      await editUser(user.id, updateData);
      
      // Clean up preview URL
      if (avatarUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarUrl);
      }
      
      onUserUpdated();
      onOpenChange(false);
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
    setAvatarUrl(user.avatar_url || "");
    setAvatarFile(null);
    setError("");
    // Clean up preview URL
    if (avatarUrl.startsWith("blob:")) {
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
          body: "py-6 max-h-[70vh] overflow-y-auto bg-background",
          backdrop: "bg-black/50",
          base: "border-0",
          header: "border-b-1 border-gray-200",
          footer: "border-t-1 border-gray-200",
        }}
      >
        <ModalContent className=" bg-background">
          {() => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>{t("form.editTitle")}</ModalHeader>
              <ModalBody className="gap-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar
                        src={avatarUrl}
                        name={user.full_name || user.email || "User"}
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

                  <Input
                    label={t("form.fullName")}
                    placeholder={t("form.enterFullName")}
                    {...register("fullName")}
                    isInvalid={!!errors.fullName}
                    errorMessage={errors.fullName?.message}
                    isRequired
                    variant="bordered"
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background",
                    }}
                  />

                  <Input
                    label={t("form.email")}
                    type="email"
                    placeholder={t("form.enterEmail")}
                    {...register("email")}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    isRequired
                    variant="bordered"
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background",
                    }}
                  />

                  <Input
                    label={t("form.phone")}
                    placeholder={t("form.enterPhone")}
                    {...register("phone")}
                    isInvalid={!!errors.phone}
                    errorMessage={errors.phone?.message}
                    variant="bordered"
                    isRequired
                    classNames={{
                      input: "text-white",
                      label: "text-gray-50",
                      inputWrapper: "border-secondary bg-background",
                    }}
                  />

                  <Select
                    label={t("form.role")}
                    placeholder={t("form.selectRole")}
                    variant="bordered"
                    selectedKeys={selectedRole ? [selectedRole] : []}
                    onSelectionChange={(keys) => {
                      const selectedRole = Array.from(keys)[0] as UserRole;
                      setValue("role", selectedRole, { shouldDirty: true });
                    }}
                    isInvalid={!!errors.role}
                    errorMessage={errors.role?.message}
                    isRequired
                    classNames={{
                      trigger: "border-secondary bg-background",
                      label: "text-gray-50",
                      value: "text-white",
                    }}
                  >
                    {roles.map((role) => (
                      <SelectItem key={role.value}>{role.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleClose}
                  isDisabled={isLoading}
                >
                  {t("form.cancel")}
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={!isDirty}
                >
                  {t("form.saveChanges")}
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
