"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button, Input, Textarea, Select, SelectItem,
  Checkbox, CheckboxGroup, Card, CardBody,
} from "@heroui/react";
import { ArrowLeftIcon, PhotoIcon, XMarkIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useStatus } from "@/hooks/useStatus";
import { useUpload } from "@/hooks/useUpload";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { StatusTextFields } from "../components/StatusTextFields";
import { MediaPreviewModal } from "../components/VideoPlayerModal";
import toast from "react-hot-toast";

export default function AddStatusPage() {
  const router = useRouter();
  const { company } = useAuth();
  const { t } = useTranslationNamespace("dashboard.status");
  const { createStatus } = useStatus(company?.id);
  const { upload, uploading, progress, generateThumbnail } = useUpload();

  const [statusType, setStatusType] = useState<"text" | "image" | "audio">("text");
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#008000");
  const [font, setFont] = useState("1");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | null>(null);
  const [mediaUploaded, setMediaUploaded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [position, setPosition] = useState("1");
  const [scheduleType, setScheduleType] = useState<"datetime" | "frequency">("frequency");
  const [publishmentDatetime, setPublishmentDatetime] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [recurringTime, setRecurringTime] = useState("");
  const [loading, setLoading] = useState(false);

  const weekDays = [
    { value: "1", label: t("days.monday") },
    { value: "2", label: t("days.tuesday") },
    { value: "3", label: t("days.wednesday") },
    { value: "4", label: t("days.thursday") },
    { value: "5", label: t("days.friday") },
    { value: "6", label: t("days.saturday") },
    { value: "7", label: t("days.sunday") },
  ];

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isAudio = file.type.startsWith("audio/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isAudio && !isVideo) { toast.error(t("errors.invalidFileType")); return; }
    if (isVideo) {
      const video = document.createElement("video");
      video.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        if (video.duration > 90) { toast.error(t("errors.videoTooLong")); URL.revokeObjectURL(objectUrl); return; }
        setMediaFile(file); setMediaType("video"); setMediaPreview(objectUrl); setStatusType("image");
      };
      video.onerror = () => { setMediaFile(file); setMediaType("video"); setMediaPreview(objectUrl); setStatusType("image"); };
      video.src = objectUrl;
    } else {
      setMediaFile(file);
      setMediaType(isAudio ? "audio" : "image");
      setMediaPreview(URL.createObjectURL(file));
      setStatusType(isAudio ? "audio" : "image");
    }
  };

  const clearMedia = () => {
    setMediaFile(null); setMediaPreview(""); setMediaType(null);
    setMediaUploaded(false); setStatusType("text");
  };

  const handleSubmit = async () => {
    if (statusType === "text" && !text) { toast.error(t("errors.textOrMediaRequired")); return; }
    if (statusType !== "text" && !mediaFile) { toast.error(t("errors.mediaRequired")); return; }
    if (scheduleType === "datetime" && !publishmentDatetime) { toast.error(t("errors.datetimeRequired")); return; }
    if (scheduleType === "datetime" && publishmentDatetime && new Date(publishmentDatetime) <= new Date()) {
      toast.error(t("errors.pastDatetime")); return;
    }
    if (scheduleType === "frequency") {
      if (selectedDays.length === 0) { toast.error(t("errors.frequencyRequired")); return; }
      if (!recurringTime) { toast.error((t("errors.timeRequired") as string) || "Time is required"); return; }
    }

    try {
      setLoading(true);
      let mediaUrl = "";
      let thumbnailUrl = "";

      if (mediaFile) {
        const uploadResult = await upload({ bucket: "status", files: [mediaFile] });
        if (!uploadResult.success || uploadResult.urls.length === 0) { toast.error(t("errors.uploadFailed")); return; }
        mediaUrl = uploadResult.urls[0];
        setMediaPreview(mediaUrl);
        setMediaUploaded(true);

        if (mediaType === "video") {
          try {
            const thumbnailBlob = await generateThumbnail(mediaFile, 2);
            const thumbnailFile = new File([thumbnailBlob], `thumb-${Date.now()}.jpg`, { type: "image/jpeg" });
            const thumbResult = await upload({ bucket: "status", files: [thumbnailFile], path: "thumbnails" });
            if (thumbResult.success && thumbResult.urls.length > 0) thumbnailUrl = thumbResult.urls[0];
          } catch (err) { console.error("Thumbnail generation failed:", err); }
        }
      }

      let nextPostAt: string | undefined;
      if (scheduleType === "datetime") {
        nextPostAt = new Date(publishmentDatetime).toISOString();
      } else if (scheduleType === "frequency" && selectedDays.length > 0 && recurringTime) {
        const now = new Date();
        const sortedDays = selectedDays.map(d => parseInt(d)).sort((a, b) => a - b);
        const currentDay = now.getDay() === 0 ? 7 : now.getDay();
        const [hours, minutes] = recurringTime.split(":").map(Number);
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
        company_id: company?.id || "",
        status_type: mediaType === "video" ? "video" : statusType,
        text: statusType === "text" ? text || undefined : undefined,
        caption: statusType !== "text" ? caption || undefined : undefined,
        media_url: mediaUrl || undefined,
        thumbnail_url: thumbnailUrl || undefined,
        background_color: statusType === "text" ? backgroundColor || "#008000" : undefined,
        font: statusType === "text" ? parseInt(font) : undefined,
        all_contacts: true,
        status_jid_list: [],
        position: parseInt(position),
        publishment_datetime: scheduleType === "datetime" ? publishmentDatetime : undefined,
        frequency: scheduleType === "frequency" ? selectedDays.map(d => parseInt(d)) : undefined,
        recurring_time: scheduleType === "frequency" ? recurringTime + ":00" : undefined,
        next_post_at: nextPostAt,
        publishing_status: "pending",
      });

      router.push("/dashboard/status");
    } catch (error) {
      console.error("Error creating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = { inputWrapper: "border-gray-300 data-[hover=true]:border-[#091413] group-data-[focus=true]:border-[#091413]" };
  const selectClass = { trigger: "border-gray-300 data-[hover=true]:border-[#091413]" };

  return (
    <>
      <div className="p-6 bg-white min-h-screen">
        {/* Page header — matches other dashboard pages */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            isIconOnly variant="light" size="sm"
            onPress={() => router.push("/dashboard/status")}
            className="text-gray-600 hover:text-gray-900 shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("addStatus")}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t("description")}</p>
          </div>
        </div>

        {/* Two-column layout on lg+, single column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — content & media (takes 2/3 on desktop) */}
          <div className="lg:col-span-2 space-y-5">
            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-5 space-y-5">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("statusType")}</h2>

                <Select
                  label={t("statusType")}
                  selectedKeys={[statusType]}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as "text" | "image" | "audio";
                    setStatusType(val);
                    if (val === "text") clearMedia();
                  }}
                  variant="bordered"
                  classNames={selectClass}
                >
                  <SelectItem key="text">{t("typeText")}</SelectItem>
                  <SelectItem key="image">Image / Vidéo</SelectItem>
                  <SelectItem key="audio">{t("typeAudio")}</SelectItem>
                </Select>

                {statusType === "text" && (
                  <StatusTextFields
                    text={text} onTextChange={setText}
                    backgroundColor={backgroundColor} onColorChange={setBackgroundColor}
                    font={font} onFontChange={setFont}
                  />
                )}

                {statusType !== "text" && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">{t("media")}</label>
                    {!mediaFile ? (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#091413] transition-all">
                        <PhotoIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">{t("mediaHint")}</p>
                        <input type="file" accept={statusType === "audio" ? "audio/*" : "image/*,video/*"} onChange={handleMediaChange} className="hidden" />
                      </label>
                    ) : mediaType === "audio" ? (
                      <div className="flex items-center justify-center h-24 px-4 bg-gray-100 rounded-xl">
                        <audio src={mediaPreview} controls className="w-full" />
                      </div>
                    ) : mediaType === "video" ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <button type="button" onClick={() => mediaPreview && setPreviewOpen(true)}
                          className="shrink-0 w-10 h-10 rounded-full bg-[#091413] flex items-center justify-center hover:bg-[#15803d] transition-colors">
                          <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{mediaFile.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Vidéo · {mediaFile.size < 1024 * 1024 ? `${(mediaFile.size / 1024).toFixed(0)} KB` : `${(mediaFile.size / (1024 * 1024)).toFixed(1)} MB`}
                          </p>
                        </div>
                        {!mediaUploaded && (
                          <button type="button" onClick={clearMedia} className="shrink-0 p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                        <div className="h-48 flex items-center justify-center bg-black cursor-pointer" onClick={() => setPreviewOpen(true)}>
                          <img src={mediaPreview} alt="Preview" className="h-full w-auto object-contain" />
                        </div>
                        {!mediaUploaded && (
                          <button type="button" onClick={clearMedia} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white z-10">
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                    <Textarea label={t("caption")} placeholder={t("captionPlaceholder")} value={caption} onValueChange={setCaption} maxRows={3} variant="bordered" classNames={inputClass} />
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right column — scheduling & actions (1/3 on desktop, full width on mobile) */}
          <div className="space-y-5">
            <Card className="border border-gray-200 shadow-sm">
              <CardBody className="p-5 space-y-5">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("scheduleType")}</h2>

                {/* Position + Schedule type side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number" label={t("position")} placeholder="1"
                    value={position} onValueChange={setPosition} min="1"
                    variant="bordered" classNames={inputClass}
                  />
                  <Select
                    label={t("scheduleType")} selectedKeys={[scheduleType]}
                    onSelectionChange={(keys) => setScheduleType(Array.from(keys)[0] as "datetime" | "frequency")}
                    variant="bordered" classNames={selectClass}
                  >
                    <SelectItem key="frequency">{t("recurring")}</SelectItem>
                    <SelectItem key="datetime">{t("oneTime")}</SelectItem>
                  </Select>
                </div>

                {scheduleType === "datetime" && (
                  <Input
                    type="datetime-local" label={t("publishmentDatetime")}
                    value={publishmentDatetime} onValueChange={setPublishmentDatetime}
                    variant="bordered" classNames={inputClass}
                  />
                )}

                {scheduleType === "frequency" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">{t("selectDays")}</label>
                      <CheckboxGroup
                        value={selectedDays} onValueChange={setSelectedDays}
                        orientation="horizontal" classNames={{ wrapper: "gap-1.5 flex-wrap" }}
                      >
                        {weekDays.map((day) => (
                          <Checkbox key={day.value} value={day.value} classNames={{
                            base: "inline-flex m-0 bg-gray-100 hover:bg-gray-200 items-center justify-center rounded-lg border border-gray-200 data-[selected=true]:bg-[#091413] data-[selected=true]:border-[#091413] cursor-pointer px-2.5 py-1.5 transition-colors",
                            label: "text-xs font-medium text-gray-700 group-data-[selected=true]:text-white",
                            wrapper: "hidden",
                          }}>
                            {day.label}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </div>
                    <Input
                      type="time" label={(t("recurringTime") as string) || "Time to post"}
                      value={recurringTime} onValueChange={setRecurringTime}
                      variant="bordered" classNames={inputClass}
                    />
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <Button
                className="bg-[#091413] text-white hover:bg-[#15803d] w-full"
                onPress={handleSubmit}
                isLoading={loading || uploading}
              >
                {uploading ? `${progress}%` : t("create")}
              </Button>
              <Button
                variant="flat" onPress={() => router.push("/dashboard/status")}
                className="text-gray-600 w-full"
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MediaPreviewModal
        isOpen={previewOpen && !!mediaPreview && (mediaType === "image" || mediaType === "video")}
        onClose={() => setPreviewOpen(false)}
        src={mediaPreview || ""}
        type={mediaType === "video" ? "video" : "image"}
      />
    </>
  );
}
