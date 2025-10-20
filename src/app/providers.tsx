'use client'
// app/providers.tsx

import {HeroUIProvider} from '@heroui/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </AuthProvider>
    </HeroUIProvider>
  )
}