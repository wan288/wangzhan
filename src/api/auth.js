import request from '@/utils/request'

// 商家登录
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 获取商家信息
export function getMerchantInfo() {
  return request({
    url: '/info',
    method: 'get'
  })
}

// 更新商家信息
export function updateMerchantInfo(data) {
  return request({
    url: '/info',
    method: 'put',
    data
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/password',
    method: 'put',
    data
  })
}

// 刷新token
export function refreshToken() {
  return request({
    url: '/refresh',
    method: 'post'
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data
  })
} 