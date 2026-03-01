"use client";

import { useState } from "react";
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
import toast from "react-hot-toast";

interface AddStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export function AddStatusModal({ isOpen, onClose, companyId }: AddStatusModalProps) {
  const { t } = useTranslationNamespace('dashboard.status');
  const { createStatus } = useStatus(companyId);
  const { upload, uploading } = useUpload();
  
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [position, setPosition] = useState("1");
  const [scheduleType, setScheduleType] = useState<"datetime" | "frequency">("frequency");
  const [publishmentDatetime, setPublishmentDatetime] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [recurringTime, setRecurringTime] = useState("");
  const [loading, setLoading] = useState(false);

  const weekDays = [
    { value: "1", label: t('days.monday') },
    { value: "2", label: t('days.tuesday') },
    { value: "3", label: t('days.wednesday') },
    { value: "4", label: t('days.thursday') },
    { value: "5", label: t('days.friday') },
    { value: "6", label: t('days.saturday') },
    { value: "7", label: t('days.sunday') },
  ];

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast.error(t('errors.invalidFileType'));
      return;
    }

    // Validate video duration (max 1 minute)
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

  const handleSubmit = async () => {
    if (!text && !mediaFile) {
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

      let mediaUrl = "";
      if (mediaFile) {
        const uploadResult = await upload({ bucket: "status", files: [mediaFile] });
        if (!uploadResult.success || uploadResult.urls.length === 0) {
          toast.error(t('errors.uploadFailed'));
          return;
        }
        mediaUrl = uploadResult.urls[0];
      }

      let nextPostAt: string | undefined = undefined;
      
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

      const statusData = {
        company_id: companyId,
        text: text || undefined,
        media_url: mediaUrl || undefined,
        position: parseInt(position),
        publishment_datetime: scheduleType === "datetime" ? publishmentDatetime : undefined,
        frequency: scheduleType === "frequency" ? selectedDays.map(d => parseInt(d)) : undefined,
        recurring_time: scheduleType === "frequency" ? recurringTime + ":00" : undefined,
        next_post_at: nextPostAt,
        publishing_status: "pending" as const,
      };

      await createStatus(statusData);
      handleClose();
    } catch (error) {
      console.error("Error creating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText("");
    setMediaFile(null);
    setMediaPreview("");
    setPosition("1");
    setScheduleType("frequency");
    setPublishmentDatetime("");
    setSelectedDays([]);
    setRecurringTime("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader>{t('addStatus')}</ModalHeader>
        <ModalBody className="space-y-4">
          {/* Text Input */}
          <Textarea
            label={t('text')}
            placeholder={t('textPlaceholder')}
            value={text}
            onValueChange={setText}
            maxRows={4}
          />

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('media')}</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-green-50 file:text-green-700
                hover:file:bg-green-100"
            />
            {mediaPreview && (
              <div className="mt-2 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                {mediaFile?.type.startsWith('image/') ? (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaPreview} className="w-full h-full object-cover" controls />
                )}
              </div>
            )}
            <p className="text-xs text-gray-500">{t('mediaHint')}</p>
          </div>

          {/* Position */}
          <Input
            type="number"
            label={t('position')}
            placeholder="1"
            value={position}
            onValueChange={setPosition}
            min="1"
          />

          {/* Schedule Type */}
          <Select
            label={t('scheduleType')}
            selectedKeys={[scheduleType]}
            onSelectionChange={(keys) => setScheduleType(Array.from(keys)[0] as "datetime" | "frequency")}
          >
            <SelectItem key="frequency">
              {t('recurring')}
            </SelectItem>
            <SelectItem key="datetime">
              {t('oneTime')}
            </SelectItem>
          </Select>

          {/* Datetime Picker */}
          {scheduleType === "datetime" && (
            <Input
              type="datetime-local"
              label={t('publishmentDatetime')}
              value={publishmentDatetime}
              onValueChange={setPublishmentDatetime}
            />
          )}

          {/* Frequency Selector */}
          {scheduleType === "frequency" && (
            <>
              <CheckboxGroup
                label={t('selectDays')}
                value={selectedDays}
                onValueChange={setSelectedDays}
              >
                {weekDays.map((day) => (
                  <Checkbox key={day.value} value={day.value}>
                    {day.label}
                  </Checkbox>
                ))}
              </CheckboxGroup>

              <Input
                type="time"
                label={(t('recurringTime') as string) || 'Time to post'}
                value={recurringTime}
                onValueChange={setRecurringTime}
              />
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            color="success"
            onPress={handleSubmit}
            isLoading={loading || uploading}
          >
            {t('create')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
