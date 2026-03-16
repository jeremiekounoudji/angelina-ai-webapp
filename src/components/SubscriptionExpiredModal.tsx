'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscriptionGuard } from '@/contexts/SubscriptionGuardContext'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

const ALLOWED_PATHS = ['/dashboard/subscription', '/dashboard/settings']

export function SubscriptionExpiredModal() {
  const { isExpired, expiryDate } = useSubscriptionGuard()
  const { signOut } = useAuth()
  const { t } = useTranslationNamespace('dashboard.subscriptionExpired')
  const router = useRouter()
  const pathname = usePathname()

  const isAllowedPage = ALLOWED_PATHS.some(p => pathname.startsWith(p))

  if (!isExpired || isAllowedPage) return null

  const formattedDate = expiryDate
    ? expiryDate.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })
    : ''

  const message = (t('message') as string).replace('{date}', formattedDate)

  return (
    // Full-screen overlay — no pointer events on backdrop so it can't be dismissed
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {t('title') as string}
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            {message}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/dashboard/subscription')}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {t('goToSubscription') as string}
            </button>

            <button
              onClick={() => router.push('/dashboard/settings')}
              className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {t('goToSettings') as string}
            </button>

            <button
              onClick={signOut}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
            >
              {t('signOut') as string}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
