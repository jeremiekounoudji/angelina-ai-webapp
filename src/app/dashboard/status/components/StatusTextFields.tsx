"use client";

// Shared sub-component used by both AddStatusModal and EditStatusModal
// Handles: background color picker (predefined grid), font selector (no preview)

import { Textarea } from "@heroui/react";
import { useTranslationNamespace } from "@/contexts/TranslationContext";
import { CheckIcon } from "@heroicons/react/24/outline";

// CSS font-family strings that map to Evolution API font IDs
export const FONT_OPTIONS = [
  { value: "1", label: "Serif",        family: "serif" },
  { value: "2", label: "Norican",      family: "'Norican', cursive" },
  { value: "3", label: "Bryndan Write",family: "'Bryndan Write', cursive" },
  { value: "4", label: "Bebas Neue",   family: "'Bebas Neue', sans-serif" },
  { value: "5", label: "Oswald Heavy", family: "'Oswald', sans-serif" },
];

const PRESET_COLORS = [
  "#008000", "#22c55e", "#16a34a", "#15803d",
  "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af",
  "#ef4444", "#dc2626", "#b91c1c", "#991b1b",
  "#f97316", "#ea580c", "#c2410c", "#9a3412",
  "#a855f7", "#9333ea", "#7c3aed", "#6d28d9",
  "#ec4899", "#db2777", "#be185d", "#9d174d",
  "#eab308", "#ca8a04", "#a16207", "#854d0e",
  "#0ea5e9", "#0284c7", "#0369a1", "#075985",
  "#14b8a6", "#0d9488", "#0f766e", "#115e59",
  "#6b7280", "#4b5563", "#374151", "#1f2937",
  "#000000", "#ffffff",
];

interface StatusTextFieldsProps {
  text: string;
  onTextChange: (v: string) => void;
  backgroundColor: string;
  onColorChange: (hex: string) => void;
  font: string;
  onFontChange: (v: string) => void;
}

export function StatusTextFields({
  text, onTextChange,
  backgroundColor, onColorChange,
  font, onFontChange,
}: StatusTextFieldsProps) {
  const { t } = useTranslationNamespace('dashboard.status');

  const inputClass = {
    inputWrapper: "border-gray-300 data-[hover=true]:border-[#091413] group-data-[focus=true]:border-[#091413]",
  };

  return (
    <>
      {/* Text content */}
      <Textarea
        label={t('text')}
        placeholder={t('textPlaceholder')}
        value={text}
        onValueChange={onTextChange}
        maxRows={4}
        variant="bordered"
        classNames={inputClass}
      />

      {/* Background color picker — predefined grid */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{t('backgroundColor')}</label>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <div className="grid grid-cols-10 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onColorChange(color)}
                title={color}
                className="relative w-7 h-7 rounded-md border border-black/10 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#091413]"
                style={{ backgroundColor: color }}
              >
                {backgroundColor === color && (
                  <CheckIcon
                    className="absolute inset-0 m-auto w-4 h-4"
                    style={{ color: color === "#ffffff" ? "#000" : "#fff", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}
                  />
                )}
              </button>
            ))}
          </div>
          {/* Selected color display + hex input */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg border border-black/10 shrink-0"
              style={{ backgroundColor }}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) onColorChange(val);
              }}
              className="flex-1 text-sm font-mono text-gray-700 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#091413]"
              maxLength={7}
              placeholder="#000000"
            />
          </div>
        </div>
      </div>

      {/* Font selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{t('font')}</label>
        <div className="grid grid-cols-1 gap-2">
          {FONT_OPTIONS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => onFontChange(f.value)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                font === f.value
                  ? "border-[#091413] bg-[#091413]/5"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-xs text-gray-500 w-24 shrink-0">{f.label}</span>
              <span
                className="text-base text-gray-800 flex-1 text-right"
                style={{ fontFamily: f.family }}
              >
                Hello World
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
