"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button, Input, Textarea, Select, SelectItem,
  Checkbox, CheckboxGroup, Spinner, Card, CardBody,
} from "@heroui/react";
import { ArrowLeftIcon, PhotoIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useStatus } from "@/hooks/useStatus";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { useUpload } from "@/hooks/useUpload";
import { useAppStore } from "@/store";
import { StatusTextFields } from "../../components/StatusTextFields";
import toast from "react-hot-toast";

export default function EditStatusPage() {
  const router = useRouter();
  const { company } = useAuth();
  const { t } = useTranslationNamespace("dashboard.status");
  const { updateStatus } = useStatus(company?.id);
  const { uploading } = useUpload();
  const status = useAppStore(s => s.selectedStatus);

  const [statusType, setStatusType] = useState(status?.status_type ?? "text");
  const [text, setText] = useState(status?.text ?? "");
  const [caption, setCaption] = useState(status?.caption ?? "");
  const [backgroundColor, setBackgroundColor] = useState(status?.background_color ?? "#008000");
  const [font, setFont] = useState(status?.font?.toString() ?? "1");
  const [mediaPreview] = useState(status?.media_url ?? "");
  const [position, setPosition] = useState(status?.position?.toString() ?? "1");
  const [scheduleType, setScheduleType] = useState<"datetime" | "frequency">(
    status?.publishment_datetime ? "datetime" : "frequency"
  );
  const [publishmentDatetime, setPublishmentDatetime] = useState(
    status?.publishment_datetime ? new Date(status.publishment_datetime).toISOString().slice(0, 16) : ""
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    status?.frequency?.map(d => d.toString()) ?? []
  );
  const [recurringTime, setRecurringTime] = useState(
    status?.recurring_time ? status.recurring_time.slice(0, 5) : ""
  );
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

  useEffect(() => {
    if (!status) router.replace("/dashboard/status");
  }, [status, router]);

  const handleSubmit = async () => {
    if (!status) return;
    if (statusType === "text" && !text) { toast.error(t("errors.textOrMediaRequired")); return; }
    if (statusType !== "text" && !mediaPreview) { toast.error(t("errors.mediaRequired")); return; }
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

      let nextPostAt: string | null = null;
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

      await updateStatus(status.id, {
        status_type: statusType,
        text: statusType === "text" ? text || undefined : undefined,
        caption: statusType !== "text" ? caption || undefined : undefined,
        media_url: mediaPreview || undefined,
        background_color: statusType === "text" ? backgroundColor : undefined,
        font: statusType === "text" ? parseInt(font) : undefined,
        all_contacts: true,
        status_jid_list: [],
        position: parseInt(position),
        publishment_datetime: scheduleType === "datetime" ? publishmentDatetime : undefined,
        frequency: scheduleType === "frequency" ? selectedDays.map(d => parseInt(d)) : undefined,
        recurring_time: scheduleType === "frequency" ? recurringTime + ":00" : undefined,
        next_post_at: nextPostAt || undefined,
        publishing_status: "pending",
      });

      router.push("/dashboard/status");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = { inputWrapper: "border-gray-300 data-[hover=true]:border-[#091413] group-data-[focus=true]:border-[#091413]" };
  const selectClass = { trigger: "border-gray-300 data-[hover=true]:border-[#091413]" };

  if (!status) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="success" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          isIconOnly variant="light" size="sm"
          onPress={() => router.push("/dashboard/status")}
          className="text-gray-600 hover:text-gray-900 shrink-0"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("editStatus")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t("description")}</p>
        </div>
      </div>

      {/* Two-column layout on lg+, single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column — content & media */}
        <div className="lg:col-span-2 space-y-5">
          {/* Edit warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">{t("editWarning")}</p>
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-5 space-y-5">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("statusType")}</h2>

              {/* Status type — locked */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{t("statusType")}</label>
                <div className="px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-500">
                  {statusType === "text" ? t("typeText") : statusType === "image" ? t("typeImage") : statusType === "video" ? t("typeVideo") : t("typeAudio")}
                  <span className="ml-2 text-xs text-gray-400">({t("lockedField")})</span>
                </div>
              </div>

              {statusType === "text" && (
                <StatusTextFields
                  text={text} onTextChange={setText}
                  backgroundColor={backgroundColor} onColorChange={setBackgroundColor}
                  font={font} onFontChange={setFont}
                />
              )}

              {(statusType === "image" || statusType === "audio" || statusType === "video") && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    {t("media")}
                    <span className="ml-2 text-xs text-gray-400">({t("lockedField")})</span>
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
                  <Textarea label={t("caption")} placeholder={t("captionPlaceholder")} value={caption} onValueChange={setCaption} maxRows={3} variant="bordered" classNames={inputClass} />
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right column — scheduling & actions */}
        <div className="space-y-5">
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-5 space-y-5">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t("scheduleType")}</h2>

              {/* Position + Schedule type side by side */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number" label={t("position")} value={position}
                  onValueChange={setPosition} min="1"
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
              {t("save")}
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
  );
}
