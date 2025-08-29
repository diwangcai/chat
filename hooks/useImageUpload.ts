import { useState, useCallback } from 'react'
import { compressImage, validateImageFile, createImagePreview, revokeImagePreview } from '@/lib/image'
import { ImageUpload } from '@/types/chat'

export function useImageUpload() {
  const [uploads, setUploads] = useState<Map<string, ImageUpload>>(new Map())

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    // 验证文件
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const preview = createImagePreview(file)

    // 初始化上传状态
    const upload: ImageUpload = {
      id: uploadId,
      file,
      preview,
      progress: 0,
      status: 'uploading'
    }

    setUploads(prev => new Map(prev).set(uploadId, upload))

    try {
      // 进度开始
      setUploads(prev => {
        const newMap = new Map(prev)
        const current = newMap.get(uploadId)
        if (current) {
          newMap.set(uploadId, { ...current, progress: 10 })
        }
        return newMap
      })

      // 压缩图片
      const compressedBlob = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
        format: 'jpeg'
      })

      setUploads(prev => {
        const newMap = new Map(prev)
        const current = newMap.get(uploadId)
        if (current) {
          newMap.set(uploadId, { ...current, progress: 50 })
        }
        return newMap
      })

      // 模拟上传过程（实际项目中这里会上传到服务器）
      await new Promise(resolve => setTimeout(resolve, 1000))

      setUploads(prev => {
        const newMap = new Map(prev)
        const current = newMap.get(uploadId)
        if (current) {
          newMap.set(uploadId, { ...current, progress: 100, status: 'success' })
        }
        return newMap
      })

      // 返回压缩后的图片URL（实际项目中返回CDN URL）
      const compressedUrl = URL.createObjectURL(compressedBlob)
      
      // 清理预览URL
      revokeImagePreview(preview)

      return compressedUrl

    } catch (error) {
      // 处理错误
      setUploads(prev => {
        const newMap = new Map(prev)
        const current = newMap.get(uploadId)
        if (current) {
          newMap.set(uploadId, { 
            ...current, 
            status: 'error', 
            error: error instanceof Error ? error.message : '上传失败'
          })
        }
        return newMap
      })

      // 清理预览URL
      revokeImagePreview(preview)
      throw error
    }
  }, [])

  const retryUpload = useCallback(async (uploadId: string): Promise<string> => {
    const upload = uploads.get(uploadId)
    if (!upload) {
      throw new Error('Upload not found')
    }

    // 清理之前的预览
    revokeImagePreview(upload.preview)

    // 重新上传
    return uploadImage(upload.file)
  }, [uploads, uploadImage])

  const cancelUpload = useCallback((uploadId: string) => {
    const upload = uploads.get(uploadId)
    if (upload) {
      revokeImagePreview(upload.preview)
      setUploads(prev => {
        const newMap = new Map(prev)
        newMap.delete(uploadId)
        return newMap
      })
    }
  }, [uploads])

  const clearUploads = useCallback(() => {
    // 清理所有预览URL
    uploads.forEach(upload => {
      revokeImagePreview(upload.preview)
    })
    setUploads(new Map())
  }, [uploads])

  return {
    uploads: Array.from(uploads.entries()).map(([id, upload]) => ({ ...upload, id })),
    uploadImage,
    retryUpload,
    cancelUpload,
    clearUploads
  }
}
