// 图片压缩和EXIF清理
export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
}

export async function compressImage(
  file: File, 
  options: CompressOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      // 绘制图片（自动去除EXIF信息）
      ctx?.drawImage(img, 0, 0, width, height)

      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        `image/${format}`,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// 获取图片信息
export function getImageInfo(file: File): Promise<{
  width: number
  height: number
  size: number
  type: string
}> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type
      })
    }
    img.onerror = () => reject(new Error('Failed to get image info'))
    img.src = URL.createObjectURL(file)
  })
}

// 验证图片文件
export function validateImageFile(file: File): {
  valid: boolean
  error?: string
} {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '不支持的文件格式，请选择 JPG、PNG、GIF 或 WebP 格式的图片'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: '文件大小不能超过 10MB'
    }
  }

  return { valid: true }
}

// 创建图片预览URL
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

// 清理预览URL
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}

// 检测图片是否包含敏感内容（简单实现）
export function detectImageContent(_canvas: HTMLCanvasElement): Promise<{
  hasText: boolean
  hasFace: boolean
  isAppropriate: boolean
}> {
  // 这里可以实现更复杂的图像分析
  // 目前返回默认值
  return Promise.resolve({
    hasText: false,
    hasFace: false,
    isAppropriate: true
  })
}
