'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

export default function DashboardPage() {
  const router = useRouter()
  const { loading } = useAuth()
  const { t } = useTranslationNamespace('dashboard.overview')

  useEffect(() => {
    if (!loading) {
      // Redirect to company tab by default
      router.replace('/dashboard/company')
    }
  }, [router, loading])

  return (
    <div className="flex items-center justify-center h-full bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        <p className="text-gray-50 mt-2">{t('subtitle')}</p>
      </div>
    </div>
  )
}