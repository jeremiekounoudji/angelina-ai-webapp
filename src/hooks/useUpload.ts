'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()

  const upload = async ({ bucket, files, path = '' }: UploadOptions): Promise<UploadResult> => {
    setUploading(true)
    const urls: string[] = []

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
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
      console.error('Upload error:', error)
      return { 
        success: false, 
        urls: [], 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Delete error:', error)
      return false
    }
  }

  return {
    upload,
    deleteFile,
    uploading
  }
}