'use client'

import { DashboardSidebar } from './components/DashboardSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Fixed Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  )
}