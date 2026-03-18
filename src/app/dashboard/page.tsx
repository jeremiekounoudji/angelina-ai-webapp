'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingErrorState } from '@/components/LoadingErrorState'
import { Spinner } from '@heroui/react'

export default function DashboardPage() {
  const router = useRouter()
  const { loading, error, retry } = useAuth()

  useEffect(() => {
    if (!loading && !error) {
      router.replace('/dashboard/company')
    }
  }, [router, loading, error])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <LoadingErrorState error={error} onRetry={retry} title="Failed to load dashboard" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <Spinner size="lg" color="success" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}