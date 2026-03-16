'use client'

import { EnvelopeIcon, PhoneIcon, ChatBubbleLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@aangelinaai.com'
const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? ''
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? ''

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { t } = useTranslationNamespace('dashboard.support')

  if (!isOpen) return null

  const channels = [
    {
      label: t('email'),
      icon: EnvelopeIcon,
      href: `mailto:${SUPPORT_EMAIL}`,
      value: SUPPORT_EMAIL,
      color: 'text-blue-600',
      bg: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      label: t('whatsapp'),
      icon: ChatBubbleLeftEllipsisIcon,
      href: `https://wa.me/${SUPPORT_WHATSAPP}`,
      value: `+${SUPPORT_WHATSAPP}`,
      color: 'text-green-600',
      bg: 'bg-green-50 hover:bg-green-100',
    },
    {
      label: t('call'),
      icon: PhoneIcon,
      href: `tel:${SUPPORT_PHONE}`,
      value: SUPPORT_PHONE,
      color: 'text-purple-600',
      bg: 'bg-purple-50 hover:bg-purple-100',
    },
  ]

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t('modalTitle')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{t('modalSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Channels */}
        <div className="px-6 pb-6 space-y-3">
          {channels.map((ch) => {
            const Icon = ch.icon
            return (
              <a
                key={ch.label}
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${ch.bg}`}
              >
                <div className={`flex-shrink-0 ${ch.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${ch.color}`}>{ch.label}</p>
                  <p className="text-xs text-gray-500 truncate">{ch.value}</p>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
