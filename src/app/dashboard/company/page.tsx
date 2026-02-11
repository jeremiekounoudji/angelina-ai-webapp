'use client'

import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Avatar,
  Chip,
  useDisclosure,
  Spinner
} from '@heroui/react'
import { useAuth } from '@/contexts/AuthContext'
import { PencilIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { EditCompanyModal } from './components/EditCompanyModal'
import { MetricsCards } from './components/MetricsCards'
import { PolicyCard } from './components/PolicyCard'
import { useTranslationNamespace } from '@/contexts/TranslationContext'
import { useWhatsAppConnect } from "@/hooks/useWhatsAppConnect";
import { WhatsAppConnectModal } from './components/WhatsAppConnectModal';

export default function CompanyPage() {
  const { company, loading } = useAuth()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isOpen: isWhatsAppOpen, onOpen: onWhatsAppOpen, onOpenChange: onWhatsAppOpenChange } = useDisclosure()
  const { t } = useTranslationNamespace('dashboard.company')
  const { 
    whatsappInstance, 
    connectionStatus, 
    disconnectWhatsApp 
  } = useWhatsAppConnect();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'trial': return 'warning'
      case 'inactive': return 'default'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  // Show loading only while auth is initializing
  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="success" />
      </div>
    )
  }

  // Show empty state if no company after loading completes
  if (!company) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardBody className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No company found</h3>
            <p className="text-gray-600">
              Please contact support if you believe this is an error.
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <Button
          className="bg-[#328E6E] text-white hover:bg-[#15803d]"
          startContent={<PencilIcon className="w-4 h-4" />}
          onPress={onOpen}
        >
          {t('actions.edit')}
        </Button>
      </div>

      {/* Company Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Main Company Info */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-gray-200 shadow-sm h-full">
            <CardHeader className="flex gap-3 border-b border-gray-100">
              <Avatar
                src={company.avatar_url}
                name={company.name}
                size="lg"
                className="w-16 h-16 bg-green-100 text-[#328E6E]"
              />
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-gray-900">{company.name}</h2>
                <p className="text-gray-600 capitalize">{company.type}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">{t('form.status')}:</span>
                  <Chip
                    size="sm"
                    color={getStatusColor(company.subscription_status)}
                    variant="flat"
                    className="capitalize"
                  >
                    {company.subscription_status || 'inactive'}
                  </Chip>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-4">
              {company.description && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">{t('form.description')}</h3>
                  <p className="text-gray-600">{company.description}</p>
                </div>
              )}

              <div className="space-y-3">
                {company.address && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{company.address}</span>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{company.phone}</span>
                  </div>
                )}

                {company.email && (
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{company.email}</span>
                  </div>
                )}

                {/* WhatsApp Connection */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <PhoneIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{t('whatsapp.integration')}</h4>
                      <p className="text-sm text-gray-600">
                        {whatsappInstance 
                          ? `${t('whatsapp.connected')}: ${whatsappInstance.phone_number}`
                          : t('whatsapp.connectDescription')
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {whatsappInstance && (
                      <Chip
                        size="sm"
                        color={connectionStatus === 'connected' ? 'success' : 
                               connectionStatus === 'connecting' ? 'warning' : 'danger'}
                        variant="flat"
                        className="capitalize"
                      >
                        {connectionStatus === 'connected' ? t('whatsapp.connected') :
                         connectionStatus === 'connecting' ? t('whatsapp.connecting') :
                         connectionStatus === 'error' ? t('whatsapp.error') : t('whatsapp.disconnected')}
                      </Chip>
                    )}
                    
                    {whatsappInstance && connectionStatus === 'connected' ? (
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={disconnectWhatsApp}
                      >
                        {t('whatsapp.disconnect')}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-green-500 text-white hover:bg-green-600"
                        onPress={onWhatsAppOpen}
                      >
                        {whatsappInstance ? t('whatsapp.reconnect') : t('actions.connectWhatsapp')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Company Policy Card */}
        <div className="lg:col-span-1">
          <PolicyCard />
        </div>
      </div>

      {/* Metrics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('subtitle')}</h2>
        <MetricsCards />
      </div>

      <EditCompanyModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        company={company}
      />

      <WhatsAppConnectModal
        isOpen={isWhatsAppOpen}
        onOpenChange={onWhatsAppOpenChange}
      />
    </div>
  )
}