import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { logService } from '@/services/log'
import { createVNode, render, h } from 'vue'

// 模块级别的变量，用于存储 app 实例和 ErrorMessageComponent
let appInstance = null
let errorMessageComponentGlobal = null

// 错误类型
export const ErrorType = {
  // 系统错误
  SYSTEM: 'SYSTEM_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  BUSINESS: 'BUSINESS_ERROR',
  
  // 业务错误
  ORDER: 'ORDER_ERROR',
  PAYMENT: 'PAYMENT_ERROR',
  USER: 'USER_ERROR',
  FILE: 'FILE_ERROR',
  API: 'API_ERROR',
  
  // 权限错误
  PERMISSION: 'PERMISSION_ERROR',
  ROLE: 'ROLE_ERROR',
  
  // 数据错误
  DATA: 'DATA_ERROR',
  CACHE: 'CACHE_ERROR',
  DATABASE: 'DATABASE_ERROR',
  
  // 资源错误
  RESOURCE: 'RESOURCE_ERROR',
  UPLOAD: 'UPLOAD_ERROR',
  DOWNLOAD: 'DOWNLOAD_ERROR',
  
  // 第三方服务错误
  THIRD_PARTY: 'THIRD_PARTY_ERROR',
  SMS: 'SMS_ERROR',
  EMAIL: 'EMAIL_ERROR',
  PAYMENT_GATEWAY: 'PAYMENT_GATEWAY_ERROR',
  
  // 未知错误
  UNKNOWN: 'UNKNOWN_ERROR'
}

// 错误严重程度
export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
}

// 错误码映射
const ErrorCode = {
  // 系统错误
  400: { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, message: '请求参数错误' },
  401: { type: ErrorType.AUTH, severity: ErrorSeverity.HIGH, message: '未授权，请重新登录' },
  403: { type: ErrorType.PERMISSION, severity: ErrorSeverity.HIGH, message: '拒绝访问' },
  404: { type: ErrorType.RESOURCE, severity: ErrorSeverity.MEDIUM, message: '请求的资源不存在' },
  408: { type: ErrorType.TIMEOUT, severity: ErrorSeverity.MEDIUM, message: '请求超时' },
  500: { type: ErrorType.SYSTEM, severity: ErrorSeverity.HIGH, message: '服务器内部错误' },
  501: { type: ErrorType.SYSTEM, severity: ErrorSeverity.HIGH, message: '服务未实现' },
  502: { type: ErrorType.NETWORK, severity: ErrorSeverity.HIGH, message: '网关错误' },
  503: { type: ErrorType.SYSTEM, severity: ErrorSeverity.HIGH, message: '服务不可用' },
  504: { type: ErrorType.TIMEOUT, severity: ErrorSeverity.MEDIUM, message: '网关超时' },
  505: { type: ErrorType.SYSTEM, severity: ErrorSeverity.HIGH, message: 'HTTP版本不受支持' },

  // 业务错误码
  ORDER_NOT_FOUND: { type: ErrorType.ORDER, severity: ErrorSeverity.MEDIUM, message: '订单不存在' },
  ORDER_STATUS_ERROR: { type: ErrorType.ORDER, severity: ErrorSeverity.MEDIUM, message: '订单状态错误' },
  ORDER_ALREADY_PAID: { type: ErrorType.ORDER, severity: ErrorSeverity.MEDIUM, message: '订单已支付' },
  ORDER_ALREADY_CANCELLED: { type: ErrorType.ORDER, severity: ErrorSeverity.MEDIUM, message: '订单已取消' },
  INSUFFICIENT_BALANCE: { type: ErrorType.PAYMENT, severity: ErrorSeverity.HIGH, message: '余额不足' },
  INVALID_PARAMETER: { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, message: '无效的参数' },
  UNAUTHORIZED_OPERATION: { type: ErrorType.PERMISSION, severity: ErrorSeverity.HIGH, message: '无权限操作' },
  SYSTEM_BUSY: { type: ErrorType.SYSTEM, severity: ErrorSeverity.HIGH, message: '系统繁忙，请稍后重试' },
  
  // 文件错误码
  FILE_TOO_LARGE: { type: ErrorType.FILE, severity: ErrorSeverity.MEDIUM, message: '文件大小超出限制' },
  FILE_TYPE_ERROR: { type: ErrorType.FILE, severity: ErrorSeverity.MEDIUM, message: '不支持的文件类型' },
  FILE_UPLOAD_FAILED: { type: ErrorType.UPLOAD, severity: ErrorSeverity.MEDIUM, message: '文件上传失败' },
  FILE_DOWNLOAD_FAILED: { type: ErrorType.DOWNLOAD, severity: ErrorSeverity.MEDIUM, message: '文件下载失败' },
  
  // 第三方服务错误码
  SMS_SEND_FAILED: { type: ErrorType.SMS, severity: ErrorSeverity.MEDIUM, message: '短信发送失败' },
  EMAIL_SEND_FAILED: { type: ErrorType.EMAIL, severity: ErrorSeverity.MEDIUM, message: '邮件发送失败' },
  PAYMENT_FAILED: { type: ErrorType.PAYMENT_GATEWAY, severity: ErrorSeverity.HIGH, message: '支付失败' },
  
  // 数据错误码
  DATA_NOT_FOUND: { type: ErrorType.DATA, severity: ErrorSeverity.MEDIUM, message: '数据不存在' },
  DATA_VALIDATION_FAILED: { type: ErrorType.DATA, severity: ErrorSeverity.MEDIUM, message: '数据验证失败' },
  CACHE_ERROR: { type: ErrorType.CACHE, severity: ErrorSeverity.LOW, message: '缓存操作失败' },
  DATABASE_ERROR: { type: ErrorType.DATABASE, severity: ErrorSeverity.HIGH, message: '数据库操作失败' }
}

// 错误处理策略
const ErrorStrategy = {
  // 认证错误：清除用户信息并跳转到登录页
  [ErrorType.AUTH]: (errorInfo, options) => {
    const userStore = useUserStore()
    userStore.clearUserInfo()
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: true,
      closable: false
    }).then(() => {
      window.location.href = '/login'
    })
  },

  // 权限错误：显示无权限提示
  [ErrorType.PERMISSION]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: true
    })
  },

  // 网络错误：提供重试选项
  [ErrorType.NETWORK]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      retry: true,
      retryCallback: options.retryCallback
    })
  },

  // 超时错误：提供重试选项
  [ErrorType.TIMEOUT]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      retry: true,
      retryCallback: options.retryCallback
    })
  },

  // 验证错误：显示表单错误
  [ErrorType.VALIDATION]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: true
    })
  },

  // 业务错误：显示业务错误提示
  [ErrorType.BUSINESS]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: errorInfo.severity === ErrorSeverity.HIGH
    })
  },

  // 订单错误：显示订单相关错误
  [ErrorType.ORDER]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: errorInfo.severity === ErrorSeverity.HIGH
    })
  },

  // 支付错误：显示支付相关错误
  [ErrorType.PAYMENT]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: true
    })
  },

  // 文件错误：显示文件操作错误
  [ErrorType.FILE]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: errorInfo.severity === ErrorSeverity.HIGH
    })
  },

  // 上传错误：显示上传失败错误
  [ErrorType.UPLOAD]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: true
    })
  },

  // 下载错误：显示下载失败错误
  [ErrorType.DOWNLOAD]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: true
    })
  },

  // 第三方服务错误：显示第三方服务错误
  [ErrorType.THIRD_PARTY]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: errorInfo.severity === ErrorSeverity.HIGH
    })
  },

  // 数据错误：显示数据操作错误
  [ErrorType.DATA]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: errorInfo.severity === ErrorSeverity.HIGH
    })
  },

  // 缓存错误：显示缓存操作错误
  [ErrorType.CACHE]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: false
    })
  },

  // 数据库错误：显示数据库操作错误
  [ErrorType.DATABASE]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: true
    })
  },

  // 系统错误：显示系统错误
  [ErrorType.SYSTEM]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: true
    })
  },

  // 未知错误：显示通用错误提示
  [ErrorType.UNKNOWN]: (errorInfo, options) => {
    showErrorMessage(errorInfo, {
      ...options,
      showDialog: errorInfo.severity === ErrorSeverity.HIGH
    })
  }
}

// 错误日志
class ErrorLogger {
  constructor() {
    this.logs = []
    this.maxLogs = 100 // 最多保存100条日志
  }

  addLog(error) {
    this.logs.unshift({ ...error, timestamp: Date.now() })
    if (this.logs.length > this.maxLogs) {
      this.logs.pop()
    }
  }

  getLogs() {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }

  // 假设这是一个异步操作，将日志发送到服务器
  async sendToServer(log) {
    try {
      // 实际的发送日志到后端API的逻辑
      // 例如：await request.post('/api/logs', log);
      console.log('Sending log to server:', log)
    } catch (error) {
      console.error('Failed to send log to server:', error)
    }
  }
}

// 获取错误信息
const getErrorInfo = (error) => {
  const info = {
    type: ErrorType.UNKNOWN,
    code: 'UNKNOWN',
    message: '未知错误',
    stack: error.stack,
    details: error.data || null,
    severity: ErrorSeverity.MEDIUM,
    url: window.location.href,
    method: 'N/A', // 如果是API错误，可以补充
    params: null, // 如果是API错误，可以补充
    response: null // 如果是API错误，可以补充
  }

  if (error instanceof Error) {
    info.message = error.message
    if (error.type) info.type = error.type
    if (error.code) info.code = error.code
    if (error.severity) info.severity = error.severity
    if (error.config) { // Axios Error
      info.url = error.config.url
      info.method = error.config.method?.toUpperCase()
      info.params = error.config.params
      info.response = error.response?.data
    }
  }

  // 根据错误码补充信息
  if (ErrorCode[info.code]) {
    info.type = ErrorCode[info.code].type || info.type
    info.message = ErrorCode[info.code].message || info.message
    info.severity = ErrorCode[info.code].severity || info.severity
  }

  return info
}

// 获取错误标题
const getErrorTitle = (errorInfo) => {
  const titles = {
    [ErrorType.SYSTEM]: '系统错误',
    [ErrorType.NETWORK]: '网络错误',
    [ErrorType.TIMEOUT]: '请求超时',
    [ErrorType.AUTH]: '认证失败',
    [ErrorType.VALIDATION]: '参数校验失败',
    [ErrorType.BUSINESS]: '业务处理失败',
    [ErrorType.ORDER]: '订单错误',
    [ErrorType.PAYMENT]: '支付错误',
    [ErrorType.USER]: '用户错误',
    [ErrorType.FILE]: '文件错误',
    [ErrorType.API]: '接口错误',
    [ErrorType.PERMISSION]: '权限不足',
    [ErrorType.ROLE]: '角色错误',
    [ErrorType.DATA]: '数据错误',
    [ErrorType.CACHE]: '缓存错误',
    [ErrorType.DATABASE]: '数据库错误',
    [ErrorType.RESOURCE]: '资源错误',
    [ErrorType.UPLOAD]: '上传失败',
    [ErrorType.DOWNLOAD]: '下载失败',
    [ErrorType.THIRD_PARTY]: '第三方服务错误',
    [ErrorType.SMS]: '短信服务错误',
    [ErrorType.EMAIL]: '邮件服务错误',
    [ErrorType.PAYMENT_GATEWAY]: '支付网关错误',
    [ErrorType.UNKNOWN]: '未知错误'
  }
  return titles[errorInfo.type] || titles[ErrorType.UNKNOWN]
}

// 显示错误消息
const showErrorMessage = (errorInfo, options = {}) => {
  const {
    showDialog = false,
    retry = false,
    retryCallback,
    closable = true,
    onClose
  } = options

  const actions = []

  if (retry) {
    actions.push({
      text: '重试',
      type: 'primary',
      callback: () => {
        if (retryCallback) {
          retryCallback()
        }
      }
    })
  }

  const errorDetails = errorInfo.details ? JSON.stringify(errorInfo.details, null, 2) : errorInfo.stack || '无详情'

  // 检查 ErrorMessageComponent 是否存在
  if (!errorMessageComponentGlobal) {
    console.warn('ErrorMessageComponent is not provided to showErrorMessage. Falling back to ElMessage.')
    ElMessage({
      type: errorInfo.severity === ErrorSeverity.HIGH ? 'error' : 'warning',
      message: `${getErrorTitle(errorInfo)}: ${errorInfo.message}`,
      duration: options.duration || 5000,
      showClose: closable,
      onClose: onClose
    })
    return Promise.resolve()
  }

  // 创建消息组件实例
  const vnode = createVNode(errorMessageComponentGlobal, {
    type: errorInfo.type || ErrorType.UNKNOWN,
    severity: errorInfo.severity || ErrorSeverity.MEDIUM,
    title: getErrorTitle(errorInfo),
    message: errorInfo.message,
    details: errorDetails,
    showDetails: errorInfo.severity === ErrorSeverity.HIGH || errorInfo.severity === ErrorSeverity.CRITICAL,
    closable,
    actions,
    isNotification: !showDialog,
    onClose: () => {
      if (onClose) onClose()
      // 如果是对话框模式，则在关闭时销毁 VNode
      if (showDialog) {
        render(null, container)
        document.body.removeChild(container)
      }
    }
  })
  // 将 app 的上下文传递给 vnode
  if (appInstance && appInstance._context) {
    vnode.appContext = appInstance._context
  }

  const container = document.createElement('div')
  document.body.appendChild(container)
  render(vnode, container)

  // 如果不是通知，显示为 ElMessageBox
  if (showDialog) {
    // 弹出 Element Plus 的 MessageBox
    ElMessageBox.alert(container, getErrorTitle(errorInfo), {
      dangerouslyUseHTMLString: true,
      showConfirmButton: false,
      showCancelButton: false,
      showClose: closable,
      closeOnClickModal: closable,
      closeOnPressEscape: closable,
      callback: () => {
        // 确保容器被移除
        if (container.parentNode) {
          render(null, container)
          document.body.removeChild(container)
        }
        if (onClose) onClose()
      }
    })
  } else {
    // 显示为通知
    ElMessage({
      type: errorInfo.severity === ErrorSeverity.HIGH ? 'error' : 'warning',
      message: h(errorMessageComponentGlobal, {
        type: errorInfo.type,
        severity: errorInfo.severity,
        title: getErrorTitle(errorInfo),
        message: errorInfo.message,
        details: errorDetails,
        showDetails: errorInfo.severity === ErrorSeverity.HIGH || errorInfo.severity === ErrorSeverity.CRITICAL,
        closable: false,
        actions: actions,
        isNotification: true,
        onClose: () => {
          render(null, container)
          document.body.removeChild(container)
          if (onClose) onClose()
        }
      }),
      duration: options.duration || 5000,
      showClose: closable,
      onClose: onClose
    })
  }

  return Promise.resolve() // 统一返回 Promise 便于链式调用
}

// 创建错误对象
export const createError = (type, code, message, data = null, severity = ErrorSeverity.MEDIUM) => {
  const error = new Error(message)
  error.type = type
  error.code = code
  error.data = data
  error.severity = severity
  return error
}

// 创建业务错误
export const createBusinessError = (code, message, data = null, severity = ErrorSeverity.MEDIUM) => {
  return createError(ErrorType.BUSINESS, code, message, data, severity)
}

// 创建验证错误
export const createValidationError = (code, message, fields = null, severity = ErrorSeverity.LOW) => {
  return createError(ErrorType.VALIDATION, code, message, { fields }, severity)
}

// 创建权限错误
export const createPermissionError = (code, message, data = null, severity = ErrorSeverity.HIGH) => {
  return createError(ErrorType.PERMISSION, code, message, data, severity)
}

// 创建系统错误
export const createSystemError = (code, message, data = null, severity = ErrorSeverity.HIGH) => {
  return createError(ErrorType.SYSTEM, code, message, data, severity)
}

// 错误重试装饰器
export const retryable = (options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = (error) => 
      error.type === ErrorType.NETWORK || 
      error.type === ErrorType.TIMEOUT ||
      error.type === ErrorType.SYSTEM,
    logRetry = true,
    severity = ErrorSeverity.MEDIUM
  } = options

  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args) {
      let lastError = null
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await originalMethod.apply(this, args)
        } catch (error) {
          lastError = error
          const errorInfo = getErrorInfo(error)
          
          if (!retryCondition(errorInfo)) {
            throw error
          }
          
          if (i < maxRetries - 1) {
            // 记录重试日志
            if (logRetry) {
              logService.addOperationLog({
                action: `${propertyKey}_retry`,
                target: target.constructor.name,
                params: {
                  retryCount: i + 1,
                  maxRetries,
                  error: errorInfo
                },
                result: null,
                severity
              })
            }

            await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
          }
        }
      }
      
      throw lastError
    }

    return descriptor
  }
}

// 错误处理装饰器
export const errorHandler = (options = {}) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        handleError(error, {
          ...options,
          onError: (errorInfo) => {
            // 记录操作日志
            logService.addOperationLog({
              action: propertyKey,
              target: target.constructor.name,
              params: args,
              result: { error: errorInfo },
              severity: errorInfo.severity
            })

            // 调用自定义错误回调
            if (options.onError) {
              options.onError(errorInfo)
            }
          }
        })
        throw error
      }
    }

    return descriptor
  }
}

export const handleError = (error, options = {}) => {
  const userStore = useUserStore()
  const errorInfo = getErrorInfo(error)
  const { 
    showMessage = true, 
    logError = true,
    showDialog = false,
    retry = false,
    retryCallback = null,
    // ErrorMessageComponent, // Ensure this is passed from initErrorHandler
    // app // Ensure app instance is passed
  } = options

  // 记录错误日志
  if (logError) {
    logService.addErrorLog(errorInfo)
  }

  // 根据错误类型选择处理策略
  const strategy = ErrorStrategy[errorInfo.type] || ErrorStrategy[ErrorType.UNKNOWN]

  if (strategy) {
    strategy(errorInfo, { 
      ...options, 
      ErrorMessageComponent: errorMessageComponentGlobal, // 使用全局变量
      app: appInstance, // 使用全局变量
      showDialog // Ensure showDialog is passed
    })
  } else {
    // 如果没有特定策略，则使用默认显示方式
    if (showMessage) {
      showErrorMessage(errorInfo, options)
    }
  }
}

// 初始化错误处理
export const initErrorHandler = (app, ErrorMessageComponent) => {
  // 存储 app 实例和 ErrorMessageComponent
  appInstance = app
  errorMessageComponentGlobal = ErrorMessageComponent

  // 初始化日志服务
  logService.init()

  // 定义事件监听器，确保正确传递 ErrorMessageComponent 和 app 实例
  const handleGlobalErrorEvent = (event) => {
    const error = {
      type: ErrorType.SYSTEM,
      severity: ErrorSeverity.HIGH,
      message: event.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }
    handleError(error, { showMessage: true, logError: true, ErrorMessageComponent: errorMessageComponentGlobal, app: appInstance })
  }

  const handleGlobalRejectionEvent = (event) => {
    const error = event.reason
    handleError(error, {
      logError: true,
      showDialog: true,
      ErrorMessageComponent: errorMessageComponentGlobal, // 传递组件
      app: appInstance // 传递 app 实例
    })
  }

  // 全局错误处理
  window.addEventListener('error', handleGlobalErrorEvent)

  // 全局Promise拒绝处理
  window.addEventListener('unhandledrejection', handleGlobalRejectionEvent)

  // 全局Vue错误捕获
  app.config.errorHandler = (err, vm, info) => {
    const errorInfo = getErrorInfo(err)
    handleError(errorInfo, {
      logError: true,
      showDialog: false, // 默认以通知形式显示
      ErrorMessageComponent: errorMessageComponentGlobal, // 传递组件
      app: appInstance // 传递 app 实例
    })
  }

  // 清理函数
  return () => {
    logService.destroy()
    window.removeEventListener('error', handleGlobalErrorEvent)
    window.removeEventListener('unhandledrejection', handleGlobalRejectionEvent)
  }
}