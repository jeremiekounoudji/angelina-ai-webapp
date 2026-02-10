'use client'

import { usePathname } from 'next/navigation'
import { Card } from '@heroui/react'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

export function DashboardHeader() {
  const pathname = usePathname()
  const { t } = useTranslationNamespace('dashboard.header')

  const getPageName = () => {
    if (pathname.includes('/company')) return t('pageNames.company')
    if (pathname.includes('/users')) return t('pageNames.users')
    if (pathname.includes('/subscription')) return t('pageNames.subscription')
    if (pathname.includes('/products')) return t('pageNames.products')
    if (pathname.includes('/settings')) return t('pageNames.settings')
    return t('pageNames.dashboard')
  }

  return (
    <Card className="m-4 mb-0 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-100">{getPageName()}</h1>
      </div>
    </Card>
  )
}
