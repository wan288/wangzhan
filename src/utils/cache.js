// 缓存键前缀
const PREFIX = 'KFC_ORDER_'

// 缓存类型
const CACHE_TYPES = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage'
}

// 默认缓存配置
const DEFAULT_CONFIG = {
  type: CACHE_TYPES.LOCAL,
  expire: 30 * 60 * 1000, // 默认30分钟过期
  encrypt: false // 默认不加密
}

// 生成缓存键
const generateKey = (key) => {
  return `${PREFIX}${key}`
}

// 获取缓存存储对象
const getStorage = (type) => {
  return type === CACHE_TYPES.LOCAL ? localStorage : sessionStorage
}

// 序列化数据
const serialize = (data) => {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error('Failed to serialize data:', error)
    return null
  }
}

// 反序列化数据
const deserialize = (data) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to deserialize data:', error)
    return null
  }
}

// 加密数据
const encrypt = (data) => {
  // TODO: 实现数据加密
  return data
}

// 解密数据
const decrypt = (data) => {
  // TODO: 实现数据解密
  return data
}

// 设置缓存
export const setCache = (key, value, config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storage = getStorage(finalConfig.type)
  const cacheKey = generateKey(key)

  const cacheData = {
    value: finalConfig.encrypt ? encrypt(value) : value,
    expire: finalConfig.expire ? Date.now() + finalConfig.expire : null,
    timestamp: Date.now()
  }

  storage.setItem(cacheKey, serialize(cacheData))
}

// 获取缓存
export const getCache = (key, config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storage = getStorage(finalConfig.type)
  const cacheKey = generateKey(key)

  const cacheData = deserialize(storage.getItem(cacheKey))
  if (!cacheData) return null

  // 检查是否过期
  if (cacheData.expire && Date.now() > cacheData.expire) {
    removeCache(key, config)
    return null
  }

  return finalConfig.encrypt ? decrypt(cacheData.value) : cacheData.value
}

// 移除缓存
export const removeCache = (key, config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storage = getStorage(finalConfig.type)
  const cacheKey = generateKey(key)

  storage.removeItem(cacheKey)
}

// 清空缓存
export const clearCache = (config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storage = getStorage(finalConfig.type)

  Object.keys(storage).forEach(key => {
    if (key.startsWith(PREFIX)) {
      storage.removeItem(key)
    }
  })
}

// 获取缓存大小
export const getCacheSize = (config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storage = getStorage(finalConfig.type)
  let size = 0

  Object.keys(storage).forEach(key => {
    if (key.startsWith(PREFIX)) {
      size += storage.getItem(key).length
    }
  })

  return size
}

// 获取缓存信息
export const getCacheInfo = (config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storage = getStorage(finalConfig.type)
  const info = {
    total: 0,
    expired: 0,
    size: 0,
    keys: []
  }

  Object.keys(storage).forEach(key => {
    if (key.startsWith(PREFIX)) {
      const cacheData = deserialize(storage.getItem(key))
      info.total++
      info.size += storage.getItem(key).length
      info.keys.push(key.replace(PREFIX, ''))

      if (cacheData.expire && Date.now() > cacheData.expire) {
        info.expired++
      }
    }
  })

  return info
}

// 自动清理过期缓存
export const autoClearExpiredCache = (config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storage = getStorage(finalConfig.type)

  Object.keys(storage).forEach(key => {
    if (key.startsWith(PREFIX)) {
      const cacheData = deserialize(storage.getItem(key))
      if (cacheData.expire && Date.now() > cacheData.expire) {
        storage.removeItem(key)
      }
    }
  })
}

// 设置定时清理任务
let clearTimer = null
export const startAutoClear = (interval = 5 * 60 * 1000) => { // 默认5分钟清理一次
  if (clearTimer) {
    clearInterval(clearTimer)
  }

  clearTimer = setInterval(() => {
    autoClearExpiredCache()
  }, interval)
}

// 停止定时清理任务
export const stopAutoClear = () => {
  if (clearTimer) {
    clearInterval(clearTimer)
    clearTimer = null
  }
}

// 缓存管理器
export class CacheManager {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  set(key, value) {
    setCache(key, value, this.config)
  }

  get(key) {
    return getCache(key, this.config)
  }

  remove(key) {
    removeCache(key, this.config)
  }

  clear() {
    clearCache(this.config)
  }

  getSize() {
    return getCacheSize(this.config)
  }

  getInfo() {
    return getCacheInfo(this.config)
  }

  startAutoClear(interval) {
    startAutoClear(interval)
  }

  stopAutoClear() {
    stopAutoClear()
  }
}

// 导出默认缓存管理器实例
export const cacheManager = new CacheManager()

// 导出缓存类型
export const CACHE_TYPE = CACHE_TYPES 