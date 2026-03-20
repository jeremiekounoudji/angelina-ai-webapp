"use client";

import { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Textarea, Select, SelectItem,
  Checkbox, CheckboxGroup,
} from "@heroui/react";
import { useStatus } from "@/hooks/useStatus";
import { useUpload } from "@/hooks/useUpload";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { StatusTextFields } from "./StatusTextFields";

interface AddStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onCreated?: () => void;
}

export function AddStatusModal({ isOpen, onClose, companyId, onCreated }: AddStatusModalProps) {
  const { t } = useTranslationNamespace('dashboard.status');
  const { createStatus } = useStatus(companyId);
  const { upload, uploading } = useUpload();

  const [statusType, setStatusType] = useState<"text" | "image" | "audio">("text");
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#008000");
  const [font, setFont] = useState("1");
  // const [allContacts, setAllContacts] = useState(true); // Commented out - always true
  const [statusJidList] = useState<string[]>([""]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaUploaded, setMediaUploaded] = useState(false); // locks media once uploaded to Supabase
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
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isAudio && !isVideo) { toast.error(t('errors.invalidFileType')); return; }
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 90) { toast.error(t('errors.videoTooLong')); return; }
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        setStatusType('image');
      };
      video.src = URL.createObjectURL(file);
    } else {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setStatusType(isAudio ? 'audio' : 'image');
    }
  };

  const clearMedia = () => { setMediaFile(null); setMediaPreview(""); setMediaUploaded(false); setStatusType("text"); };

  const handleSubmit = async () => {
    const allContacts = true; // Always true - switch commented out
    if (statusType === "text" && !text) { toast.error(t('errors.textOrMediaRequired')); return; }
    if (statusType !== "text" && !mediaFile) { toast.error(t('errors.mediaRequired')); return; }
    // if (!allContacts && statusJidList.filter(j => j.trim()).length === 0) {
    //   toast.error(t('errors.jidListRequired')); return;
    // }
    if (scheduleType === "datetime" && !publishmentDatetime) { toast.error(t('errors.datetimeRequired')); return; }
    if (scheduleType === "frequency") {
      if (selectedDays.length === 0) { toast.error(t('errors.frequencyRequired')); return; }
      if (!recurringTime) { toast.error((t('errors.timeRequired') as string) || 'Time is required'); return; }
    }

    try {
      setLoading(true);
      let mediaUrl = "";
      if (mediaFile) {
        const uploadResult = await upload({ bucket: "status", files: [mediaFile] });
        if (!uploadResult.success || uploadResult.urls.length === 0) { toast.error(t('errors.uploadFailed')); return; }
        mediaUrl = uploadResult.urls[0];
        setMediaPreview(mediaUrl);
        setMediaUploaded(true);
      }

      let nextPostAt: string | undefined;
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

      await createStatus({
        company_id: companyId,
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
        next_post_at: nextPostAt,
        publishing_status: "pending",
      });

      onCreated?.();
      handleClose();
    } catch (error) {
      console.error("Error creating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatusType("text"); setText(""); setCaption(""); setBackgroundColor("#008000");
    setFont("1"); /* setAllContacts(true); */
    setMediaFile(null); setMediaPreview(""); setMediaUploaded(false); setPosition("1");
    setScheduleType("frequency"); setPublishmentDatetime(""); setSelectedDays([]); setRecurringTime("");
    onClose();
  };

  const inputClass = { inputWrapper: "border-gray-300 data-[hover=true]:border-[#091413] group-data-[focus=true]:border-[#091413]" };
  const selectClass = { trigger: "border-gray-300 data-[hover=true]:border-[#091413]" };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          <h3 className="text-lg font-semibold">{t('addStatus')}</h3>
          <p className="text-sm font-normal text-gray-500">{t('description')}</p>
        </ModalHeader>

        <ModalBody className="space-y-5 py-4">
          {/* Status Type */}
          <Select
            label={t('statusType')}
            selectedKeys={[statusType]}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as "text" | "image" | "audio";
              setStatusType(val);
              if (val === "text") { setMediaFile(null); setMediaPreview(""); }
            }}
            variant="bordered"
            classNames={selectClass}
          >
            <SelectItem key="text">{t('typeText')}</SelectItem>
            <SelectItem key="image">{t('typeImage')}</SelectItem>
            <SelectItem key="audio">{t('typeAudio')}</SelectItem>
          </Select>

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

          {/* Image / Audio type */}
          {(statusType === "image" || statusType === "audio") && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">{t('media')}</label>
              {!mediaPreview ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#091413] transition-all">
                  <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">{t('mediaHint')}</p>
                  <input
                    type="file"
                    accept={statusType === "audio" ? "audio/*" : "image/*,video/*"}
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                  {statusType === "audio" ? (
                    <div className="flex items-center justify-center h-full px-4">
                      <audio src={mediaPreview} controls className="w-full" />
                    </div>
                  ) : (mediaFile?.type.startsWith('image/') || mediaUploaded) ? (
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={mediaPreview} className="w-full h-full object-cover" controls />
                  )}
                  {/* Only allow clearing before upload */}
                  {!mediaUploaded && (
                    <button
                      onClick={clearMedia}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
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
              type="number" label={t('position')} placeholder="1"
              value={position} onValueChange={setPosition} min="1"
              variant="bordered" classNames={inputClass}
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
          <Button variant="flat" onPress={handleClose} className="text-gray-600">{t('cancel')}</Button>
          <Button
            className="bg-[#091413] text-white hover:bg-[#15803d]"
            onPress={handleSubmit} isLoading={loading || uploading}
          >
            {t('create')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
