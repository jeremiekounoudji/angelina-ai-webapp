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
import { createClient } from "@/lib/supabase/client";
import { User, UserRole } from "@/types/database";
import { useTranslationNamespace } from "@/contexts/TranslationContext";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { t } = useTranslationNamespace("dashboard.users");

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

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setUploadProgress(0);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `user-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setError("Failed to upload avatar");
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsLoading(true);
      setError("");

      const updateData = {
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        role: data.role,
      };

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      onUserUpdated();
      handleClose();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to update user"
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

    if (confirm("You have unsaved changes. Are you sure you want to close?")) {
      reset();
      setAvatarUrl(user.avatar_url || "");
      setError("");
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

                  <Input
                    label={t("form.fullName")}
                    placeholder={t("form.enterFullName")}
                    {...register("fullName")}
                    isInvalid={!!errors.fullName}
                    errorMessage={errors.fullName?.message}
                    isRequired
                    variant="bordered"
                    className="text-gray-50 "
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
                    className="text-gray-50 "
                  />

                  <Input
                    label={t("form.phone")}
                    placeholder={t("form.enterPhone")}
                    {...register("phone")}
                    isInvalid={!!errors.phone}
                    errorMessage={errors.phone?.message}
                    variant="bordered"
                    isRequired
                    className="text-gray-50 "
                  />

                  <Select
                    label={t("form.role")}
                    placeholder={t("form.selectRole")}
                    className="text-gray-50 "
                    variant="bordered"
                    selectedKeys={selectedRole ? [selectedRole] : []}
                    onSelectionChange={(keys) => {
                      const selectedRole = Array.from(keys)[0] as UserRole;
                      setValue("role", selectedRole, { shouldDirty: true });
                    }}
                    isInvalid={!!errors.role}
                    errorMessage={errors.role?.message}
                    isRequired
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
    </>
  );
}
