'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
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
    <div className="bg-background rounded-lg  border-secondary shadow-lg shadow-secondary/20 flex flex-col h-full">
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-end p-4">
        <Button
          isIconOnly
          variant="light"
          size="sm"
          onPress={() => setIsOpen(false)}
          className="text-gray-200 hover:text-white"
        >
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Company Card */}
      <div className="p-4 border-b border-secondary">
        <Card className="shadow-lg shadow-secondary/20 bg-background border border-secondary">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar
                src={company?.avatar_url}
                name={company?.name || 'Company'}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {company?.name || 'Loading...'}
                </h3>
                <p className="text-xs text-gray-50 capitalize">
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
          </CardBody>
        </Card>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-primary text-white border-r-2 border-primary shadow-md shadow-secondary/20'
                  : 'text-gray-50 hover:text-white hover:bg-secondary/50'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-4 border-t border-secondary">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar
            name={user?.email || 'User'}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-50">Admin</p>
          </div>
        </div>
        <Button
          variant="light"
          color="danger"
          size="sm"
          className="w-full justify-start text-gray-50 hover:text-white"
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
        variant="light"
        size="sm"
        onPress={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-background text-white hover:bg-secondary border border-secondary shadow-lg shadow-secondary/20"
      >
        <Bars3Icon className="w-5 h-5" />
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 m-1 h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" />
      )}

      {/* Mobile Drawer */}
      <div
        id="mobile-sidebar"
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
      
    </>
  )
}
   