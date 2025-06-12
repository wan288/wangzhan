import request from '@/utils/request'

// 获取仪表盘概览数据
export function getDashboardOverview() {
  return request({
    url: '/merchant/statistics/dashboard',
    method: 'get'
  })
}

// 获取销售趋势数据
export function getSalesTrend(params) {
  return request({
    url: '/merchant/statistics/sales-trend',
    method: 'get',
    params
  })
}

// 获取订单趋势数据
export function getOrderTrend(params) {
  return request({
    url: '/merchant/statistics/order-trend',
    method: 'get',
    params
  })
}

// 获取热销商品排行
export function getHotDishesRanking(params) {
  return request({
    url: '/merchant/statistics/hot-dishes',
    method: 'get',
    params
  })
}

// 获取客户消费排行
export function getCustomerRanking(params) {
  return request({
    url: '/merchant/statistics/customer-ranking',
    method: 'get',
    params
  })
}

// 获取时段销售分布
export function getTimeDistribution(params) {
  return request({
    url: '/merchant/statistics/time-distribution',
    method: 'get',
    params
  })
}

// 获取分类销售占比
export function getCategoryDistribution(params) {
  return request({
    url: '/merchant/statistics/category-distribution',
    method: 'get',
    params
  })
}

// 获取支付方式分布
export function getPaymentDistribution(params) {
  return request({
    url: '/merchant/statistics/payment-distribution',
    method: 'get',
    params
  })
}

// 导出统计数据
export function exportStatistics(params) {
  return request({
    url: '/merchant/statistics/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取实时订单数据
export function getRealtimeOrders() {
  return request({
    url: '/merchant/statistics/realtime-orders',
    method: 'get'
  })
}

// 获取商家评分统计
export function getRatingStatistics(params) {
  return request({
    url: '/merchant/statistics/ratings',
    method: 'get',
    params
  })
} 