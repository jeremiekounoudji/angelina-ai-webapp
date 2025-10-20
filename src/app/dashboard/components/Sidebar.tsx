'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Card, 
  CardBody, 
  Avatar, 
  Button, 
  Chip,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@heroui/react'
import { useAuth } from '@/contexts/AuthContext'
import {
  BuildingOfficeIcon,
  UsersIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Company', href: '/dashboard/company', icon: BuildingOfficeIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
  { name: 'Products', href: '/dashboard/products', icon: ShoppingBagIcon },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCardIcon },
]

export function Sidebar() {
  const { user, company, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const getSubscriptionStatus = () => {
    if (!company?.subscription_status) return 'inactive'
    return company.subscription_status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'trial': return 'warning'
      case 'inactive': return 'default'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Company Card */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={company?.avatar_url}
                name={company?.name}
                size="md"
                className="bg-white text-blue-600"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">
                  {company?.name || 'Loading...'}
                </h3>
                <p className="text-blue-100 text-sm capitalize">
                  {company?.type || 'business'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-blue-100 text-sm">Status:</span>
              <Chip
                size="sm"
                color={getStatusColor(getSubscriptionStatus())}
                variant="flat"
                className="capitalize"
              >
                {getSubscriptionStatus()}
              </Chip>
            </div>
          </CardBody>
        </Card>
      </div>

      <Divider />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Button
                  variant={isActive ? 'flat' : 'light'}
                  color={isActive ? 'primary' : 'default'}
                  className="w-full justify-start"
                  startContent={<item.icon className="w-5 h-5" />}
                  onPress={() => router.push(item.href)}
                >
                  {item.name}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      <Divider />

      {/* User Menu */}
      <div className="p-4">
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="light"
              className="w-full justify-between"
              endContent={<ChevronDownIcon className="w-4 h-4" />}
            >
              <div className="flex items-center gap-2">
                <Avatar
                  src={user?.user_metadata?.avatar_url}
                  name={user?.email}
                  size="sm"
                />
                <span className="truncate">{user?.email}</span>
              </div>
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key="settings"
              startContent={<Cog6ToothIcon className="w-4 h-4" />}
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
              onPress={handleSignOut}
            >
              Sign Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  )
}