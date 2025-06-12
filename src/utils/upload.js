import { ElMessage } from 'element-plus'
import { uploadFile, downloadTemplate } from '@/api/upload'

// 文件类型验证
const validateFileType = (file, acceptTypes) => {
  const extension = file.name.split('.').pop().toLowerCase()
  const isValidType = acceptTypes.some(type => {
    if (type.startsWith('.')) {
      return type.toLowerCase() === `.${extension}`
    }
    return file.type.startsWith(type)
  })

  if (!isValidType) {
    ElMessage.error(`只能上传 ${acceptTypes.join(', ')} 格式的文件`)
    return false
  }
  return true
}

// 文件大小验证
const validateFileSize = (file, maxSize) => {
  const isLtMaxSize = file.size / 1024 / 1024 < maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${maxSize}MB!`)
    return false
  }
  return true
}

// 文件上传
export const upload = async (file, options = {}) => {
  const {
    acceptTypes = ['.jpg', '.jpeg', '.png', '.xlsx', '.xls'],
    maxSize = 5,
    onProgress,
    onSuccess,
    onError
  } = options

  try {
    // 验证文件类型
    if (!validateFileType(file, acceptTypes)) {
      return Promise.reject(new Error('文件类型错误'))
    }

    // 验证文件大小
    if (!validateFileSize(file, maxSize)) {
      return Promise.reject(new Error('文件大小超出限制'))
    }

    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)

    // 上传文件
    const response = await uploadFile(formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress?.(progress)
      }
    })

    onSuccess?.(response)
    return response
  } catch (error) {
    console.error('Upload failed:', error)
    onError?.(error)
    ElMessage.error(error.message || '上传失败')
    return Promise.reject(error)
  }
}

// 批量上传
export const batchUpload = async (files, options = {}) => {
  const {
    acceptTypes = ['.jpg', '.jpeg', '.png', '.xlsx', '.xls'],
    maxSize = 5,
    maxCount = 10,
    onProgress,
    onSuccess,
    onError
  } = options

  try {
    // 验证文件数量
    if (files.length > maxCount) {
      ElMessage.error(`最多只能上传 ${maxCount} 个文件`)
      return Promise.reject(new Error('文件数量超出限制'))
    }

    // 验证每个文件
    for (const file of files) {
      if (!validateFileType(file, acceptTypes) || !validateFileSize(file, maxSize)) {
        return Promise.reject(new Error('文件验证失败'))
      }
    }

    // 创建 FormData
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    // 上传文件
    const response = await uploadFile(formData, {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress?.(progress)
      }
    })

    onSuccess?.(response)
    return response
  } catch (error) {
    console.error('Batch upload failed:', error)
    onError?.(error)
    ElMessage.error(error.message || '批量上传失败')
    return Promise.reject(error)
  }
}

// 下载模板
export const downloadFile = async (type, options = {}) => {
  const {
    fileName,
    onSuccess,
    onError
  } = options

  try {
    const blob = await downloadTemplate(type)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || `${type}_template.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    onSuccess?.()
  } catch (error) {
    console.error('Download failed:', error)
    onError?.(error)
    ElMessage.error(error.message || '下载失败')
    return Promise.reject(error)
  }
}

// 图片预览
export const previewImage = (url) => {
  if (!url) return
  const img = new Image()
  img.src = url
  const w = window.open('')
  w.document.write(img.outerHTML)
  w.document.title = '图片预览'
}

// 文件类型图标映射
export const fileTypeIcons = {
  'image/jpeg': 'Picture',
  'image/png': 'Picture',
  'image/gif': 'Picture',
  'application/vnd.ms-excel': 'Document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Document',
  'application/pdf': 'Document',
  'application/msword': 'Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Document'
}

// 获取文件类型图标
export const getFileTypeIcon = (file) => {
  return fileTypeIcons[file.type] || 'Document'
}

// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 