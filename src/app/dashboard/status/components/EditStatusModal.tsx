"use client";

import { useState, useEffect } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Textarea, Select, SelectItem,
  Checkbox, CheckboxGroup,
} from "@heroui/react";
import { useStatus } from "@/hooks/useStatus";
import { useUpload } from "@/hooks/useUpload";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { Status } from "@/types/database";
import { PhotoIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { StatusTextFields } from "./StatusTextFields";

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

  const [statusType, setStatusType] = useState<"text" | "image" | "video" | "audio">(status.status_type);
  const [text, setText] = useState(status.text || "");
  const [caption, setCaption] = useState(status.caption || "");
  const [backgroundColor, setBackgroundColor] = useState(status.background_color || "#008000");
  const [font, setFont] = useState(status.font?.toString() || "1");
  // const [allContacts, setAllContacts] = useState(status.all_contacts ?? true); // Commented out - always true
  const [statusJidList] = useState<string[]>(
    status.status_jid_list?.length ? status.status_jid_list : [""]
  );
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

  useEffect(() => {
    setStatusType(status.status_type);
    setText(status.text || "");
    setCaption(status.caption || "");
    setBackgroundColor(status.background_color || "#008000");
    setFont(status.font?.toString() || "1");
    // setAllContacts(status.all_contacts ?? true); // Commented out - always true
    setMediaFile(null);
    setMediaPreview(status.media_url || "");
    setPosition(status.position.toString());
    setScheduleType(status.publishment_datetime ? "datetime" : "frequency");
    setPublishmentDatetime(
      status.publishment_datetime ? new Date(status.publishment_datetime).toISOString().slice(0, 16) : ""
    );
    setSelectedDays(status.frequency?.map(d => d.toString()) || []);
    setRecurringTime(status.recurring_time ? status.recurring_time.slice(0, 5) : "");
  }, [status]);

  const weekDays = [
    { value: "1", label: t('days.monday') },
    { value: "2", label: t('days.tuesday') },
    { value: "3", label: t('days.wednesday') },
    { value: "4", label: t('days.thursday') },
    { value: "5", label: t('days.friday') },
    { value: "6", label: t('days.saturday') },
    { value: "7", label: t('days.sunday') },
  ];

  const handleSubmit = async () => {
    const allContacts = true; // Always true - switch commented out
    if (statusType === "text" && !text) { toast.error(t('errors.textOrMediaRequired')); return; }
    if (statusType !== "text" && !mediaPreview && !mediaFile) { toast.error(t('errors.mediaRequired')); return; }
    // if (!allContacts && statusJidList.filter(j => j.trim()).length === 0) {
    //   toast.error(t('errors.jidListRequired')); return;
    // }
    if (scheduleType === "datetime" && !publishmentDatetime) { toast.error(t('errors.datetimeRequired')); return; }
    if (scheduleType === "datetime" && publishmentDatetime && new Date(publishmentDatetime) <= new Date()) {
      toast.error(t('errors.pastDatetime')); return;
    }
    if (scheduleType === "frequency") {
      if (selectedDays.length === 0) { toast.error(t('errors.frequencyRequired')); return; }
      if (!recurringTime) { toast.error((t('errors.timeRequired') as string) || 'Time is required'); return; }
    }

    try {
      setLoading(true);
      let mediaUrl = mediaPreview && !mediaFile ? status.media_url : undefined;
      if (mediaFile) {
        const uploadResult = await upload({ bucket: "status", files: [mediaFile] });
        if (!uploadResult.success || uploadResult.urls.length === 0) { toast.error(t('errors.uploadFailed')); return; }
        mediaUrl = uploadResult.urls[0];
      }

      let nextPostAt: string | null = null;
      if (scheduleType === "datetime") {
        nextPostAt = new Date(publishmentDatetime).toISOString();
      } else if (scheduleType === "frequency" && selectedDays.length > 0 && recurringTime) {
        const now = new Date();
        const sortedDays = selectedDays.map(d => parseInt(d)).sort((a, b) => a - b);
        const currentDay = now.getDay() === 0 ? 7 : now.getDay();
        const [hours, minutes] = recurringTime.split(':').map(Number);
        const todayPost = new Date(now);
        todayPost.setHours(hours, minutes, 0, 0);
        let daysToAdd = 0;
        if (sortedDays.includes(currentDay) && todayPost > now) {
          daysToAdd = 0;
        } else {
          const nextDay = sortedDays.find(d => d > currentDay) || sortedDays[0];
          daysToAdd = nextDay > currentDay ? nextDay - currentDay : (7 - currentDay) + nextDay;
        }
        const nextDate = new Date(now.getTime() + daysToAdd * 86400000);
        nextDate.setHours(hours, minutes, 0, 0);
        nextPostAt = nextDate.toISOString();
      }

      await updateStatus(status.id, {
        status_type: statusType,
        text: statusType === "text" ? text || undefined : undefined,
        caption: statusType !== "text" ? caption || undefined : undefined,
        media_url: mediaUrl || undefined,
        background_color: statusType === "text" ? backgroundColor : undefined,
        font: statusType === "text" ? parseInt(font) : undefined,
        all_contacts: allContacts,
        status_jid_list: !allContacts ? statusJidList.filter(j => j.trim()) : [],
        position: parseInt(position),
        publishment_datetime: scheduleType === "datetime" ? publishmentDatetime : undefined,
        frequency: scheduleType === "frequency" ? selectedDays.map(d => parseInt(d)) : undefined,
        recurring_time: scheduleType === "frequency" ? recurringTime + ":00" : undefined,
        next_post_at: nextPostAt || undefined,
        publishing_status: "pending",
      });

      onUpdated?.();
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = { inputWrapper: "border-gray-300 data-[hover=true]:border-[#091413] group-data-[focus=true]:border-[#091413]" };
  const selectClass = { trigger: "border-gray-300 data-[hover=true]:border-[#091413]" };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <h3 className="text-lg font-semibold">{t('editStatus')}</h3>
          <p className="text-sm font-normal text-gray-500">{t('description')}</p>
        </ModalHeader>

        <ModalBody className="space-y-5 py-4">
          {/* Warning: changes won't apply to already-posted statuses */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">{t('editWarning')}</p>
          </div>

          {/* Status Type — locked on edit */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('statusType')}</label>
            <div className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-500">
              {statusType === "text" ? t('typeText') : statusType === "image" ? t('typeImage') : statusType === "video" ? t('typeVideo') : t('typeAudio')}
              <span className="ml-2 text-xs text-gray-400">({t('lockedField')})</span>
            </div>
          </div>

          {/* Text type: textarea + live preview + color picker + font picker */}
          {statusType === "text" && (
            <StatusTextFields
              text={text}
              onTextChange={setText}
              backgroundColor={backgroundColor}
              onColorChange={setBackgroundColor}
              font={font}
              onFontChange={setFont}
            />
          )}

          {/* Image / Audio type — media is locked on edit */}
          {(statusType === "image" || statusType === "audio" || statusType === "video") && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                {t('media')}
                <span className="ml-2 text-xs text-gray-400">({t('lockedField')})</span>
              </label>
              {mediaPreview ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                  {statusType === "audio" ? (
                    <div className="flex items-center justify-center h-full px-4">
                      <audio src={mediaPreview} controls className="w-full" />
                    </div>
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              ) : (
                <div className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
                  <PhotoIcon className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <Textarea
                label={t('caption')}
                placeholder={t('captionPlaceholder')}
                value={caption}
                onValueChange={setCaption}
                maxRows={3}
                variant="bordered"
                classNames={inputClass}
              />
            </div>
          )}

          {/* Audience - Commented out, always sends to all contacts */}
          {/* <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('allContacts')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('allContactsHint')}</p>
              </div>
              <Switch isSelected={allContacts} onValueChange={setAllContacts} color="success" />
            </div>
            {!allContacts && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('statusJidList')}</label>
                {statusJidList.map((jid, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="5512345678901@s.whatsapp.net"
                      value={jid}
                      onValueChange={(v) => handleJidChange(index, v)}
                      variant="bordered"
                      size="sm"
                      classNames={inputClass}
                    />
                    {statusJidList.length > 1 && (
                      <Button
                        isIconOnly size="sm" variant="flat"
                        onPress={() => setStatusJidList(statusJidList.filter((_, i) => i !== index))}
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  size="sm" variant="flat"
                  startContent={<PlusIcon className="w-4 h-4" />}
                  onPress={() => setStatusJidList([...statusJidList, ""])}
                >
                  {t('addContact')}
                </Button>
              </div>
            )}
          </div> */}

          {/* Position & Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number" label={t('position')} value={position}
              onValueChange={setPosition} min="1" variant="bordered" classNames={inputClass}
            />
            <Select
              label={t('scheduleType')} selectedKeys={[scheduleType]}
              onSelectionChange={(keys) => setScheduleType(Array.from(keys)[0] as "datetime" | "frequency")}
              variant="bordered" classNames={selectClass}
            >
              <SelectItem key="frequency">{t('recurring')}</SelectItem>
              <SelectItem key="datetime">{t('oneTime')}</SelectItem>
            </Select>
          </div>

          {scheduleType === "datetime" && (
            <Input
              type="datetime-local" label={t('publishmentDatetime')}
              value={publishmentDatetime} onValueChange={setPublishmentDatetime}
              variant="bordered" classNames={inputClass}
            />
          )}

          {scheduleType === "frequency" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('selectDays')}</label>
                <CheckboxGroup
                  value={selectedDays} onValueChange={setSelectedDays}
                  orientation="horizontal" classNames={{ wrapper: "gap-2 flex-wrap" }}
                >
                  {weekDays.map((day) => (
                    <Checkbox key={day.value} value={day.value} classNames={{
                      base: "inline-flex m-0 bg-gray-100 hover:bg-gray-200 items-center justify-center rounded-xl border border-gray-200 data-[selected=true]:bg-[#091413] data-[selected=true]:border-[#091413] cursor-pointer px-3 py-2 transition-colors",
                      label: "text-sm font-medium text-gray-700 group-data-[selected=true]:text-white",
                      wrapper: "hidden",
                    }}>
                      {day.label}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              </div>
              <Input
                type="time" label={(t('recurringTime') as string) || 'Time to post'}
                value={recurringTime} onValueChange={setRecurringTime}
                variant="bordered" classNames={inputClass}
              />
            </div>
          )}
        </ModalBody>

        <ModalFooter className="pt-2 gap-2">
          <Button variant="flat" onPress={onClose} className="text-gray-600">{t('cancel')}</Button>
          <Button
            className="bg-[#091413] text-white hover:bg-[#15803d]"
            onPress={handleSubmit} isLoading={loading || uploading}
          >
            {t('save')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
