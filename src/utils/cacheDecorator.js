import { cacheManager } from './cache'

// 生成缓存键
const generateCacheKey = (key, params) => {
  if (!params) return key
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, k) => {
      acc[k] = params[k]
      return acc
    }, {})
  return `${key}_${JSON.stringify(sortedParams)}`
}

// 缓存装饰器
export const cacheable = (options = {}) => {
  const {
    key,
    expire = 5 * 60 * 1000, // 默认5分钟过期
    type = 'localStorage',
    condition = () => true, // 默认所有请求都缓存
    transform = (data) => data // 默认不转换数据
  } = options

  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args) {
      // 检查是否需要缓存
      if (!condition(...args)) {
        return originalMethod.apply(this, args)
      }

      // 获取缓存键
      const cacheKey = generateCacheKey(key || propertyKey, args[0])
      
      // 尝试从缓存获取数据
      const cachedData = cacheManager.get(cacheKey)
      if (cachedData) {
        return transform(cachedData)
      }

      // 执行原始方法
      const result = await originalMethod.apply(this, args)
      
      // 缓存结果
      if (result) {
        cacheManager.set(cacheKey, result, { expire, type })
      }

      return transform(result)
    }

    return descriptor
  }
}

// 清除缓存装饰器
export const clearCache = (options = {}) => {
  const {
    key,
    pattern = false // 是否使用模式匹配
  } = options

  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args) {
      const result = await originalMethod.apply(this, args)

      if (pattern) {
        // 使用模式匹配清除缓存
        const cacheInfo = cacheManager.getInfo()
        cacheInfo.keys.forEach(cacheKey => {
          if (cacheKey.startsWith(key)) {
            cacheManager.remove(cacheKey)
          }
        })
      } else {
        // 清除指定缓存
        const cacheKey = generateCacheKey(key || propertyKey, args[0])
        cacheManager.remove(cacheKey)
      }

      return result
    }

    return descriptor
  }
}

// 缓存管理器装饰器
export const cacheManagerDecorator = (options = {}) => {
  const {
    autoClear = true,
    clearInterval = 5 * 60 * 1000 // 默认5分钟清理一次
  } = options

  return (target) => {
    // 在类初始化时启动自动清理
    const originalConstructor = target.prototype.constructor
    target.prototype.constructor = function (...args) {
      if (autoClear) {
        cacheManager.startAutoClear(clearInterval)
      }
      return originalConstructor.apply(this, args)
    }

    // 在类销毁时停止自动清理
    const originalBeforeDestroy = target.prototype.beforeDestroy
    target.prototype.beforeDestroy = function () {
      if (autoClear) {
        cacheManager.stopAutoClear()
      }
      if (originalBeforeDestroy) {
        originalBeforeDestroy.call(this)
      }
    }

    return target
  }
}

// 使用示例：
/*
@cacheManagerDecorator()
class OrderService {
  @cacheable({
    key: 'order_list',
    expire: 5 * 60 * 1000,
    condition: (params) => !params.refresh
  })
  async getOrderList(params) {
    // 获取订单列表
  }

  @clearCache({
    key: 'order_list',
    pattern: true
  })
  async updateOrder(orderId, data) {
    // 更新订单
  }
}
*/ 