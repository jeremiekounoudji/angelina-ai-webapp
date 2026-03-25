'use client'

import { Card, CardHeader, CardBody, Button, Textarea } from '@heroui/react'
import { CogIcon, TrashIcon, QuestionMarkCircleIcon, UserIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useCompany } from '@/hooks/useCompany'
import { useState } from 'react'
import { EditCompanyModal } from '../company/components/EditCompanyModal'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { SupportModal } from '@/components/SupportModal'
import { useDisclosure } from '@heroui/react'
import { useTranslationNamespace } from '@/contexts/TranslationContext'
import { useAccountDeletion } from '@/hooks/useAccountDeletion'

export default function SettingsPage() {
  const { company, deleteCompany, loading } = useCompany()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [supportOpen, setSupportOpen] = useState(false)
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure()
  const { t } = useTranslationNamespace('dashboard.settings')
  const { requestDeletion, loading: deletionLoading } = useAccountDeletion()

  const handleDeleteCompany = async () => {
    if (await deleteCompany()) {
      window.location.href = '/login'
    }
  }

  const handleRequestAccountDeletion = async () => {
    const success = await requestDeletion(deleteReason)
    if (success) {
      setShowDeleteAccountConfirm(false)
      setDeleteReason('')
    }
  }

  const settingsOptions = [
    {
      title: t('sections.profile'),
      description: t('profile.description'),
      icon: UserIcon,
      action: () => onEditOpen(),
      buttonText: t('actions.edit'),
      buttonColor: 'primary' as const,
    },
    {
      title: t('sections.support'),
      description: t('support.description'),
      icon: QuestionMarkCircleIcon,
      action: () => setSupportOpen(true),
      buttonText: t('actions.contact'),
      buttonColor: 'default' as const,
    },
    {
      title: t('sections.danger'),
      description: t('danger.description'),
      icon: TrashIcon,
      action: () => setShowDeleteConfirm(true),
      buttonText: t('actions.delete'),
      buttonColor: 'danger' as const,
    },
  ]

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <CogIcon className="h-6 w-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      <div className="max-w-4xl space-y-6">
        {settingsOptions.map((option, index) => {
          const Icon = option.icon
          return (
            <Card key={index} className="shadow-sm bg-white border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between w-full flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                      <p className="text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                  <Button
                    color={option.buttonColor}
                    onClick={option.action}
                    disabled={loading}
                    className={`min-w-32 ${option.buttonColor === 'primary' ? 'bg-[#091413] text-white hover:bg-[#15803d]' : ''}`}
                  >
                    {option.buttonText}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )
        })}

        {/* Delete Account Card */}
        <Card className="shadow-sm bg-white border border-red-200">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700">{t('deleteAccount.sectionTitle')}</h3>
                <p className="text-gray-600 mt-1">{t('deleteAccount.description')}</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-4">
            <Button
              color="danger"
              variant="bordered"
              onPress={() => setShowDeleteAccountConfirm(true)}
              className="w-full sm:w-auto"
            >
              {t('actions.deleteAccount')}
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Delete Company confirmation */}
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

      {/* Delete Account request confirmation */}
      <ConfirmationModal
        isOpen={showDeleteAccountConfirm}
        onClose={() => { setShowDeleteAccountConfirm(false); setDeleteReason(''); }}
        onConfirm={handleRequestAccountDeletion}
        title={t('deleteAccount.confirmTitle')}
        message={t('deleteAccount.confirmMessage')}
        confirmText={t('actions.deleteAccount')}
        cancelText={t('actions.cancel')}
        isLoading={deletionLoading}
        variant="danger"
      >
        <Textarea
          label={t('deleteAccount.reasonLabel')}
          placeholder={t('deleteAccount.reasonPlaceholder') as string}
          value={deleteReason}
          onValueChange={setDeleteReason}
          maxRows={4}
          variant="bordered"
          classNames={{ inputWrapper: "border-gray-300 mt-3" }}
        />
      </ConfirmationModal>

      {company && (
        <EditCompanyModal isOpen={isEditOpen} onOpenChange={onEditOpenChange} company={company} />
      )}

      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  )
}
