import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { WhatsAppInstance } from '@/types/database'
import toast from 'react-hot-toast'

interface EvolutionAPIResponse {
  instance: {
    instanceName: string
    instanceId: string
    status: string
  }
  hash: string  // API key returned as string directly
}

interface ConnectionResponse {
  pairingCode?: string  // Short code for manual pairing (e.g., "WZYEH1YY")
  code?: string         // QR code data for scanning (e.g., "2@y8eK+bjtEjUWy9/FOM...")
  base64?: string       // QR code as base64 image (alternative format)
  count?: number
}

export function useWhatsAppConnect() {
  const [isLoading, setIsLoading] = useState(false)
  const [whatsappInstance, setWhatsappInstance] = useState<WhatsAppInstance | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const { company } = useAuth()

  const EVOLUTION_API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "https://angelina-ai-evolution-v1.onrender.com"
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "angelinaAi-api-key"

  const checkExistingInstance = useCallback(async () => {
    if (!company?.id) return

    try {
      const supabase = createClient()
      // Get the most recent instance for this company
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
      console.log('No existing WhatsApp instance found')
    }
  }, [company?.id])

  // Check if company already has a WhatsApp instance
  useEffect(() => {
    if (company?.id) {
      checkExistingInstance()
    }
  }, [company?.id, checkExistingInstance])

  // Delete old instances for this company before creating a new one
  const cleanupOldInstances = async () => {
    if (!company?.id) return

    const supabase = createClient()
    
    // Get all existing instances
    const { data: existingInstances } = await supabase
      .from('whatsapp_instances')
      .select('instance_name')
      .eq('company_id', company.id)

    // Delete from Evolution API
    if (existingInstances && existingInstances.length > 0) {
      for (const instance of existingInstances) {
        try {
          await fetch(`${EVOLUTION_API_URL}/instance/delete/${instance.instance_name}`, {
            method: 'DELETE',
            headers: { 'apikey': EVOLUTION_API_KEY }
          })
        } catch (e) {
          console.log('Failed to delete instance from Evolution API:', e)
        }
      }
    }

    // Delete from database
    await supabase
      .from('whatsapp_instances')
      .delete()
      .eq('company_id', company.id)
  }

  const createInstance = async (): Promise<EvolutionAPIResponse> => {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error('Evolution API configuration missing')
    }

    const instanceName = `company_${company?.id}_${Date.now()}`
    
    const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        instanceName,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true
        // Don't pass number here - let the instance initialize first
        // The number will be used when connecting via /instance/connect
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create WhatsApp instance')
    }

    return response.json()
  }

  const restartInstance = async (instanceName: string): Promise<void> => {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error('Evolution API configuration missing')
    }

    const response = await fetch(`${EVOLUTION_API_URL}/instance/restart/${instanceName}`, {
      method: 'PUT',
      headers: {
        'apikey': EVOLUTION_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error('Failed to restart WhatsApp instance')
    }

    const data = await response.json()
    console.log('Instance restart response:', data)
  }

  const getConnectionCode = async (instanceName: string, phoneNumber?: string): Promise<ConnectionResponse> => {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error('Evolution API configuration missing')
    }

    // Add phone number as query param if provided
    const url = phoneNumber 
      ? `${EVOLUTION_API_URL}/instance/connect/${instanceName}?number=${phoneNumber}`
      : `${EVOLUTION_API_URL}/instance/connect/${instanceName}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get connection code')
    }

    const data = await response.json()
    console.log('Connection response:', JSON.stringify(data, null, 2))
    return data
  }

  // Retry getting QR code with exponential backoff
  // Falls back to pairing code if QR code generation fails (known issue on Railway deployment)
  const getConnectionCodeWithRetry = async (
    instanceName: string,
    phoneNumber: string,
    maxRetries: number = 10,
    initialDelay: number = 1000
  ): Promise<ConnectionResponse> => {
    let lastResponse: ConnectionResponse = { count: 0 }
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Try without phone number first to get QR code
      const response = await getConnectionCode(instanceName)
      lastResponse = response
      
      // Check if we got QR code data
      if (response.code || response.base64) {
        console.log(`QR code received on attempt ${attempt + 1}`)
        return response
      }
      
      // Wait before retrying (with slight increase each time)
      const delay = initialDelay + (attempt * 500)
      console.log(`No QR code yet (attempt ${attempt + 1}/${maxRetries}), waiting ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    // Fallback: If QR code generation fails (known issue on Railway), use pairing code instead
    console.warn('QR code generation failed, falling back to pairing code method')
    try {
      const pairingResponse = await getConnectionCode(instanceName, phoneNumber)
      if (pairingResponse.pairingCode) {
        console.log('Using pairing code as fallback:', pairingResponse.pairingCode)
        return pairingResponse
      }
    } catch (error) {
      console.error('Pairing code fallback also failed:', error)
    }
    
    // Return last response even if no QR code or pairing code
    console.warn('Max retries reached, no QR code or pairing code received')
    return lastResponse
  }

  const checkConnectionStatus = async (instanceName: string): Promise<string> => {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error('Evolution API configuration missing')
    }

    const response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error('Failed to check connection status')
    }

    const data = await response.json()
    return data[0].connectionStatus || 'disconnected'
  }

  const checkIsWhatsApp = async (phoneNumber: string): Promise<boolean> => {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      throw new Error('Evolution API configuration missing')
    }

    // We need a temporary instance to check if number is WhatsApp
    // For now, we'll create a simple validation based on phone number format
    // In production, you might want to create a temporary instance or use a dedicated validation instance
    
    // Basic validation: phone number should be at least 10 digits
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      return false
    }

    // Additional validation can be added here
    return true
  }

  const saveInstanceToDatabase = async (instanceData: EvolutionAPIResponse, phoneNumber: string, pairingCode: string) => {
    if (!company?.id) throw new Error('Company ID not found')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('whatsapp_instances')
      .insert({
        company_id: company.id,
        instance_name: instanceData.instance.instanceName,
        instance_id: instanceData.instance.instanceId,
        phone_number: phoneNumber,
        status: 'connecting',
        pairing_code: pairingCode,
        api_key: instanceData.hash  // hash is the API key string directly
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateInstanceStatus = async (instanceId: string, status: 'disconnected' | 'connecting' | 'connected' | 'error') => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('whatsapp_instances')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('instance_id', instanceId)
      .select()
      .single()

    if (error) throw error
    
    // Update local state with the new data
    if (data) {
      setWhatsappInstance(data)
      setConnectionStatus(status)
    }
  }

  const connectWhatsApp = async (phoneNumber: string): Promise<{ pairingCode: string; qrCodeData: string; instanceId: string }> => {
    if (!company?.id) {
      throw new Error('Company not found')
    }

    // Ensure phone number doesn't have + sign and is clean
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')

    setIsLoading(true)
    setConnectionStatus('connecting')

    try {
      // 1. Validate if it's a potential WhatsApp number
      toast.loading('Validating phone number...', { id: 'whatsapp-connect' })
      const isValidWhatsApp = await checkIsWhatsApp(cleanPhoneNumber)
      
      if (!isValidWhatsApp) {
        throw new Error('Invalid phone number format')
      }

      // 2. Cleanup old instances first
      toast.loading('Cleaning up old instances...', { id: 'whatsapp-connect' })
      await cleanupOldInstances()

      // 3. Create instance
      toast.loading('Creating WhatsApp instance...', { id: 'whatsapp-connect' })
      const instanceData = await createInstance()

      // 4. Wait a moment for instance to initialize, then try to restart it
      toast.loading('Initializing instance...', { id: 'whatsapp-connect' })
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      
      try {
        await restartInstance(instanceData.instance.instanceName)
        console.log('Instance restarted successfully')
      } catch (error) {
        console.warn('Instance restart failed, continuing anyway:', error)
        // Continue without restart - the instance might work without it
      }

      // 5. Get QR code (with retry since instance needs time to initialize)
      // Falls back to pairing code if QR code generation fails
      toast.loading('Getting QR code...', { id: 'whatsapp-connect' })
      const connectionData = await getConnectionCodeWithRetry(instanceData.instance.instanceName, cleanPhoneNumber)
      
      // Get QR code data - could be in 'code' or 'base64' field
      const qrCodeData = connectionData.code || connectionData.base64 || ''
      const pairingCode = connectionData.pairingCode || ''

      if (!qrCodeData) {
        console.warn('No QR code data received from API:', connectionData)
      }

      // 6. Save to database
      const savedInstance = await saveInstanceToDatabase(instanceData, cleanPhoneNumber, pairingCode)
      setWhatsappInstance(savedInstance)

      toast.success('Instance created! Scan the QR code to connect.', { id: 'whatsapp-connect' })

      // 7. Start polling for connection status
      const pollInterval = setInterval(async () => {
        try {
          const status = await checkConnectionStatus(instanceData.instance.instanceName)
          console.log('Connection status:', status);
          
          if (status === 'open') {
            // Use instance_id (Evolution API ID), not id (Supabase row ID)
            // updateInstanceStatus will also update local state
            await updateInstanceStatus(savedInstance.instance_id, 'connected')
            toast.success('WhatsApp connected successfully!')
            clearInterval(pollInterval)
          } else if (status === 'close') {
            await updateInstanceStatus(savedInstance.instance_id, 'error')
            toast.error('WhatsApp connection failed')
            clearInterval(pollInterval)
          }
        } catch (error) {
          console.error('Error checking connection status:', error)
        }
      }, 3000)

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        if (connectionStatus === 'connecting') {
          setConnectionStatus('error')
          toast.error('Connection timeout. Please try again.')
        }
      }, 300000)

      return {
        pairingCode,
        qrCodeData,  // The actual QR code data for scanning
        instanceId: savedInstance.id
      }

    } catch (error) {
      setConnectionStatus('error')
      toast.error('Failed to connect WhatsApp: ' + (error as Error).message, { id: 'whatsapp-connect' })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWhatsApp = async () => {
    if (!whatsappInstance) return

    setIsLoading(true)
    try {
      // Delete instance from Evolution API
      if (EVOLUTION_API_URL && EVOLUTION_API_KEY) {
        await fetch(`${EVOLUTION_API_URL}/instance/delete/${whatsappInstance.instance_name}`, {
          method: 'DELETE',
          headers: {
            'apikey': EVOLUTION_API_KEY
          }
        })
      }

      // Update database - use instance_id (Evolution API ID)
      if (whatsappInstance.instance_id) {
        await updateInstanceStatus(whatsappInstance.instance_id, 'disconnected')
      }
      setWhatsappInstance(null)
      setConnectionStatus('disconnected')
      toast.success('WhatsApp disconnected successfully')

    } catch (error) {
      toast.error('Failed to disconnect WhatsApp')
      console.error('Error disconnecting WhatsApp:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    whatsappInstance,
    connectionStatus,
    connectWhatsApp,
    disconnectWhatsApp,
    checkExistingInstance
  }
}