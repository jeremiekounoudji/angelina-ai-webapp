'use client'

import { Card, CardHeader, Button } from '@heroui/react'
import { 
  CogIcon, 
  TrashIcon, 
  QuestionMarkCircleIcon, 
  UserIcon 
} from '@heroicons/react/24/outline'
import { useCompany } from '@/hooks/useCompany'
import { useState } from 'react'
import { EditCompanyModal } from '../company/components/EditCompanyModal'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useDisclosure } from '@heroui/react'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

export default function SettingsPage() {
  const { company, deleteCompany, loading } = useCompany()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()
  const { t } = useTranslationNamespace('dashboard.settings')

  const handleDeleteCompany = async () => {
    if (await deleteCompany()) {
      // Redirect to login or home page after deletion
      window.location.href = '/login'
    }
  }

  const settingsOptions = [
    {
      title: t('sections.profile'),
      description: t('profile.description'),
      icon: UserIcon,
      action: () => onEditOpen(),
      buttonText: t('actions.edit'),
      buttonColor: 'primary' as const
    },
    {
      title: t('sections.support'),
      description: t('support.description'),
      icon: QuestionMarkCircleIcon,
      action: () => window.open('mailto:support@company.com', '_blank'),
      buttonText: t('actions.contact'),
      buttonColor: 'default' as const
    },
    {
      title: t('sections.danger'),
      description: t('danger.description'),
      icon: TrashIcon,
      action: () => setShowDeleteConfirm(true),
      buttonText: t('actions.delete'),
      buttonColor: 'danger' as const
    }
  ]

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <CogIcon className="h-6 w-6 text-gray-100" />
        <h1 className="text-2xl font-bold text-gray-50">{t('title')}</h1>
      </div>

      <div className="max-w-4xl space-y-6">
        {settingsOptions.map((option, index) => {
          const Icon = option.icon
          return (
            <Card key={index} className="shadow-sm bg-background border border-secondary/20 backdrop-blur-lg text-gray-100">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Icon className="h-6 w-6 text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-50">{option.title}</h3>
                      <p className="text-gray-400 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    color={option.buttonColor}
                    onClick={option.action}
                    disabled={loading}
                    className="min-w-32"
                  >
                    {option.buttonText}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCompany}
        title={t('danger.confirmTitle')}
        message={t('danger.confirmMessage')}
        confirmText={loading ? t('actions.deleting') : t('actions.delete')}
        cancelText={t('actions.cancel')}
        isLoading={loading}
        variant="danger"
      />

      {/* Edit Company Modal */}
      {company && (
        <EditCompanyModal
          isOpen={isEditOpen}
          onOpenChange={onEditOpenChange}
          company={company}
        />
      )}
    </div>
  )
}