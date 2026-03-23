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
  onProgress?: (percent: number) => void
}

interface UploadResult {
  success: boolean
  urls: string[]
  error?: string
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = useMemo(() => createClient(), [])

  // Generate video thumbnail at specified time (default 2s)
  const generateThumbnail = async (videoFile: File, seekTime = 2): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true
      
      const objectUrl = URL.createObjectURL(videoFile)
      
      video.onloadedmetadata = () => {
        // Ensure seek time doesn't exceed video duration
        const actualSeekTime = Math.min(seekTime, video.duration - 0.1)
        video.currentTime = actualSeekTime
      }
      
      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            URL.revokeObjectURL(objectUrl)
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl)
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to generate thumbnail'))
            }
          }, 'image/jpeg', 0.85)
        } catch (error) {
          URL.revokeObjectURL(objectUrl)
          reject(error)
        }
      }
      
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load video'))
      }
      
      video.src = objectUrl
    })
  }

  const upload = async ({ bucket, files, path = '', onProgress }: UploadOptions): Promise<UploadResult> => {
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
    setProgress(0)
    const urls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Keep original extension (already validated by MIME type check)
        const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
        const filePath = path ? `${path}/${fileName}` : fileName

        // Use Supabase client upload (no real-time progress, but reliable)
        const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

        if (error) throw error
        if (!data) throw new Error('Upload failed: no data returned')

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
        
        // Update progress after each file
        const overall = Math.round(((i + 1) / files.length) * 100)
        setProgress(overall)
        onProgress?.(overall)
        
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
      setProgress(0)
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

  return { upload, deleteFile, uploading, progress, generateThumbnail }
}
