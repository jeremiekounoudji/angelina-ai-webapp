'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Avatar,
  Chip,
  Button
} from '@heroui/react'
import {
  BuildingOfficeIcon,
  UsersIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, company, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslationNamespace('dashboard.sidebar')

  const navigation = [
    {
      name: t('company'),
      href: '/dashboard/company',
      icon: BuildingOfficeIcon
    },
    {
      name: t('users'),
      href: '/dashboard/users',
      icon: UsersIcon
    },
    {
      name: t('subscription'),
      href: '/dashboard/subscription',
      icon: CreditCardIcon
    },
    {
      name: t('products'),
      href: '/dashboard/products',
      icon: ShoppingBagIcon
    },
    {
      name: t('settings'),
      href: '/dashboard/settings',
      icon: CogIcon
    }
  ]

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'trial': return 'warning'
      case 'inactive': return 'default'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  // Close drawer when route changes on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close drawer when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar')
      const toggle = document.getElementById('sidebar-toggle')
      
      if (isOpen && sidebar && !sidebar.contains(event.target as Node) && 
          toggle && !toggle.contains(event.target as Node)) {
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
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end p-4">
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={() => setIsOpen(false)}
          className="text-white/70 hover:text-white"
        >
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Company Info */}
      <div className="p-4 border-b border-white">
        <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
          <Avatar
            src={company?.avatar_url}
            name={company?.name || 'Company'}
            size="md"
            className="bg-gray-300"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-black truncate">
              {company?.name || 'Loading...'}
            </h3>
            <p className="text-xs text-black capitalize">
              {company?.type || 'N/A'}
            </p>
            <div className="mt-1">
              <Chip
                size="sm"
                color={getStatusColor(company?.subscription_status)}
                variant="flat"
                className="capitalize text-xs"
              >
                {company?.subscription_status || 'inactive'}
              </Chip>
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
                isActive
                  ? 'bg-white text-[#328E6E] shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar
            name={user?.email || 'User'}
            size="sm"
            className="bg-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email}
            </p>
            <p className="text-xs text-white/70">Admin</p>
          </div>
        </div>
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
      {/* Mobile Menu Button */}
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

      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:block fixed left-0 top-0 w-64 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside
        id="mobile-sidebar"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  )
}