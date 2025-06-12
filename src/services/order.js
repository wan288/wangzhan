import {
  getOrderList,
  getOrderDetail,
  updateOrderStatus,
  getOrderStatistics,
  getTodayOrderStats,
  getSalesTrend,
  getHotDishes,
  exportOrders,
  printOrder,
  batchUpdateOrderStatus,
  getOrderReviews,
  replyOrderReview
} from '@/api/order'
import { cacheable, clearCache, cacheManagerDecorator } from '@/utils/cacheDecorator'
import { errorHandler, retryable, createBusinessError, ErrorType } from '@/utils/error'

@cacheManagerDecorator()
export class OrderService {
  // 获取订单列表
  @cacheable({
    key: 'order_list',
    expire: 5 * 60 * 1000, // 5分钟缓存
    condition: (params) => !params.refresh // 当refresh为true时不使用缓存
  })
  @retryable({
    maxRetries: 3,
    retryDelay: 1000
  })
  @errorHandler({
    showMessage: true,
    retry: true
  })
  async getOrderList(params) {
    const response = await getOrderList(params)
    if (!response.success) {
      throw createBusinessError('GET_ORDER_LIST_FAILED', '获取订单列表失败')
    }
    return response.data
  }

  // 获取订单详情
  @cacheable({
    key: 'order_detail',
    expire: 10 * 60 * 1000, // 10分钟缓存
    condition: (orderId) => !!orderId
  })
  @retryable()
  @errorHandler({
    showMessage: true,
    retry: true
  })
  async getOrderDetail(orderId) {
    if (!orderId) {
      throw createBusinessError('INVALID_PARAMETER', '订单ID不能为空')
    }

    const response = await getOrderDetail(orderId)
    if (!response.success) {
      throw createBusinessError('GET_ORDER_DETAIL_FAILED', '获取订单详情失败')
    }
    return response.data
  }

  // 更新订单状态
  @clearCache({
    key: 'order_list',
    pattern: true // 清除所有订单列表缓存
  })
  @clearCache({
    key: 'order_detail',
    pattern: true
  })
  @errorHandler({
    showMessage: true,
    showDialog: true
  })
  async updateOrderStatus(orderId, status) {
    if (!orderId) {
      throw createBusinessError('INVALID_PARAMETER', '订单ID不能为空')
    }
    if (!status) {
      throw createBusinessError('INVALID_PARAMETER', '订单状态不能为空')
    }

    const response = await updateOrderStatus(orderId, status)
    if (!response.success) {
      throw createBusinessError('UPDATE_ORDER_STATUS_FAILED', '更新订单状态失败')
    }
    return response.data
  }

  // 批量更新订单状态
  @clearCache({
    key: 'order_list',
    pattern: true
  })
  @errorHandler({
    showMessage: true,
    showDialog: true
  })
  async batchUpdateOrderStatus(orderIds, status) {
    if (!orderIds?.length) {
      throw createBusinessError('INVALID_PARAMETER', '订单ID列表不能为空')
    }
    if (!status) {
      throw createBusinessError('INVALID_PARAMETER', '订单状态不能为空')
    }

    const response = await batchUpdateOrderStatus(orderIds, status)
    if (!response.success) {
      throw createBusinessError('BATCH_UPDATE_ORDER_STATUS_FAILED', '批量更新订单状态失败')
    }
    return response.data
  }

  // 获取订单统计数据
  @cacheable({
    key: 'order_stats',
    expire: 5 * 60 * 1000,
    condition: (params) => !params.refresh
  })
  @retryable()
  @errorHandler({
    showMessage: true,
    retry: true
  })
  async getOrderStats() {
    const response = await getOrderStats()
    if (!response.success) {
      throw createBusinessError('GET_ORDER_STATS_FAILED', '获取订单统计失败')
    }
    return response.data
  }

  // 获取订单评价
  @cacheable({
    key: 'order_reviews',
    expire: 10 * 60 * 1000,
    condition: (params) => !!params.orderId
  })
  @retryable()
  @errorHandler({
    showMessage: true,
    retry: true
  })
  async getOrderReviews(params) {
    const response = await getOrderReviews(params)
    if (!response.success) {
      throw createBusinessError('GET_ORDER_REVIEWS_FAILED', '获取订单评价失败')
    }
    return response.data
  }

  // 回复订单评价
  @clearCache({
    key: 'order_reviews',
    pattern: true
  })
  @errorHandler({
    showMessage: true
  })
  async replyOrderReview(reviewId, data) {
    return await replyOrderReview(reviewId, data)
  }

  // 导出订单
  @errorHandler({
    showMessage: true,
    showDialog: true
  })
  async exportOrders(params) {
    try {
      const response = await exportOrders(params)
      if (!response.success) {
        throw createBusinessError('EXPORT_ORDERS_FAILED', '导出订单失败')
      }
      return response.data
    } catch (error) {
      if (error.type === ErrorType.NETWORK) {
        throw createBusinessError('EXPORT_ORDERS_NETWORK_ERROR', '导出订单时网络错误，请检查网络连接')
      }
      throw error
    }
  }

  // 打印订单
  @errorHandler({
    showMessage: true,
    showDialog: true
  })
  async printOrder(orderId) {
    if (!orderId) {
      throw createBusinessError('INVALID_PARAMETER', '订单ID不能为空')
    }

    try {
      const response = await printOrder(orderId)
      if (!response.success) {
        throw createBusinessError('PRINT_ORDER_FAILED', '打印订单失败')
      }
      return response.data
    } catch (error) {
      if (error.type === ErrorType.NETWORK) {
        throw createBusinessError('PRINT_ORDER_NETWORK_ERROR', '打印订单时网络错误，请检查网络连接')
      }
      throw error
    }
  }

  // 获取缓存信息
  getCacheInfo() {
    return cacheManager.getInfo()
  }

  // 清除所有缓存
  clearAllCache() {
    cacheManager.clear()
  }

  // 清除指定类型的缓存
  clearCacheByType(type) {
    const cacheInfo = cacheManager.getInfo()
    cacheInfo.keys.forEach(key => {
      if (key.startsWith(type)) {
        cacheManager.remove(key)
      }
    })
  }
}

// 导出订单服务实例
export const orderService = new OrderService() 