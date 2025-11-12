'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Payment, SubscriptionPlan } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { company } = useAuth()
  const supabase = createClient()

  const fetchPayments = useCallback(async () => {
    if (!company?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          subscription_plans!plan_id (
            id,
            title,
            description
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      if (paymentsError) throw paymentsError

      // Transform the data to match our interface
      const transformedPayments: Payment[] = paymentsData?.map((payment: Payment & { subscription_plans?: SubscriptionPlan }) => ({
        ...payment,
        plan: payment.subscription_plans
      })) || []

      setPayments(transformedPayments)
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }, [company?.id, supabase])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments
  }
}