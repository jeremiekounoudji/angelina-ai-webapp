'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Avatar, Chip, Button } from '@heroui/react'
import {
  BuildingOfficeIcon,
  UsersIcon,
  CreditCardIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscriptionGuard } from '@/contexts/SubscriptionGuardContext'
import { useTranslationNamespace, useTranslation } from '@/contexts/TranslationContext'

interface SidebarContentProps {
  company: ReturnType<typeof useAuth>['company']
  displayName: string
  navigation: { name: string; href: string; icon: React.ElementType }[]
  legalLinks: { name: string; href: string; icon: React.ElementType }[]
  accountStatus: { label: string; color: 'default' | 'danger' | 'warning' | 'success' }
  expiryDate: Date | null
  isExpired: boolean
  locale: string
  pathname: string
  onClose: () => void
  onSignOut: () => void
  onSetLocale: (lang: 'en' | 'fr') => void
  t: (key: string) => string
  tLegal: (key: string) => string
}

function SidebarContent({
  company, displayName, navigation, legalLinks, accountStatus,
  expiryDate, isExpired, locale, pathname,
  onClose, onSignOut, onSetLocale, t, tLegal,
}: SidebarContentProps) {
  return (
    <div className="bg-[#091413] h-full flex flex-col overflow-y-auto">
      {/* Mobile close */}
      <div className="lg:hidden flex justify-end p-4">
        <Button isIconOnly variant="light" size="sm" onPress={onClose} className="text-white/70 hover:text-white">
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Company header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center space-x-3 bg-slate-100 rounded-lg p-3">
          <Avatar src={company?.avatar_url} name={company?.name || 'Company'} size="md" className="bg-gray-300" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-black truncate">{company?.name || 'Loading...'}</h3>
            <p className="text-xs text-black capitalize">{company?.type || 'N/A'}</p>
            <div className="mt-1 flex flex-col gap-0.5">
              <Chip size="sm" color={accountStatus.color} variant="flat" className="capitalize text-xs">
                {accountStatus.label}
              </Chip>
              {expiryDate && !isExpired && (
                <p className="text-[10px] text-gray-400">
                  {expiryDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive ? 'bg-white text-[#091413] shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}

        <div className="pt-2">
          {legalLinks.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all text-white hover:bg-white/10 cursor-pointer"
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </a>
            )
          })}
        </div>

        <button
          onClick={onSignOut}
          className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all text-white hover:bg-white/10 cursor-pointer"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
          {t('logout')}
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar name={displayName} size="sm" className="bg-white/20 text-white flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-white/60">Admin</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="flex items-center bg-white/10 rounded-md p-0.5 gap-0.5">
            {(['en', 'fr'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onSetLocale(lang)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  locale === lang ? 'bg-white text-[#091413]' : 'text-white/70 hover:text-white'
                }`}
                aria-label={`Switch to ${lang.toUpperCase()}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, company, signOut } = useAuth()
  const { isExpired, expiryDate } = useSubscriptionGuard()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslationNamespace('dashboard.sidebar')
  const { t: tLegal } = useTranslationNamespace('dashboard.legal')
  const { locale, setLocale } = useTranslation()

  const firstName = user?.user_metadata?.first_name || ''
  const lastName  = user?.user_metadata?.last_name  || ''
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || user?.email || 'Admin'

  const navigation = [
    { name: t('company'),      href: '/dashboard/company',      icon: BuildingOfficeIcon },
    { name: t('users'),        href: '/dashboard/users',         icon: UsersIcon },
    { name: t('subscription'), href: '/dashboard/subscription',  icon: CreditCardIcon },
    { name: t('status'),       href: '/dashboard/status',        icon: ChatBubbleBottomCenterTextIcon },
    { name: t('settings'),     href: '/dashboard/settings',      icon: CogIcon },
  ]

  const legalLinks = [
    { name: tLegal('terms'),   href: '/terms',   icon: DocumentTextIcon },
    { name: tLegal('privacy'), href: '/privacy', icon: ShieldCheckIcon },
  ]

  const accountStatus = (() => {
    if (!expiryDate) return { label: company?.subscription_status ?? 'inactive', color: 'default' as const }
    const now = new Date()
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (isExpired)     return { label: 'expired',  color: 'danger'  as const }
    if (daysLeft <= 3) return { label: 'expiring', color: 'warning' as const }
    return { label: 'active', color: 'success' as const }
  })()

  useEffect(() => { setIsOpen(false) }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar')
      const toggle  = document.getElementById('sidebar-toggle')
      if (isOpen && sidebar && !sidebar.contains(e.target as Node) &&
          toggle && !toggle.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const sharedProps = {
    company, displayName, navigation, legalLinks, accountStatus,
    expiryDate, isExpired, locale, pathname,
    onClose: () => setIsOpen(false),
    onSignOut: signOut,
    onSetLocale: setLocale,
    t: t as (key: string) => string,
    tLegal: tLegal as (key: string) => string,
  }

  return (
    <>
      <Button
        id="sidebar-toggle"
        isIconOnly
        variant="flat"
        size="sm"
        onPress={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#091413] text-white hover:bg-[#15803d] shadow-lg"
      >
        <Bars3Icon className="w-5 h-5" />
      </Button>

      <aside className="hidden lg:block fixed left-0 top-0 w-64 h-screen z-40">
        <SidebarContent {...sharedProps} />
      </aside>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      <aside
        id="mobile-sidebar"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent {...sharedProps} />
      </aside>
    </>
  )
}
