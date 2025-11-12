'use client'

import { useState } from 'react'
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Chip,
  useDisclosure,
  Spinner
} from '@heroui/react'
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { User, UserRole } from '@/types/database'
import { useUsers } from '@/hooks/useUsers'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { AddUserModal } from './components/AddUserModal'
import { EditUserModal } from './components/EditUserModal'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { useTranslationNamespace } from '@/contexts/TranslationContext'

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { company } = useAuth()
  const { users, loading, deleteUser } = useUsers()
  const { limits } = usePlanLimits(company?.id)
  const { t } = useTranslationNamespace('dashboard.users')

  const addModal = useDisclosure()
  const editModal = useDisclosure()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    editModal.onOpen()
  }

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete)
      setUserToDelete(null)
    }
    setShowDeleteConfirm(false)
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'danger'
      case 'manager': return 'warning'
      case 'staff': return 'primary'
      case 'customer': return 'default'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-background min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
          <p className="text-gray-50">
            {t('subtitle')}
            {limits && (
              <span className="ml-2 text-sm">
                ({limits.current_users}/{limits.max_users} {t('info.users')})
              </span>
            )}
          </p>
        </div>
        <Button
          className="bg-background border border-secondary text-white hover:bg-secondary shadow-lg shadow-secondary/20"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={addModal.onOpen}
          isDisabled={Boolean(limits && !limits.can_add_users)}
        >
          {t('actions.addUser')}
        </Button>
      </div>

      {users.length === 0 ? (
        <Card className="bg-background border border-secondary shadow-lg shadow-secondary/20">
          <CardBody className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">{t('empty.title')}</h3>
            <p className="text-gray-50 mb-4">
              {t('empty.description')}
            </p>
            <Button
              className="bg-primary text-white hover:bg-primary/80 shadow-lg shadow-secondary/20"
              startContent={<PlusIcon className="w-4 h-4" />}
              onPress={addModal.onOpen}
              isDisabled={Boolean(limits && !limits.can_add_users)}
            >
              {t('actions.addUser')}
            </Button>
          </CardBody>
        </Card>
      ) 
      : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Show upgrade prompt if limit reached */}
          {limits && !limits.can_add_users && (
            <div className="md:col-span-2 lg:col-span-2">
              {/* <UpgradePrompt
                title="User Limit Reached"
                description={`You've reached the maximum of ${limits.max_users} users for your current plan. Upgrade to add more team members and unlock additional features.`}
                currentLimit={limits.max_users}
                limitType="users"
              /> */}
            </div>
          )}
          
          {users.map((user) => (
            <Card key={user.id} className="bg-background border border-secondary shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      src={user.avatar_url}
                      name={user.full_name || user.email || 'User'}
                      size="md"
                    />
                    <div>
                      <h3 className="font-medium text-white">
                        {user.full_name || t('info.noName')}
                      </h3>
                      <p className="text-sm text-gray-50">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="text-gray-50 hover:text-white"
                      onPress={() => handleEditUser(user)}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDeleteUser(user.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-50">{t('table.role')}</span>
                    <Chip
                      size="sm"
                      color={getRoleColor(user.role)}
                      variant="flat"
                      className="capitalize"
                    >
                      {t(`roles.${user.role}`)}
                    </Chip>
                  </div>

                  {user.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{t('info.phone')}</span>
                      <span className="text-sm text-gray-50">{user.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{t('info.joined')}</span>
                    <span className="text-sm text-gray-50">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <AddUserModal
        isOpen={addModal.isOpen}
        onOpenChange={addModal.onOpenChange}
        onUserAdded={() => {}} // Hook handles state updates automatically
      />

      {selectedUser && (
        <EditUserModal
          isOpen={editModal.isOpen}
          onOpenChange={editModal.onOpenChange}
          user={selectedUser}
          onUserUpdated={() => {}} // Hook handles state updates automatically
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteUser}
        title={t('actions.deleteUser')}
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}