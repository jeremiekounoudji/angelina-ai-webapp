"use client";

import { useState, useEffect } from "react";
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
  Checkbox,
  CheckboxGroup,
} from "@heroui/react";
import { useStatus } from "@/hooks/useStatus";
import { useUpload } from "@/hooks/useUpload";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { Status } from "@/types/database";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface EditStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: Status;
  onUpdated?: () => void;
}

export function EditStatusModal({ isOpen, onClose, status, onUpdated }: EditStatusModalProps) {
  const { t } = useTranslationNamespace('dashboard.status');
  const { updateStatus } = useStatus(status.company_id);
  const { upload, uploading } = useUpload();
  
  const [text, setText] = useState(status.text || "");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState(status.media_url || "");
  const [position, setPosition] = useState(status.position.toString());
  const [scheduleType, setScheduleType] = useState<"datetime" | "frequency">(
    status.publishment_datetime ? "datetime" : "frequency"
  );
  const [publishmentDatetime, setPublishmentDatetime] = useState(
    status.publishment_datetime ? new Date(status.publishment_datetime).toISOString().slice(0, 16) : ""
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    status.frequency?.map(d => d.toString()) || []
  );
  const [recurringTime, setRecurringTime] = useState(
    status.recurring_time ? status.recurring_time.slice(0, 5) : ""
  );
  const [loading, setLoading] = useState(false);

  const weekDays = [
    { value: "1", label: t('days.monday'), short: "Mo" },
    { value: "2", label: t('days.tuesday'), short: "Tu" },
    { value: "3", label: t('days.wednesday'), short: "We" },
    { value: "4", label: t('days.thursday'), short: "Th" },
    { value: "5", label: t('days.friday'), short: "Fr" },
    { value: "6", label: t('days.saturday'), short: "Sa" },
    { value: "7", label: t('days.sunday'), short: "Su" },
  ];

  useEffect(() => {
    setText(status.text || "");
    setMediaPreview(status.media_url || "");
    setPosition(status.position.toString());
    setScheduleType(status.publishment_datetime ? "datetime" : "frequency");
    setPublishmentDatetime(
      status.publishment_datetime ? new Date(status.publishment_datetime).toISOString().slice(0, 16) : ""
    );
    setSelectedDays(status.frequency?.map(d => d.toString()) || []);
    setRecurringTime(status.recurring_time ? status.recurring_time.slice(0, 5) : "");
  }, [status]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast.error(t('errors.invalidFileType'));
      return;
    }

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          toast.error(t('errors.videoTooLong'));
          return;
        }
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview("");
  };

  const handleSubmit = async () => {
    if (!text && !mediaPreview) {
      toast.error(t('errors.textOrMediaRequired'));
      return;
    }

    if (scheduleType === "datetime" && !publishmentDatetime) {
      toast.error(t('errors.datetimeRequired'));
      return;
    }

    if (scheduleType === "frequency") {
      if (selectedDays.length === 0) {
        toast.error(t('errors.frequencyRequired'));
        return;
      }
      if (!recurringTime) {
        toast.error((t('errors.timeRequired') as string) || 'Time is required for recurring schedule');
        return;
      }
    }

    try {
      setLoading(true);

      let mediaUrl = status.media_url;
      if (mediaFile) {
        const uploadResult = await upload({ bucket: "status", files: [mediaFile] });
        if (!uploadResult.success || uploadResult.urls.length === 0) {
          toast.error(t('errors.uploadFailed'));
          return;
        }
        mediaUrl = uploadResult.urls[0];
      }

      let nextPostAt: string | null = null;
      
      if (scheduleType === "datetime") {
        nextPostAt = new Date(publishmentDatetime).toISOString();
      } else if (scheduleType === "frequency" && selectedDays.length > 0 && recurringTime) {
        const currentDate = new Date();
        const sortedDays = selectedDays.map(d => parseInt(d)).sort((a,b) => a - b);
        const currentDay = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
        
        const [hours, minutes] = recurringTime.split(':').map(Number);
        const todayPostTime = new Date(currentDate);
        todayPostTime.setHours(hours, minutes, 0, 0);
        
        let daysToAdd = 0;
        if (sortedDays.includes(currentDay) && todayPostTime > currentDate) {
          daysToAdd = 0;
        } else {
          const nextDay = sortedDays.find(d => d > currentDay) || sortedDays[0];
          daysToAdd = nextDay > currentDay ? nextDay - currentDay : (7 - currentDay) + nextDay;
        }
        
        const nextDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
        nextDate.setHours(hours, minutes, 0, 0);
        nextPostAt = nextDate.toISOString();
      }

      // If media was cleared
      if (!mediaPreview && !mediaFile) {
        mediaUrl = undefined;
      }

      const updates = {
        text: text || undefined,
        media_url: mediaUrl || undefined,
        position: parseInt(position),
        publishment_datetime: scheduleType === "datetime" ? publishmentDatetime : undefined,
        frequency: scheduleType === "frequency" ? selectedDays.map(d => parseInt(d)) : undefined,
        recurring_time: scheduleType === "frequency" ? recurringTime + ":00" : undefined,
        next_post_at: nextPostAt || undefined,
        publishing_status: "pending" as const,
      };

      await updateStatus(status.id, updates);
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <h3 className="text-lg font-semibold">{t('editStatus')}</h3>
          <p className="text-sm font-normal text-gray-500">{t('description')}</p>
        </ModalHeader>

        <ModalBody className="space-y-5 py-4">
          {/* Text Content */}
          <div className="space-y-1.5">
            <Textarea
              label={t('text')}
              placeholder={t('textPlaceholder')}
              value={text}
              onValueChange={setText}
              maxRows={4}
              variant="bordered"
              classNames={{
                inputWrapper: "border-gray-300 data-[hover=true]:border-[#328E6E] group-data-[focus=true]:border-[#328E6E]",
              }}
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('media')}</label>
            {!mediaPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#328E6E] transition-all duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">{t('mediaHint')}</p>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden group">
                {(mediaFile?.type.startsWith('image/') || mediaPreview.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaPreview} className="w-full h-full object-cover" controls />
                )}
                <button
                  onClick={clearMedia}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Position & Schedule Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label={t('position')}
              value={position}
              onValueChange={setPosition}
              min="1"
              variant="bordered"
              classNames={{
                inputWrapper: "border-gray-300 data-[hover=true]:border-[#328E6E] group-data-[focus=true]:border-[#328E6E]",
              }}
            />
            <Select
              label={t('scheduleType')}
              selectedKeys={[scheduleType]}
              onSelectionChange={(keys) => setScheduleType(Array.from(keys)[0] as "datetime" | "frequency")}
              variant="bordered"
              classNames={{
                trigger: "border-gray-300 data-[hover=true]:border-[#328E6E]",
              }}
            >
              <SelectItem key="frequency">
                {t('recurring')}
              </SelectItem>
              <SelectItem key="datetime">
                {t('oneTime')}
              </SelectItem>
            </Select>
          </div>

          {/* Datetime Picker */}
          {scheduleType === "datetime" && (
            <Input
              type="datetime-local"
              label={t('publishmentDatetime')}
              value={publishmentDatetime}
              onValueChange={setPublishmentDatetime}
              variant="bordered"
              classNames={{
                inputWrapper: "border-gray-300 data-[hover=true]:border-[#328E6E] group-data-[focus=true]:border-[#328E6E]",
              }}
            />
          )}

          {/* Frequency Selector */}
          {scheduleType === "frequency" && (
            <div className="space-y-4">
              {/* Day Buttons Grid */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('selectDays')}</label>
                <CheckboxGroup
                  value={selectedDays}
                  onValueChange={setSelectedDays}
                  orientation="horizontal"
                  classNames={{
                    wrapper: "gap-2 flex-wrap",
                  }}
                >
                  {weekDays.map((day) => (
                    <Checkbox
                      key={day.value}
                      value={day.value}
                      classNames={{
                        base: "inline-flex m-0 bg-gray-100 hover:bg-gray-200 items-center justify-center rounded-xl border border-gray-200 data-[selected=true]:bg-[#328E6E] data-[selected=true]:border-[#328E6E] cursor-pointer px-3 py-2 transition-colors",
                        label: "text-sm font-medium text-gray-700 group-data-[selected=true]:text-white",
                        wrapper: "hidden",
                      }}
                    >
                      {day.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </div>

              {/* Time Input */}
              <Input
                type="time"
                label={(t('recurringTime') as string) || 'Time to post'}
                value={recurringTime}
                onValueChange={setRecurringTime}
                variant="bordered"
                classNames={{
                  inputWrapper: "border-gray-300 data-[hover=true]:border-[#328E6E] group-data-[focus=true]:border-[#328E6E]",
                }}
              />
            </div>
          )}
        </ModalBody>

        <ModalFooter className="pt-2 gap-2">
          <Button variant="flat" onPress={onClose} className="text-gray-600">
            {t('cancel')}
          </Button>
          <Button
            className="bg-[#328E6E] text-white hover:bg-[#15803d]"
            onPress={handleSubmit}
            isLoading={loading || uploading}
          >
            {t('save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
