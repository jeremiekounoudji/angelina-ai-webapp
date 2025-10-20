'use client'

import { createContext, useContext } from 'react'
import { SubscriptionPlan, Payment } from '@/types/database'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { usePayments } from '@/hooks/usePayments'

interface SubscriptionContextType {
  plans: SubscriptionPlan[]
  payments: Payment[]
  loading: boolean
  error: string | null
  refetchPlans: () => void
  refetchPayments: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { 
    plans, 
    loading: plansLoading, 
    error: plansError, 
    refetch: refetchPlans 
  } = useSubscriptions()
  
  const { 
    payments, 
    loading: paymentsLoading, 
    error: paymentsError, 
    refetch: refetchPayments 
  } = usePayments()

  const loading = plansLoading || paymentsLoading
  const error = plansError || paymentsError

  return (
    <SubscriptionContext.Provider
      value={{
        plans,
        payments,
        loading,
        error,
        refetchPlans,
        refetchPayments
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider')
  }
  return context
}