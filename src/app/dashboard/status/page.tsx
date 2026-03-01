"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useStatus } from "@/hooks/useStatus";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { AddStatusModal } from "./components/AddStatusModal";
import { EditStatusModal } from "./components/EditStatusModal";
import { Status } from "@/types/database";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export default function StatusPage() {
  const { company } = useAuth();
  const { t } = useTranslationNamespace('dashboard.status');
  const { statuses, loading, deleteStatus } = useStatus(company?.id);
  const { limits, canAddStatus } = usePlanLimits(company?.id);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

  const handleAddClick = async () => {
    const canAdd = await canAddStatus();
    if (canAdd) {
      setIsAddModalOpen(true);
    }
  };

  const handleEditClick = (status: Status) => {
    setSelectedStatus(status);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (status: Status) => {
    setSelectedStatus(status);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedStatus) {
      await deleteStatus(selectedStatus.id);
      setIsDeleteModalOpen(false);
      setSelectedStatus(null);
    }
  };

  const formatFrequency = (frequency?: number[]) => {
    if (!frequency || frequency.length === 0) return t('oneTime');
    
    const days = [
      t('days.monday'),
      t('days.tuesday'),
      t('days.wednesday'),
      t('days.thursday'),
      t('days.friday'),
      t('days.saturday'),
      t('days.sunday')
    ];
    
    return frequency.map(day => days[day - 1]).join(', ');
  };

  const formatDateTime = (datetime?: string) => {
    if (!datetime) return '';
    return new Date(datetime).toLocaleString();
  };

  if (loading && statuses.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('description')}</p>
        </div>
        <Button
          color="success"
          startContent={<PlusIcon className="w-5 h-5" />}
          onPress={handleAddClick}
        >
          {t('addStatus')}
        </Button>
      </div>

      {/* Limits Info */}
      {limits && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('statusUsage')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {limits.current_status || 0} / {limits.max_status || 0}
                </p>
              </div>
              <Chip
                color={limits.can_add_status ? "success" : "danger"}
                variant="flat"
              >
                {limits.can_add_status ? t('canAddMore') : t('limitReached')}
              </Chip>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Status List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <Card key={status.id} className="hover:shadow-lg transition-shadow">
            <CardBody className="space-y-3">
              {/* Media Preview */}
              {status.media_url && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {status.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={status.media_url}
                      alt="Status media"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={status.media_url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
              )}

              {/* Text Content */}
              {status.text && (
                <p className="text-sm text-gray-700 line-clamp-3">
                  {status.text}
                </p>
              )}

              {/* Schedule Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{t('position')}:</span>
                  <Chip size="sm" variant="flat">
                    #{status.position}
                  </Chip>
                </div>

                {status.publishment_datetime ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{t('scheduledFor')}:</span>
                    <span className="text-gray-700">
                      {formatDateTime(status.publishment_datetime)}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-gray-500">{t('frequency')}:</span>
                    <span className="text-gray-700">
                      {formatFrequency(status.frequency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  startContent={<PencilIcon className="w-4 h-4" />}
                  onPress={() => handleEditClick(status)}
                  className="flex-1"
                >
                  {t('edit')}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  startContent={<TrashIcon className="w-4 h-4" />}
                  onPress={() => handleDeleteClick(status)}
                  className="flex-1"
                >
                  {t('delete')}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {statuses.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-500 mb-4">{t('noStatus')}</p>
            <Button
              color="success"
              startContent={<PlusIcon className="w-5 h-5" />}
              onPress={handleAddClick}
            >
              {t('addFirstStatus')}
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      <AddStatusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        companyId={company?.id || ""}
      />

      {selectedStatus && (
        <EditStatusModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStatus(null);
          }}
          status={selectedStatus}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedStatus(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t('deleteConfirmTitle')}
        message={t('deleteConfirmMessage')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
      />
    </div>
  );
}
