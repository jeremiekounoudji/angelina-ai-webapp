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
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscriptionGuard } from '@/contexts/SubscriptionGuardContext'
import { useTranslationNamespace, useTranslation } from '@/contexts/TranslationContext'
import { SupportModal } from '@/components/SupportModal'

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, company, signOut } = useAuth()
  const { isExpired, expiryDate } = useSubscriptionGuard()
  const [isOpen, setIsOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const { t } = useTranslationNamespace('dashboard.sidebar')
  const { t: tSupport } = useTranslationNamespace('dashboard.support')
  const { t: tLegal } = useTranslationNamespace('dashboard.legal')
  const { locale, setLocale } = useTranslation()

  const navigation = [
    { name: t('company'),      href: '/dashboard/company',      icon: BuildingOfficeIcon },
    { name: t('users'),        href: '/dashboard/users',         icon: UsersIcon },
    { name: t('subscription'), href: '/dashboard/subscription',  icon: CreditCardIcon },
    { name: t('status'),       href: '/dashboard/status',        icon: ChatBubbleBottomCenterTextIcon },
    { name: t('settings'),     href: '/dashboard/settings',      icon: CogIcon },
  ]

  // Derive account status from expiry date
  const accountStatus = (() => {
    if (!expiryDate) return { label: company?.subscription_status ?? 'inactive', color: 'default' as const }
    const now = new Date()
    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (isExpired)        return { label: 'expired',  color: 'danger'  as const }
    if (daysLeft <= 3)    return { label: 'expiring', color: 'warning' as const }
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

  const SidebarContent = () => (
    <div className="bg-[#328E6E] h-full flex flex-col overflow-y-auto">
      {/* Mobile close */}
      <div className="lg:hidden flex justify-end p-4">
        <Button isIconOnly variant="light" size="sm" onPress={() => setIsOpen(false)} className="text-white/70 hover:text-white">
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Company header */}
      <div className="p-4 border-b border-white">
        <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
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
                isActive ? 'bg-white text-[#328E6E] shadow-md' : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Legal section */}
      <div className="px-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1 px-1">
          {tLegal('title')}
        </p>
        <a
          href="/terms"
          target="_blank"
          rel="noreferrer"
          className="flex items-center px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <DocumentTextIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          {tLegal('terms')}
        </a>
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="flex items-center px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ShieldCheckIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          {tLegal('privacy')}
        </a>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {/* Language switcher */}
        <div className="mb-3 flex justify-center">
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
            {(['en', 'fr'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
                  locale === lang ? 'bg-white text-[#328E6E] shadow-sm' : 'text-white hover:bg-white/10'
                }`}
                aria-label={`Switch to ${lang.toUpperCase()}`}
              >
                <span className="text-base">{lang === 'en' ? '🇺🇸' : '🇫🇷'}</span>
                <span className="text-xs font-medium">{lang.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-3">
          <Avatar name={user?.email || 'User'} size="sm" className="bg-white/10" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
            <p className="text-xs text-white/70">Admin</p>
          </div>
        </div>

        {/* Support */}
        <Button
          variant="light"
          size="sm"
          className="w-full justify-start text-white hover:bg-white/10 mb-1"
          startContent={<QuestionMarkCircleIcon className="w-4 h-4" />}
          onPress={() => setSupportOpen(true)}
        >
          {t('support')}
        </Button>

        {/* Sign out */}
        <Button
          variant="light"
          size="sm"
          className="w-full justify-start text-white hover:bg-white/10"
          startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          onPress={signOut}
        >
          {t('logout')}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <Button
        id="sidebar-toggle"
        isIconOnly
        variant="flat"
        size="sm"
        onPress={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#328E6E] text-white hover:bg-[#15803d] shadow-lg"
      >
        <Bars3Icon className="w-5 h-5" />
      </Button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 w-64 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        id="mobile-sidebar"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  )
}
