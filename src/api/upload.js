import request from '@/utils/request'

// 上传文件
export const uploadFile = (data, config) => {
  return request({
    url: '/api/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

// 下载模板
export const downloadTemplate = (type) => {
  return request({
    url: `/api/templates/${type}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 批量导入订单
export const importOrders = (data) => {
  return request({
    url: '/api/orders/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取上传进度
export const getUploadProgress = (taskId) => {
  return request({
    url: `/api/upload/progress/${taskId}`,
    method: 'get'
  })
}

// 取消上传
export const cancelUpload = (taskId) => {
  return request({
    url: `/api/upload/cancel/${taskId}`,
    method: 'post'
  })
}

// 获取文件列表
export const getFileList = (params) => {
  return request({
    url: '/api/files',
    method: 'get',
    params
  })
}

// 删除文件
export const deleteFile = (fileId) => {
  return request({
    url: `/api/files/${fileId}`,
    method: 'delete'
  })
}

// 获取文件信息
export const getFileInfo = (fileId) => {
  return request({
    url: `/api/files/${fileId}`,
    method: 'get'
  })
}

// 更新文件信息
export const updateFileInfo = (fileId, data) => {
  return request({
    url: `/api/files/${fileId}`,
    method: 'put',
    data
  })
}

// 获取文件预览URL
export const getFilePreviewUrl = (fileId) => {
  return request({
    url: `/api/files/${fileId}/preview`,
    method: 'get'
  })
}

// 获取文件下载URL
export const getFileDownloadUrl = (fileId) => {
  return request({
    url: `/api/files/${fileId}/download`,
    method: 'get'
  })
} 