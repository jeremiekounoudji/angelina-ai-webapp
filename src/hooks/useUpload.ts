'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
]
const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

interface UploadOptions {
  bucket: string
  files: File[]
  path?: string
}

interface UploadResult {
  success: boolean
  urls: string[]
  error?: string
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const upload = async ({ bucket, files, path = '' }: UploadOptions): Promise<UploadResult> => {
    // Validate all files before uploading any
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { success: false, urls: [], error: `File type not allowed: ${file.type}` }
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return { success: false, urls: [], error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` }
      }
    }

    setUploading(true)
    const urls: string[] = []

    try {
      for (const file of files) {
        // Sanitize extension — strip anything that isn't alphanumeric
        const rawExt = file.name.split('.').pop() ?? 'bin'
        const safeExt = rawExt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${safeExt}`
        const filePath = path ? `${path}/${fileName}` : fileName

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path)

        urls.push(publicUrl)
      }

      return { success: true, urls }
    } catch (error) {
      return {
        success: false,
        urls: [],
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) throw error
      return true
    } catch {
      return false
    }
  }

  return { upload, deleteFile, uploading }
}
