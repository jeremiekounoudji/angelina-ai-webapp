import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { WhatsAppInstance } from '@/types/database'
import toast from 'react-hot-toast'
import { createTranslationFunction, DEFAULT_LOCALE, type Locale } from "@/locales";

function getT() {
  const locale = (typeof window !== 'undefined' ? localStorage.getItem('locale') : null) as Locale | null;
  return createTranslationFunction(locale ?? DEFAULT_LOCALE);
}

export function useWhatsAppConnect() {
  const [isLoading, setIsLoading] = useState(false)
  const [whatsappInstance, setWhatsappInstance] = useState<WhatsAppInstance | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const { company } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const checkExistingInstance = useCallback(async () => {
    if (!company?.id) return

    try {
      const { data } = await supabase
        .from('whatsapp_instances')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setWhatsappInstance(data)
        setConnectionStatus(data.status as 'disconnected' | 'connecting' | 'connected' | 'error')
      }
    } catch {
      // No existing instance — that's fine
    }
  }, [company?.id, supabase])

  useEffect(() => {
    if (company?.id) {
      checkExistingInstance()
    }
  }, [company?.id, checkExistingInstance])

  const updateInstanceStatus = useCallback(async (
    evolutionInstanceId: string,
    status: 'disconnected' | 'connecting' | 'connected' | 'error'
  ) => {
    const { data, error } = await supabase
      .from('whatsapp_instances')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('instance_id', evolutionInstanceId)
      .select()
      .single()

    if (error) {
      // console.error('Failed to update instance status:', error)
      return
    }
    if (data) {
      setWhatsappInstance(data)
      setConnectionStatus(status)
    }
  }, [supabase])

  const connectWhatsApp = useCallback(async (
    phoneNumber: string
  ): Promise<{ pairingCode: string; qrCodeData: string; instanceId: string }> => {
    if (!company?.id) throw new Error('Company not found')

    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
    if (cleanPhoneNumber.length < 10 || cleanPhoneNumber.length > 15) {
      throw new Error('Invalid phone number format')
    }

    setIsLoading(true)
    setConnectionStatus('connecting')

    try {
      toast.loading('Connecting WhatsApp...', { id: 'whatsapp-connect' })

      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhoneNumber, companyId: company.id }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error ?? 'Failed to connect WhatsApp')
      }

      const data = await res.json()
      const { instanceId, evolutionInstanceId, instanceName, qrCodeData, pairingCode } = data

      // Refresh local instance state
      await checkExistingInstance()

      toast.success(getT()('hooks.whatsapp.success.instanceCreated'), { id: 'whatsapp-connect' })

      // Poll connection status via proxy
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/whatsapp/status?instanceName=${instanceName}`)
          if (!statusRes.ok) return
          const { connectionStatus: status } = await statusRes.json()

          if (status === 'open') {
            await updateInstanceStatus(evolutionInstanceId, 'connected')
            toast.success(getT()('hooks.whatsapp.success.connected'))
            clearInterval(pollInterval)
          } else if (status === 'close') {
            await updateInstanceStatus(evolutionInstanceId, 'error')
            toast.error(getT()('hooks.whatsapp.errors.connectionFailed'))
            clearInterval(pollInterval)
          }
        } catch {
          // Polling error — keep trying
        }
      }, 3000)

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        setConnectionStatus((prev) => {
          if (prev === 'connecting') {
            toast.error(getT()('hooks.whatsapp.errors.timeout'))
            return 'error'
          }
          return prev
        })
      }, 300_000)

      return { pairingCode, qrCodeData, instanceId }
    } catch (error) {
      setConnectionStatus('error')
      toast.error(
        getT()('hooks.whatsapp.errors.connectFailed', { message: (error as Error).message }),
        { id: 'whatsapp-connect' }
      )
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [company?.id, checkExistingInstance, updateInstanceStatus])

  const disconnectWhatsApp = useCallback(async () => {
    if (!whatsappInstance) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceName: whatsappInstance.instance_name,
          instanceId: whatsappInstance.instance_id,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error ?? 'Failed to disconnect')
      }

      setWhatsappInstance(null)
      setConnectionStatus('disconnected')
      toast.success(getT()('hooks.whatsapp.success.disconnected'))
    } catch {
      toast.error(getT()('hooks.whatsapp.errors.disconnectFailed'))
    } finally {
      setIsLoading(false)
    }
  }, [whatsappInstance])

  return {
    isLoading,
    whatsappInstance,
    connectionStatus,
    connectWhatsApp,
    disconnectWhatsApp,
    checkExistingInstance,
  }
}
