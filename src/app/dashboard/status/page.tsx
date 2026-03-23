"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { PlusIcon, PencilIcon, TrashIcon, ChatBubbleBottomCenterTextIcon, ClockIcon, CalendarIcon, PhotoIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useStatus } from "@/hooks/useStatus";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { AddStatusModal } from "./components/AddStatusModal";
import { EditStatusModal } from "./components/EditStatusModal";
import { MediaPreviewModal } from "./components/VideoPlayerModal";
import { Status } from "@/types/database";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export default function StatusPage() {
  const { company } = useAuth();
  const { t } = useTranslationNamespace('dashboard.status');
  const { statuses, loading, deleteStatus, createStatus, updateStatus, refetch } = useStatus(company?.id);
  const { limits, canAddStatus } = usePlanLimits(company?.id);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [videoPlayerUrl, setVideoPlayerUrl] = useState<string | null>(null);
  const [videoPlayerType, setVideoPlayerType] = useState<"image" | "video">("video");

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

  const getPublishingStatusColor = (status?: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  if (loading && statuses.length === 0) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
          <p className="text-gray-600 mt-0.5">
            {t('description')}
            {limits && (
              <span className="ml-2 text-sm">
                ({limits.current_status || 0}/{limits.max_status || 0} statuses)
              </span>
            )}
          </p>
        </div>
        <Button
          className="bg-[#091413] text-white hover:bg-[#15803d] sm:min-w-fit min-w-0"
          startContent={<PlusIcon className="w-4 h-4 shrink-0" />}
          onPress={handleAddClick}
          isIconOnly={false}
        >
          <span className="hidden sm:inline">{t('addStatus')}</span>
        </Button>
      </div>

      {/* Limits Banner - compact, inline */}
      {limits && !limits.can_add_status && (
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
          <Chip color="danger" variant="flat" size="sm">{t('limitReached')}</Chip>
          <p className="text-sm text-red-700">
            {limits.current_status || 0} / {limits.max_status || 0}
          </p>
        </div>
      )}

      {/* Empty State - compact */}
      {statuses.length === 0 && !loading ? (
        <Card className="bg-white border border-gray-200 shadow-sm max-w-md mx-auto">
          <CardBody className="text-center py-10 px-6">
            <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">{t('noStatus')}</h3>
            <p className="text-sm text-gray-500 mb-5">
              {t('description')}
            </p>
            <Button
              className="bg-[#091413] text-white hover:bg-[#15803d]"
              size="sm"
              startContent={<PlusIcon className="w-4 h-4" />}
              onPress={handleAddClick}
            >
              {t('addFirstStatus')}
            </Button>
          </CardBody>
        </Card>
      ) : (
        /* Status Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statuses.map((status) => (
            <Card key={status.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-0">
                {/* Media Preview */}
                <div className="relative bg-gray-100">
                  {status.media_url ? (
                    <>
                      {status.status_type === "audio" ? (
                        <div className="w-full h-[200px] flex items-center justify-center px-4">
                          <audio src={status.media_url} controls className="w-full" />
                        </div>
                      ) : status.status_type === "video" ? (
                        <div
                          className="relative w-full h-[200px] cursor-pointer group bg-black"
                          onClick={() => { setVideoPlayerUrl(status.media_url!); setVideoPlayerType('video'); }}
                        >
                          {status.thumbnail_url ? (
                            <img
                              src={status.thumbnail_url}
                              alt="Video thumbnail"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <video
                              src={status.media_url}
                              className="w-full h-full object-contain"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <PlayIcon className="w-6 h-6 text-gray-900 ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={status.media_url}
                          alt="Status media"
                          className="w-full h-[200px] object-cover cursor-pointer"
                          onClick={() => { setVideoPlayerUrl(status.media_url!); setVideoPlayerType('image'); }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-[200px] flex flex-col items-center justify-center gap-1">
                      <PhotoIcon className="w-8 h-8 text-gray-300" />
                      <span className="text-xs text-gray-400">{t('text')} only</span>
                    </div>
                  )}

                  {/* Floating Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 z-10">
                    <Button
                      isIconOnly
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                      onPress={() => handleEditClick(status)}
                    >
                      <PencilIcon className="w-4 h-4 text-gray-700" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                      onPress={() => handleDeleteClick(status)}
                    >
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  {/* Publishing Status Badge */}
                  {status.publishing_status && (
                    <div className="absolute top-2 left-2">
                      <Chip
                        size="sm"
                        color={getPublishingStatusColor(status.publishing_status)}
                        variant="flat"
                        className="backdrop-blur-sm"
                      >
                        {status.publishing_status}
                      </Chip>
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4 space-y-2.5">
                  {/* Text Content */}
                  {status.text && (
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {status.text}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="space-y-1.5">
                    {/* Position */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{t('position')}</span>
                      <Chip size="sm" variant="flat" className="bg-gray-100 text-gray-700">
                        #{status.position}
                      </Chip>
                    </div>

                    {/* Schedule */}
                    {status.publishment_datetime ? (
                      <div className="flex items-center gap-2 text-xs">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-500">{t('scheduledFor')}:</span>
                        <span className="text-gray-700 font-medium truncate">
                          {formatDateTime(status.publishment_datetime)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-xs">
                        <ClockIcon className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-gray-500">{t('frequency')}:</span>
                          <span className="text-gray-700 font-medium ml-1">
                            {formatFrequency(status.frequency)}
                          </span>
                          {status.recurring_time && (
                            <span className="text-gray-500 ml-1">
                              @ {status.recurring_time.slice(0, 5)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Next Post */}
                    {status.next_post_at && (
                      <div className="flex items-center gap-2 text-xs pt-1.5 border-t border-gray-100">
                        <span className="text-gray-400">Next:</span>
                        <span className="text-green-600 font-medium">
                          {formatDateTime(status.next_post_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modals — pass callbacks from the single useStatus hook */}
      <AddStatusModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        companyId={company?.id || ""}
        onCreated={refetch}
      />

      {selectedStatus && (
        <EditStatusModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStatus(null);
          }}
          status={selectedStatus}
          onUpdated={refetch}
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

      <MediaPreviewModal
        isOpen={!!videoPlayerUrl}
        onClose={() => setVideoPlayerUrl(null)}
        src={videoPlayerUrl ?? ""}
        type={videoPlayerType}
      />
    </div>
  );
}
