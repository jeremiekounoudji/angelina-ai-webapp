'use client'

import { DashboardSidebar } from './components/DashboardSidebar'
import { SubscriptionGuardProvider } from '@/contexts/SubscriptionGuardContext'
import { SubscriptionExpiredModal } from '@/components/SubscriptionExpiredModal'
import { WhatsAppSupportButton } from '@/components/WhatsAppSupportButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SubscriptionGuardProvider>
      <div className="min-h-screen bg-white flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0">
          {children}
        </main>
      </div>
      <SubscriptionExpiredModal />
      <WhatsAppSupportButton />
    </SubscriptionGuardProvider>
  )
}
