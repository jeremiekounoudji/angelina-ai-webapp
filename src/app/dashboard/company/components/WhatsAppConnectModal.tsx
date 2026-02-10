'use client'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Spinner
} from '@heroui/react'
import { useState, useEffect, useCallback } from 'react'
import { useWhatsAppConnect } from '@/hooks/useWhatsAppConnect'
import { PhoneIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import QRCode from 'qrcode'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslationNamespace } from '@/contexts/TranslationContext'
import Image from 'next/image'

interface WhatsAppConnectModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function WhatsAppConnectModal({ isOpen, onOpenChange }: WhatsAppConnectModalProps) {
  const [step, setStep] = useState<'qr' | 'success' | 'error'>('qr')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [pairingCode, setPairingCode] = useState('')  // Short code for manual entry
  const [qrCodeData, setQrCodeData] = useState('')    // Actual QR data for scanning
  const { t } = useTranslationNamespace('dashboard.company.whatsapp')
  const { company } = useAuth()
  
  const { 
    connectionStatus, 
    connectWhatsApp,
    whatsappInstance 
  } = useWhatsAppConnect()

  // Generate QR code from the actual QR code data (not the pairing code)
  useEffect(() => {
    if (qrCodeData) {
      // Check if it's already a base64 image
      if (qrCodeData.startsWith('data:image')) {
        setQrCodeUrl(qrCodeData)
      } else {
        // Generate QR code from the raw data
        QRCode.toDataURL(qrCodeData, { width: 256, margin: 2 })
          .then(url => setQrCodeUrl(url))
          .catch(err => {
            console.error('Error generating QR code:', err)
            // If QR generation fails, the data might be invalid
            setQrCodeUrl('')
          })
      }
    }
  }, [qrCodeData])

  // Update step based on connection status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setStep('success')
    } else if (connectionStatus === 'error') {
      setStep('error')
    }
  }, [connectionStatus])

  // Automatically connect when modal opens using company phone
  const handleAutoConnect = useCallback(async () => {
    if (!company?.phone) return

    try {
      const cleanPhone = getCleanPhoneNumber(company.phone)
      const result = await connectWhatsApp(cleanPhone)
      setPairingCode(result.pairingCode)
      setQrCodeData(result.qrCodeData)
      setStep('qr')
    } catch {
      setStep('error')
    }
  }, [company?.phone, connectWhatsApp])

  useEffect(() => {
    if (isOpen && company?.phone && !qrCodeData) {
      handleAutoConnect()
    }
  }, [isOpen, company?.phone, qrCodeData, handleAutoConnect])

  const handleClose = () => {
    setStep('qr')
    setPairingCode('')
    setQrCodeData('')
    setQrCodeUrl('')
    onOpenChange(false)
  }

  const getCleanPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digits and ensure no + sign
    return phoneNumber.replace(/\D/g, '')
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <Spinner size="sm" />
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <PhoneIcon className="w-5 h-5" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'warning'
      case 'connected':
        return 'success'
      case 'error':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connecting':
        return t('connecting')
      case 'connected':
        return t('connected')
      case 'error':
        return t('error')
      default:
        return t('disconnected')
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      size="lg"
      classNames={{
        base: "bg-background border border-secondary",
        header: "border-b border-secondary",
        body: "py-6",
        footer: "border-t border-secondary"
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {t('title')}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
              
              {connectionStatus !== 'disconnected' && (
                <Chip
                  size="sm"
                  color={getStatusColor()}
                  variant="flat"
                  className="capitalize mt-2"
                >
                  {getStatusText()}
                </Chip>
              )}
            </ModalHeader>

            <ModalBody>
              {step === 'qr' && (
                <div className="space-y-4 text-center">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">
                      {t('scanQrTitle')}
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      {t('scanQrDescription')}
                    </p>
                    {company?.phone && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg">
                        <PhoneIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-white font-medium">+{company.phone}</span>
                      </div>
                    )}
                  </div>

                  {qrCodeUrl ? (
                    <Card className="bg-white p-4 mx-auto w-fit">
                      <CardBody className="p-0">
                        <Image 
                          src={qrCodeUrl} 
                          alt="WhatsApp QR Code" 
                          width={192}
                          height={192}
                          className="w-48 h-48"
                        />
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="flex justify-center">
                      <Spinner size="lg" />
                    </div>
                  )}

                  {/* Alternative: Manual pairing code */}
                  {pairingCode && (
                    <div className="mt-4 p-3 bg-secondary/20 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">{t('orEnterCode')}</p>
                      <p className="text-xl font-mono font-bold text-white tracking-wider">{pairingCode}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 space-y-1">
                    <p>{t('instructions.step1')}</p>
                    <p>{t('instructions.step2')}</p>
                    <p>{t('instructions.step3')}</p>
                    <p>{t('instructions.step4')}</p>
                  </div>

                  {connectionStatus === 'connecting' && (
                    <div className="flex items-center justify-center gap-2 text-yellow-500">
                      <Spinner size="sm" />
                      <span className="text-sm">{t('waitingConnection')}</span>
                    </div>
                  )}
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-4">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">
                      {t('successTitle')}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {t('successDescription')}
                    </p>
                  </div>
                  
                  {whatsappInstance && (
                    <Card className="bg-background border border-secondary">
                      <CardBody className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{t('phone')}:</span>
                          <span className="text-white">{whatsappInstance.phone_number}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{t('status')}:</span>
                          <Chip size="sm" color="success" variant="flat">
                            {t('connected')}
                          </Chip>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              )}

              {step === 'error' && (
                <div className="text-center space-y-4">
                  <XCircleIcon className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">
                      {t('errorTitle')}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {t('errorDescription')}
                    </p>
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              {step === 'qr' && (
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleClose}
                >
                  {t('cancel')}
                </Button>
              )}

              {(step === 'success' || step === 'error') && (
                <Button
                  color="primary"
                  onPress={handleClose}
                >
                  {step === 'success' ? t('done') : t('tryAgain')}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
