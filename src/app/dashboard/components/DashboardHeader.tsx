'use client'

import { usePathname } from 'next/navigation'
import { Card } from '@heroui/react'

const pageNames: Record<string, string> = {
  '/dashboard/company': 'Company Profile',
  '/dashboard/users': 'Team Management',
  '/dashboard/subscription': 'Subscription & Billing',
  '/dashboard/products': 'Product Management'
}

export function DashboardHeader() {
  const pathname = usePathname()
  const pageName = pageNames[pathname] || 'Dashboard'

  return (
    <Card className="m-4 mb-0 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-100">{pageName}</h1>
      </div>
    </Card>
  )
}