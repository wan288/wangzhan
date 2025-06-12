import request from '@/utils/request'

export function getMerchantInfo() {
  return request({
    url: '/api/merchant/info',
    method: 'get'
  })
}

export function updateMerchantInfo(data) {
  return request({
    url: '/api/merchant/info',
    method: 'put',
    data
  })
}

export function uploadMerchantLogo(data) {
  return request({
    url: '/api/merchant/logo',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
} 