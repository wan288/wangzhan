import request from '@/utils/request'

// 获取订单列表
export function getOrders(params) {
  return request({
    url: '/api/orders',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrderDetail(orderId) {
  return request({
    url: `/api/orders/${orderId}`,
    method: 'get'
  })
}

// 创建订单
export function createOrder(data) {
  return request({
    url: '/api/orders',
    method: 'post',
    data
  })
}

// 更新订单状态
export function updateOrder(orderId, data) {
  return request({
    url: `/api/orders/${orderId}`,
    method: 'patch',
    data
  })
}

// 取消订单
export function cancelOrder(orderId) {
  return request({
    url: `/api/orders/${orderId}/cancel`,
    method: 'post'
  })
}

// 获取商家的订单列表
export function getMerchantOrders(params) {
  return request({
    url: '/api/merchant/orders',
    method: 'get',
    params
  })
}

// 获取用户的订单列表
export function getUserOrders(params) {
  return request({
    url: '/api/user/orders',
    method: 'get',
    params
  })
} 