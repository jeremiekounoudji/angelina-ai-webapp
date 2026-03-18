'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Company } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

export function useCompany() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { company, setCompany } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const updateCompany = useCallback(async (updates: Partial<Company>): Promise<Company | null> => {
    if (!company?.id) return null
    try {
      setLoading(true)
      setError(null)
      const { data, error: updateError } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
        .select()
        .single()
      if (updateError) throw updateError
      setCompany(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company')
      return null
    } finally {
      setLoading(false)
    }
  }, [company?.id, supabase, setCompany])

  const deleteCompany = useCallback(async (): Promise<boolean> => {
    if (!company?.id) return false
    try {
      setLoading(true)
      setError(null)
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
      if (deleteError) throw deleteError
      setCompany(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company')
      return false
    } finally {
      setLoading(false)
    }
  }, [company?.id, supabase, setCompany])

  const refreshCompany = useCallback(async () => {
    if (!company?.id) return
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', company.id)
        .single()
      if (fetchError) throw fetchError
      setCompany(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh company')
    } finally {
      setLoading(false)
    }
  }, [company?.id, supabase, setCompany])

  return { company, loading, error, updateCompany, deleteCompany, refreshCompany }
}
