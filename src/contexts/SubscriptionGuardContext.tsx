'use client'

import { createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface SubscriptionGuardContextType {
  isExpired: boolean
  expiryDate: Date | null
}

const SubscriptionGuardContext = createContext<SubscriptionGuardContextType>({
  isExpired: false,
  expiryDate: null,
})

export function SubscriptionGuardProvider({ children }: { children: React.ReactNode }) {
  const { company } = useAuth()

  const { isExpired, expiryDate } = useMemo(() => {
    if (!company?.subscription_expiry) return { isExpired: false, expiryDate: null }
    const expiry = new Date(company.subscription_expiry)
    return {
      isExpired: expiry < new Date(),
      expiryDate: expiry,
    }
  }, [company?.subscription_expiry])

  return (
    <SubscriptionGuardContext.Provider value={{ isExpired, expiryDate }}>
      {children}
    </SubscriptionGuardContext.Provider>
  )
}

export const useSubscriptionGuard = () => useContext(SubscriptionGuardContext)
