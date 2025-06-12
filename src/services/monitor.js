import { ref, computed } from 'vue'
import { ErrorType, ErrorSeverity } from '@/utils/error'
import { logService } from '@/services/log'

// 监控配置
const DEFAULT_CONFIG = {
  // 错误统计时间窗口（毫秒）
  timeWindow: 5 * 60 * 1000, // 5分钟
  // 错误阈值配置
  thresholds: {
    [ErrorSeverity.LOW]: 100,    // 低严重程度错误阈值
    [ErrorSeverity.MEDIUM]: 50,  // 中等严重程度错误阈值
    [ErrorSeverity.HIGH]: 20,    // 高严重程度错误阈值
    [ErrorSeverity.CRITICAL]: 5  // 严重错误阈值
  },
  // 告警冷却时间（毫秒）
  alertCooldown: 5 * 60 * 1000, // 5分钟
  // 告警通知方式
  alertMethods: ['notification', 'email', 'sms'],
  // 告警接收者
  alertReceivers: {
    email: [],
    sms: []
  }
}

class MonitorService {
  constructor() {
    // 错误统计
    this.errorStats = ref({
      total: 0,
      byType: {},
      bySeverity: {},
      recent: []
    })

    // 告警状态
    this.alertState = ref({
      lastAlertTime: null,
      activeAlerts: new Set(),
      alertHistory: []
    })

    // 监控配置
    this.config = ref({ ...DEFAULT_CONFIG })

    // 监控状态
    this.isMonitoring = ref(false)
    this.monitorTimer = null
  }

  // 初始化监控服务
  init(config = {}) {
    // 合并配置
    this.config.value = {
      ...DEFAULT_CONFIG,
      ...config
    }

    // 启动监控
    this.startMonitoring()

    // 注册错误监听
    this.registerErrorListeners()
  }

  // 销毁监控服务
  destroy() {
    this.stopMonitoring()
    this.unregisterErrorListeners()
  }

  // 启动监控
  startMonitoring() {
    if (this.isMonitoring.value) return

    this.isMonitoring.value = true
    this.monitorTimer = setInterval(() => {
      this.checkErrorThresholds()
      this.cleanupOldErrors()
    }, 60000) // 每分钟检查一次
  }

  // 停止监控
  stopMonitoring() {
    if (!this.isMonitoring.value) return

    this.isMonitoring.value = false
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer)
      this.monitorTimer = null
    }
  }

  // 注册错误监听
  registerErrorListeners() {
    // 监听全局错误
    window.addEventListener('error', this.handleGlobalError)
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection)

    // 监听日志服务
    logService.onErrorLogged(this.handleLoggedError)
  }

  // 注销错误监听
  unregisterErrorListeners() {
    window.removeEventListener('error', this.handleGlobalError)
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
    logService.offErrorLogged(this.handleLoggedError)
  }

  // 处理全局错误
  handleGlobalError = (event) => {
    this.recordError({
      type: ErrorType.SYSTEM,
      severity: ErrorSeverity.HIGH,
      message: event.message,
      stack: event.error?.stack,
      source: 'global',
      timestamp: Date.now()
    })
  }

  // 处理未捕获的 Promise 错误
  handleUnhandledRejection = (event) => {
    this.recordError({
      type: ErrorType.SYSTEM,
      severity: ErrorSeverity.HIGH,
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      source: 'promise',
      timestamp: Date.now()
    })
  }

  // 处理已记录的错误
  handleLoggedError = (error) => {
    this.recordError({
      ...error,
      source: 'logged',
      timestamp: Date.now()
    })
  }

  // 记录错误
  recordError(error) {
    const { type, severity, timestamp } = error

    // 更新错误统计
    this.errorStats.value.total++
    this.errorStats.value.byType[type] = (this.errorStats.value.byType[type] || 0) + 1
    this.errorStats.value.bySeverity[severity] = (this.errorStats.value.bySeverity[severity] || 0) + 1
    this.errorStats.value.recent.push(error)

    // 检查是否需要触发告警
    this.checkErrorThresholds()
  }

  // 检查错误阈值
  checkErrorThresholds() {
    const now = Date.now()
    const { timeWindow, thresholds, alertCooldown } = this.config.value

    // 获取时间窗口内的错误
    const recentErrors = this.errorStats.value.recent.filter(
      error => now - error.timestamp <= timeWindow
    )

    // 按严重程度统计错误数量
    const errorCounts = recentErrors.reduce((counts, error) => {
      counts[error.severity] = (counts[error.severity] || 0) + 1
      return counts
    }, {})

    // 检查每种严重程度的错误是否超过阈值
    Object.entries(errorCounts).forEach(([severity, count]) => {
      const threshold = thresholds[severity]
      if (count >= threshold) {
        this.triggerAlert(severity, count, threshold, recentErrors)
      }
    })
  }

  // 触发告警
  async triggerAlert(severity, count, threshold, errors) {
    const now = Date.now()
    const { alertCooldown, alertMethods, alertReceivers } = this.config.value
    const alertKey = `${severity}_${Math.floor(now / alertCooldown)}`

    // 检查告警冷却
    if (this.alertState.value.activeAlerts.has(alertKey)) {
      return
    }

    // 创建告警信息
    const alert = {
      id: Date.now().toString(),
      severity,
      count,
      threshold,
      timestamp: now,
      errors: errors.slice(-10), // 只保留最近的10个错误
      methods: alertMethods
    }

    // 更新告警状态
    this.alertState.value.activeAlerts.add(alertKey)
    this.alertState.value.lastAlertTime = now
    this.alertState.value.alertHistory.push(alert)

    // 发送告警通知
    try {
      await this.sendAlertNotifications(alert, alertReceivers)
    } catch (error) {
      console.error('Failed to send alert notifications:', error)
    }

    // 清理过期的告警
    setTimeout(() => {
      this.alertState.value.activeAlerts.delete(alertKey)
    }, alertCooldown)
  }

  // 发送告警通知
  async sendAlertNotifications(alert, receivers) {
    const { methods } = alert
    const notifications = []

    // 准备通知内容
    const content = this.formatAlertContent(alert)

    // 发送通知
    if (methods.includes('notification')) {
      notifications.push(this.sendNotificationAlert(content))
    }
    if (methods.includes('email') && receivers.email.length > 0) {
      notifications.push(this.sendEmailAlert(content, receivers.email))
    }
    if (methods.includes('sms') && receivers.sms.length > 0) {
      notifications.push(this.sendSmsAlert(content, receivers.sms))
    }

    // 等待所有通知发送完成
    await Promise.allSettled(notifications)
  }

  // 格式化告警内容
  formatAlertContent(alert) {
    const { severity, count, threshold, errors } = alert
    const errorTypes = [...new Set(errors.map(e => e.type))]
    const errorMessages = errors.map(e => e.message)

    return {
      title: `错误告警 - ${severity}级别`,
      content: `
        检测到${count}个${severity}级别的错误，超过阈值${threshold}
        错误类型: ${errorTypes.join(', ')}
        最近错误:
        ${errorMessages.slice(0, 3).join('\n')}
        ${errorMessages.length > 3 ? `...等${errorMessages.length}个错误` : ''}
      `.trim(),
      details: errors
    }
  }

  // 发送通知告警
  async sendNotificationAlert(content) {
    // 使用 Element Plus 的通知组件
    const { ElNotification } = await import('element-plus')
    ElNotification({
      title: content.title,
      message: content.content,
      type: this.getAlertType(content.severity),
      duration: 0,
      position: 'top-right'
    })
  }

  // 发送邮件告警
  async sendEmailAlert(content, receivers) {
    // TODO: 实现邮件发送
    console.log('Sending email alert:', { content, receivers })
  }

  // 发送短信告警
  async sendSmsAlert(content, receivers) {
    // TODO: 实现短信发送
    console.log('Sending SMS alert:', { content, receivers })
  }

  // 获取告警类型
  getAlertType(severity) {
    const types = {
      [ErrorSeverity.LOW]: 'info',
      [ErrorSeverity.MEDIUM]: 'warning',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'error'
    }
    return types[severity] || 'warning'
  }

  // 清理旧错误
  cleanupOldErrors() {
    const now = Date.now()
    const { timeWindow } = this.config.value

    // 清理过期的错误记录
    this.errorStats.value.recent = this.errorStats.value.recent.filter(
      error => now - error.timestamp <= timeWindow
    )

    // 清理过期的告警历史
    this.alertState.value.alertHistory = this.alertState.value.alertHistory.filter(
      alert => now - alert.timestamp <= timeWindow * 2
    )
  }

  // 获取错误统计
  getErrorStats() {
    return {
      total: this.errorStats.value.total,
      byType: { ...this.errorStats.value.byType },
      bySeverity: { ...this.errorStats.value.bySeverity },
      recent: [...this.errorStats.value.recent]
    }
  }

  // 获取告警历史
  getAlertHistory() {
    return [...this.alertState.value.alertHistory]
  }

  // 获取监控状态
  getMonitorStatus() {
    return {
      isMonitoring: this.isMonitoring.value,
      lastAlertTime: this.alertState.value.lastAlertTime,
      activeAlerts: Array.from(this.alertState.value.activeAlerts),
      config: { ...this.config.value }
    }
  }

  // 更新监控配置
  updateConfig(config) {
    this.config.value = {
      ...this.config.value,
      ...config
    }
  }

  // 获取错误关联分析数据
  async getErrorCorrelation(params = {}) {
    const {
      timeRange = 'day',
      minCorrelation = 0.5,
      maxErrors = 100,
      errorType = null,
      severity = null
    } = params

    try {
      // 获取时间范围内的所有错误
      const errors = await this.getErrorList({
        timeRange,
        type: errorType,
        severity,
        limit: maxErrors
      })

      // 计算错误之间的关联度
      const correlations = this.calculateErrorCorrelations(errors, minCorrelation)

      // 构建关联图数据
      const graphData = this.buildCorrelationGraph(correlations)

      // 获取关联错误组
      const errorGroups = this.findErrorGroups(correlations)

      // 分析关联原因
      const analysis = await this.analyzeCorrelationCauses(errorGroups)

      return {
        graph: graphData,
        groups: errorGroups,
        analysis,
        statistics: {
          totalErrors: errors.length,
          correlatedErrors: graphData.nodes.length,
          correlationGroups: errorGroups.length,
          averageCorrelation: this.calculateAverageCorrelation(correlations)
        }
      }
    } catch (error) {
      console.error('获取错误关联分析失败:', error)
      throw error
    }
  }

  // 计算错误之间的关联度
  calculateErrorCorrelations(errors, minCorrelation) {
    const correlations = []
    const errorMap = new Map()

    // 构建错误特征向量
    errors.forEach(error => {
      const features = this.extractErrorFeatures(error)
      errorMap.set(error.id, features)
    })

    // 计算每对错误之间的关联度
    for (let i = 0; i < errors.length; i++) {
      for (let j = i + 1; j < errors.length; j++) {
        const error1 = errors[i]
        const error2 = errors[j]
        const features1 = errorMap.get(error1.id)
        const features2 = errorMap.get(error2.id)

        const correlation = this.calculateCorrelationScore(features1, features2)
        if (correlation >= minCorrelation) {
          correlations.push({
            source: error1.id,
            target: error2.id,
            correlation,
            commonFeatures: this.findCommonFeatures(features1, features2)
          })
        }
      }
    }

    return correlations
  }

  // 提取错误特征
  extractErrorFeatures(error) {
    return {
      type: error.type,
      severity: error.severity,
      source: error.source,
      stack: this.normalizeStack(error.stack),
      message: this.normalizeMessage(error.message),
      context: this.normalizeContext(error.context),
      timestamp: error.timestamp,
      userAgent: error.context?.userAgent,
      url: error.context?.url,
      method: error.context?.method,
      status: error.context?.status,
      params: error.context?.params
    }
  }

  // 标准化错误堆栈
  normalizeStack(stack) {
    if (!stack) return ''
    return stack
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.includes('node_modules'))
      .join('\n')
  }

  // 标准化错误消息
  normalizeMessage(message) {
    if (!message) return ''
    return message
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
  }

  // 标准化上下文信息
  normalizeContext(context) {
    if (!context) return {}
    const normalized = {}
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'string') {
        normalized[key] = this.normalizeMessage(value)
      } else if (typeof value === 'object' && value !== null) {
        normalized[key] = this.normalizeContext(value)
      } else {
        normalized[key] = value
      }
    }
    return normalized
  }

  // 计算关联度分数
  calculateCorrelationScore(features1, features2) {
    let score = 0
    let totalWeight = 0

    // 类型匹配权重
    if (features1.type === features2.type) {
      score += 0.3
      totalWeight += 0.3
    }

    // 严重程度匹配权重
    if (features1.severity === features2.severity) {
      score += 0.2
      totalWeight += 0.2
    }

    // 来源匹配权重
    if (features1.source === features2.source) {
      score += 0.1
      totalWeight += 0.1
    }

    // 堆栈相似度权重
    const stackSimilarity = this.calculateTextSimilarity(
      features1.stack,
      features2.stack
    )
    score += stackSimilarity * 0.2
    totalWeight += 0.2

    // 消息相似度权重
    const messageSimilarity = this.calculateTextSimilarity(
      features1.message,
      features2.message
    )
    score += messageSimilarity * 0.1
    totalWeight += 0.1

    // 上下文相似度权重
    const contextSimilarity = this.calculateContextSimilarity(
      features1.context,
      features2.context
    )
    score += contextSimilarity * 0.1
    totalWeight += 0.1

    return totalWeight > 0 ? score / totalWeight : 0
  }

  // 计算文本相似度
  calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0
    const words1 = new Set(text1.split(/\s+/))
    const words2 = new Set(text2.split(/\s+/))
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    return union.size > 0 ? intersection.size / union.size : 0
  }

  // 计算上下文相似度
  calculateContextSimilarity(context1, context2) {
    if (!context1 || !context2) return 0
    const keys1 = new Set(Object.keys(context1))
    const keys2 = new Set(Object.keys(context2))
    const commonKeys = new Set([...keys1].filter(x => keys2.has(x)))
    
    if (commonKeys.size === 0) return 0

    let totalSimilarity = 0
    for (const key of commonKeys) {
      const value1 = context1[key]
      const value2 = context2[key]
      
      if (typeof value1 === 'string' && typeof value2 === 'string') {
        totalSimilarity += this.calculateTextSimilarity(value1, value2)
      } else if (typeof value1 === 'object' && typeof value2 === 'object') {
        totalSimilarity += this.calculateContextSimilarity(value1, value2)
      } else if (value1 === value2) {
        totalSimilarity += 1
      }
    }

    return totalSimilarity / commonKeys.size
  }

  // 查找共同特征
  findCommonFeatures(features1, features2) {
    const common = {}
    
    // 检查类型
    if (features1.type === features2.type) {
      common.type = features1.type
    }

    // 检查严重程度
    if (features1.severity === features2.severity) {
      common.severity = features1.severity
    }

    // 检查来源
    if (features1.source === features2.source) {
      common.source = features1.source
    }

    // 检查上下文共同项
    const commonContext = {}
    for (const key in features1.context) {
      if (features2.context[key] === features1.context[key]) {
        commonContext[key] = features1.context[key]
      }
    }
    if (Object.keys(commonContext).length > 0) {
      common.context = commonContext
    }

    return common
  }

  // 构建关联图数据
  buildCorrelationGraph(correlations) {
    const nodes = new Set()
    const edges = []

    correlations.forEach(correlation => {
      nodes.add(correlation.source)
      nodes.add(correlation.target)
      edges.push({
        source: correlation.source,
        target: correlation.target,
        value: correlation.correlation,
        commonFeatures: correlation.commonFeatures
      })
    })

    return {
      nodes: Array.from(nodes).map(id => ({
        id,
        symbolSize: this.calculateNodeSize(id, correlations),
        category: this.calculateNodeCategory(id, correlations)
      })),
      edges
    }
  }

  // 计算节点大小
  calculateNodeSize(nodeId, correlations) {
    const connections = correlations.filter(
      c => c.source === nodeId || c.target === nodeId
    ).length
    return Math.min(20 + connections * 2, 50)
  }

  // 计算节点类别
  calculateNodeCategory(nodeId, correlations) {
    const connections = correlations.filter(
      c => c.source === nodeId || c.target === nodeId
    )
    const avgCorrelation = connections.reduce(
      (sum, c) => sum + c.correlation,
      0
    ) / connections.length

    if (avgCorrelation >= 0.8) return 'high'
    if (avgCorrelation >= 0.6) return 'medium'
    return 'low'
  }

  // 查找错误组
  findErrorGroups(correlations) {
    const groups = []
    const visited = new Set()

    // 使用深度优先搜索查找连通分量
    const dfs = (nodeId, group) => {
      visited.add(nodeId)
      group.push(nodeId)

      correlations
        .filter(c => c.source === nodeId || c.target === nodeId)
        .forEach(c => {
          const nextNode = c.source === nodeId ? c.target : c.source
          if (!visited.has(nextNode)) {
            dfs(nextNode, group)
          }
        })
    }

    // 遍历所有节点
    correlations.forEach(c => {
      if (!visited.has(c.source)) {
        const group = []
        dfs(c.source, group)
        if (group.length > 1) {
          groups.push(group)
        }
      }
    })

    return groups
  }

  // 分析关联原因
  async analyzeCorrelationCauses(errorGroups) {
    const analysis = []

    for (const group of errorGroups) {
      // 获取组内所有错误的详细信息
      const errors = await Promise.all(
        group.map(id => this.getErrorDetails(id))
      )

      // 分析共同特征
      const commonFeatures = this.findGroupCommonFeatures(errors)

      // 分析时间模式
      const timePattern = this.analyzeTimePattern(errors)

      // 分析错误链
      const errorChain = this.analyzeErrorChain(errors)

      // 生成分析报告
      analysis.push({
        groupId: group.join('-'),
        errorCount: group.length,
        commonFeatures,
        timePattern,
        errorChain,
        recommendations: this.generateRecommendations(
          commonFeatures,
          timePattern,
          errorChain
        )
      })
    }

    return analysis
  }

  // 查找组内共同特征
  findGroupCommonFeatures(errors) {
    const features = errors.map(error => this.extractErrorFeatures(error))
    const common = {}

    // 检查所有特征
    const firstFeatures = features[0]
    for (const key in firstFeatures) {
      if (features.every(f => f[key] === firstFeatures[key])) {
        common[key] = firstFeatures[key]
      }
    }

    return common
  }

  // 分析时间模式
  analyzeTimePattern(errors) {
    const timestamps = errors.map(e => e.timestamp).sort()
    const intervals = []

    // 计算错误间隔
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }

    // 计算统计信息
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const stdDev = Math.sqrt(
      intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) /
        intervals.length
    )

    // 判断时间模式
    let pattern = 'random'
    if (stdDev < avgInterval * 0.2) {
      pattern = 'periodic'
    } else if (intervals.some(i => i < avgInterval * 0.1)) {
      pattern = 'burst'
    }

    return {
      pattern,
      averageInterval: avgInterval,
      standardDeviation: stdDev,
      firstOccurrence: timestamps[0],
      lastOccurrence: timestamps[timestamps.length - 1],
      totalDuration: timestamps[timestamps.length - 1] - timestamps[0]
    }
  }

  // 分析错误链
  analyzeErrorChain(errors) {
    const chain = []
    const sortedErrors = errors.sort((a, b) => a.timestamp - b.timestamp)

    for (let i = 0; i < sortedErrors.length; i++) {
      const current = sortedErrors[i]
      const next = sortedErrors[i + 1]

      if (next) {
        const interval = next.timestamp - current.timestamp
        const correlation = this.calculateCorrelationScore(
          this.extractErrorFeatures(current),
          this.extractErrorFeatures(next)
        )

        chain.push({
          from: current.id,
          to: next.id,
          interval,
          correlation,
          isCausal: this.checkCausality(current, next)
        })
      }
    }

    return chain
  }

  // 检查错误因果关系
  checkCausality(error1, error2) {
    // 检查时间顺序
    if (error2.timestamp - error1.timestamp > 60000) {
      return false
    }

    // 检查堆栈关联
    const stack1 = this.normalizeStack(error1.stack)
    const stack2 = this.normalizeStack(error2.stack)
    if (this.calculateTextSimilarity(stack1, stack2) > 0.7) {
      return true
    }

    // 检查上下文关联
    const context1 = error1.context || {}
    const context2 = error2.context || {}
    if (this.calculateContextSimilarity(context1, context2) > 0.7) {
      return true
    }

    return false
  }

  // 生成建议
  generateRecommendations(commonFeatures, timePattern, errorChain) {
    const recommendations = []

    // 基于共同特征的建议
    if (commonFeatures.type) {
      recommendations.push({
        type: 'error_type',
        level: 'high',
        message: `发现多个${this.getErrorTypeName(commonFeatures.type)}类型错误，建议检查相关代码逻辑`
      })
    }

    if (commonFeatures.source) {
      recommendations.push({
        type: 'error_source',
        level: 'medium',
        message: `错误主要来自${this.getSourceName(commonFeatures.source)}，建议检查该模块的稳定性`
      })
    }

    // 基于时间模式的建议
    if (timePattern.pattern === 'periodic') {
      recommendations.push({
        type: 'time_pattern',
        level: 'high',
        message: '发现周期性错误，可能存在定时任务或缓存问题'
      })
    } else if (timePattern.pattern === 'burst') {
      recommendations.push({
        type: 'time_pattern',
        level: 'high',
        message: '发现错误爆发，可能存在并发或资源竞争问题'
      })
    }

    // 基于错误链的建议
    const causalErrors = errorChain.filter(chain => chain.isCausal)
    if (causalErrors.length > 0) {
      recommendations.push({
        type: 'error_chain',
        level: 'high',
        message: `发现${causalErrors.length}个关联错误，建议检查错误传播路径`
      })
    }

    return recommendations
  }

  // 计算平均关联度
  calculateAverageCorrelation(correlations) {
    if (correlations.length === 0) return 0
    const sum = correlations.reduce((acc, c) => acc + c.correlation, 0)
    return sum / correlations.length
  }

  // 获取错误类型名称
  getErrorTypeName(type) {
    const names = {
      [ErrorType.SYSTEM]: '系统错误',
      [ErrorType.NETWORK]: '网络错误',
      [ErrorType.TIMEOUT]: '超时错误',
      [ErrorType.AUTH]: '认证错误',
      [ErrorType.VALIDATION]: '验证错误',
      [ErrorType.BUSINESS]: '业务错误',
      [ErrorType.ORDER]: '订单错误',
      [ErrorType.PAYMENT]: '支付错误',
      [ErrorType.FILE]: '文件错误',
      [ErrorType.UPLOAD]: '上传错误',
      [ErrorType.DOWNLOAD]: '下载错误',
      [ErrorType.THIRD_PARTY]: '第三方服务错误',
      [ErrorType.DATA]: '数据错误',
      [ErrorType.CACHE]: '缓存错误',
      [ErrorType.DATABASE]: '数据库错误',
      [ErrorType.PERMISSION]: '权限错误',
      [ErrorType.UNKNOWN]: '未知错误'
    }
    return names[type] || type
  }

  // 获取来源名称
  getSourceName(source) {
    const names = {
      global: '全局',
      promise: 'Promise',
      logged: '日志'
    }
    return names[source] || source
  }

  // 获取性能影响分析数据
  async getPerformanceImpact(params = {}) {
    const {
      timeRange = 'day',
      errorType = null,
      severity = null,
      minImpact = 0.1,
      maxErrors = 100
    } = params

    try {
      // 获取时间范围内的错误和性能数据
      const [errors, performanceData] = await Promise.all([
        this.getErrorList({
          timeRange,
          type: errorType,
          severity,
          limit: maxErrors
        }),
        this.getPerformanceData(timeRange)
      ])

      // 分析错误对性能的影响
      const impactAnalysis = await this.analyzePerformanceImpact(
        errors,
        performanceData,
        minImpact
      )

      // 计算性能指标变化
      const metricsChanges = this.calculateMetricsChanges(
        performanceData,
        impactAnalysis.errorPeriods
      )

      // 生成性能影响报告
      const report = this.generatePerformanceReport(
        impactAnalysis,
        metricsChanges
      )

      return {
        impactAnalysis,
        metricsChanges,
        report,
        statistics: {
          totalErrors: errors.length,
          affectedMetrics: metricsChanges.length,
          averageImpact: this.calculateAverageImpact(impactAnalysis.impacts),
          totalDowntime: this.calculateTotalDowntime(impactAnalysis.errorPeriods)
        }
      }
    } catch (error) {
      console.error('获取性能影响分析失败:', error)
      throw error
    }
  }

  // 获取性能数据
  async getPerformanceData(timeRange) {
    // 这里应该从性能监控系统获取数据
    // 示例数据结构
    return {
      metrics: {
        responseTime: [], // 响应时间数据点
        throughput: [], // 吞吐量数据点
        errorRate: [], // 错误率数据点
        cpuUsage: [], // CPU使用率数据点
        memoryUsage: [], // 内存使用率数据点
        networkLatency: [], // 网络延迟数据点
        databaseQueries: [], // 数据库查询数据点
        cacheHitRate: [] // 缓存命中率数据点
      },
      timestamps: [] // 对应的时间戳
    }
  }

  // 分析性能影响
  async analyzePerformanceImpact(errors, performanceData, minImpact) {
    const impacts = []
    const errorPeriods = []
    const baselineMetrics = this.calculateBaselineMetrics(performanceData)

    // 对每个错误分析性能影响
    for (const error of errors) {
      const impact = await this.analyzeErrorImpact(
        error,
        performanceData,
        baselineMetrics
      )

      if (impact.score >= minImpact) {
        impacts.push(impact)
        errorPeriods.push({
          start: impact.startTime,
          end: impact.endTime,
          errorId: error.id,
          affectedMetrics: impact.affectedMetrics
        })
      }
    }

    // 合并重叠的错误时间段
    const mergedPeriods = this.mergeErrorPeriods(errorPeriods)

    return {
      impacts,
      errorPeriods: mergedPeriods,
      baselineMetrics
    }
  }

  // 计算基准性能指标
  calculateBaselineMetrics(performanceData) {
    const baseline = {}
    const metrics = performanceData.metrics

    for (const [metric, values] of Object.entries(metrics)) {
      // 使用中位数作为基准值
      const sortedValues = [...values].sort((a, b) => a - b)
      const mid = Math.floor(sortedValues.length / 2)
      baseline[metric] = sortedValues.length % 2 === 0
        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
        : sortedValues[mid]

      // 计算标准差
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
      baseline[`${metric}StdDev`] = Math.sqrt(variance)
    }

    return baseline
  }

  // 分析单个错误的影响
  async analyzeErrorImpact(error, performanceData, baselineMetrics) {
    const errorTime = error.timestamp
    const impactWindow = 5 * 60 * 1000 // 5分钟的影响窗口
    const startTime = errorTime - impactWindow
    const endTime = errorTime + impactWindow

    // 获取影响窗口内的性能数据
    const windowData = this.getDataInTimeWindow(
      performanceData,
      startTime,
      endTime
    )

    // 计算各指标的变化
    const metricChanges = {}
    let totalImpact = 0
    let affectedMetricsCount = 0

    for (const [metric, values] of Object.entries(windowData.metrics)) {
      const change = this.calculateMetricChange(
        values,
        baselineMetrics[metric],
        baselineMetrics[`${metric}StdDev`]
      )

      if (Math.abs(change.impact) > 0.1) { // 忽略微小变化
        metricChanges[metric] = change
        totalImpact += Math.abs(change.impact)
        affectedMetricsCount++
      }
    }

    // 计算综合影响分数
    const impactScore = affectedMetricsCount > 0
      ? totalImpact / affectedMetricsCount
      : 0

    return {
      errorId: error.id,
      startTime,
      endTime,
      impactScore,
      affectedMetrics: metricChanges,
      severity: this.calculateImpactSeverity(impactScore, metricChanges)
    }
  }

  // 获取时间窗口内的数据
  getDataInTimeWindow(performanceData, startTime, endTime) {
    const windowData = {
      metrics: {},
      timestamps: []
    }

    const startIndex = performanceData.timestamps.findIndex(
      t => t >= startTime
    )
    const endIndex = performanceData.timestamps.findIndex(
      t => t > endTime
    )

    if (startIndex === -1 || endIndex === -1) {
      return windowData
    }

    windowData.timestamps = performanceData.timestamps.slice(
      startIndex,
      endIndex
    )

    for (const [metric, values] of Object.entries(performanceData.metrics)) {
      windowData.metrics[metric] = values.slice(startIndex, endIndex)
    }

    return windowData
  }

  // 计算指标变化
  calculateMetricChange(values, baseline, stdDev) {
    if (!values.length) {
      return { impact: 0, trend: 'stable' }
    }

    // 计算变化趋势
    const changes = []
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1])
    }

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length
    const maxDeviation = Math.max(...values.map(v => Math.abs(v - baseline)))
    const impact = maxDeviation / (stdDev || baseline)

    // 判断趋势
    let trend = 'stable'
    if (avgChange > stdDev * 0.5) {
      trend = 'increasing'
    } else if (avgChange < -stdDev * 0.5) {
      trend = 'decreasing'
    }

    return {
      impact,
      trend,
      maxDeviation,
      averageChange: avgChange,
      baseline,
      currentValue: values[values.length - 1]
    }
  }

  // 计算影响严重程度
  calculateImpactSeverity(impactScore, metricChanges) {
    // 根据影响分数和指标变化计算严重程度
    if (impactScore >= 2) return 'critical'
    if (impactScore >= 1) return 'high'
    if (impactScore >= 0.5) return 'medium'
    return 'low'
  }

  // 合并重叠的错误时间段
  mergeErrorPeriods(periods) {
    if (!periods.length) return []

    // 按开始时间排序
    const sortedPeriods = [...periods].sort((a, b) => a.start - b.start)
    const merged = [sortedPeriods[0]]

    for (let i = 1; i < sortedPeriods.length; i++) {
      const current = sortedPeriods[i]
      const last = merged[merged.length - 1]

      if (current.start <= last.end) {
        // 时间段重叠，合并
        last.end = Math.max(last.end, current.end)
        last.errorIds = [...new Set([...last.errorIds, current.errorId])]
        last.affectedMetrics = this.mergeAffectedMetrics(
          last.affectedMetrics,
          current.affectedMetrics
        )
      } else {
        // 不重叠，添加新时间段
        merged.push({
          ...current,
          errorIds: [current.errorId]
        })
      }
    }

    return merged
  }

  // 合并受影响的指标
  mergeAffectedMetrics(metrics1, metrics2) {
    const merged = { ...metrics1 }

    for (const [metric, change] of Object.entries(metrics2)) {
      if (!merged[metric] || Math.abs(change.impact) > Math.abs(merged[metric].impact)) {
        merged[metric] = change
      }
    }

    return merged
  }

  // 计算性能指标变化
  calculateMetricsChanges(performanceData, errorPeriods) {
    const changes = []

    for (const period of errorPeriods) {
      const periodData = this.getDataInTimeWindow(
        performanceData,
        period.start,
        period.end
      )

      const periodChanges = {}
      for (const [metric, values] of Object.entries(periodData.metrics)) {
        const change = this.calculateMetricChange(
          values,
          performanceData.baselineMetrics[metric],
          performanceData.baselineMetrics[`${metric}StdDev`]
        )

        if (Math.abs(change.impact) > 0.1) {
          periodChanges[metric] = change
        }
      }

      if (Object.keys(periodChanges).length > 0) {
        changes.push({
          period,
          changes: periodChanges
        })
      }
    }

    return changes
  }

  // 生成性能影响报告
  generatePerformanceReport(impactAnalysis, metricsChanges) {
    const report = {
      summary: {
        totalErrors: impactAnalysis.impacts.length,
        totalImpact: this.calculateTotalImpact(impactAnalysis.impacts),
        averageImpact: this.calculateAverageImpact(impactAnalysis.impacts),
        mostAffectedMetrics: this.findMostAffectedMetrics(metricsChanges),
        criticalPeriods: this.findCriticalPeriods(impactAnalysis.errorPeriods)
      },
      recommendations: this.generatePerformanceRecommendations(
        impactAnalysis,
        metricsChanges
      ),
      trends: this.analyzePerformanceTrends(metricsChanges)
    }

    return report
  }

  // 计算总影响
  calculateTotalImpact(impacts) {
    return impacts.reduce((sum, impact) => sum + impact.impactScore, 0)
  }

  // 计算平均影响
  calculateAverageImpact(impacts) {
    if (!impacts.length) return 0
    return this.calculateTotalImpact(impacts) / impacts.length
  }

  // 计算总停机时间
  calculateTotalDowntime(errorPeriods) {
    return errorPeriods.reduce(
      (total, period) => total + (period.end - period.start),
      0
    )
  }

  // 查找受影响最严重的指标
  findMostAffectedMetrics(metricsChanges) {
    const metricImpacts = new Map()

    metricsChanges.forEach(({ changes }) => {
      for (const [metric, change] of Object.entries(changes)) {
        const currentImpact = metricImpacts.get(metric) || 0
        metricImpacts.set(metric, currentImpact + Math.abs(change.impact))
      }
    })

    return Array.from(metricImpacts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([metric, impact]) => ({
        metric,
        impact
      }))
  }

  // 查找关键时间段
  findCriticalPeriods(errorPeriods) {
    return errorPeriods
      .filter(period => {
        const severity = this.calculateImpactSeverity(
          this.calculateAverageImpact(
            period.errorIds.map(id =>
              impactAnalysis.impacts.find(i => i.errorId === id)
            )
          ),
          period.affectedMetrics
        )
        return severity === 'critical' || severity === 'high'
      })
      .sort((a, b) => b.end - b.start - (a.end - a.start))
  }

  // 生成性能优化建议
  generatePerformanceRecommendations(impactAnalysis, metricsChanges) {
    const recommendations = []

    // 分析最受影响的指标
    const mostAffected = this.findMostAffectedMetrics(metricsChanges)
    mostAffected.forEach(({ metric, impact }) => {
      if (impact > 1) {
        recommendations.push({
          type: 'metric',
          level: 'high',
          metric,
          message: `建议优化${this.getMetricName(metric)}，当前影响程度为${(impact * 100).toFixed(1)}%`
        })
      }
    })

    // 分析关键时间段
    const criticalPeriods = this.findCriticalPeriods(impactAnalysis.errorPeriods)
    if (criticalPeriods.length > 0) {
      recommendations.push({
        type: 'period',
        level: 'high',
        message: `发现${criticalPeriods.length}个关键性能影响时段，建议进行深入分析`
      })
    }

    // 分析性能趋势
    const trends = this.analyzePerformanceTrends(metricsChanges)
    trends.forEach(trend => {
      if (trend.severity === 'high') {
        recommendations.push({
          type: 'trend',
          level: 'medium',
          metric: trend.metric,
          message: `${this.getMetricName(trend.metric)}呈现${trend.trend}趋势，建议关注`
        })
      }
    })

    return recommendations
  }

  // 分析性能趋势
  analyzePerformanceTrends(metricsChanges) {
    const trends = []
    const metricTrends = new Map()

    metricsChanges.forEach(({ changes }) => {
      for (const [metric, change] of Object.entries(changes)) {
        if (!metricTrends.has(metric)) {
          metricTrends.set(metric, {
            metric,
            trend: change.trend,
            count: 1,
            totalImpact: Math.abs(change.impact)
          })
        } else {
          const current = metricTrends.get(metric)
          current.count++
          current.totalImpact += Math.abs(change.impact)
        }
      }
    })

    for (const trend of metricTrends.values()) {
      const averageImpact = trend.totalImpact / trend.count
      trends.push({
        metric: trend.metric,
        trend: trend.trend,
        severity: this.calculateTrendSeverity(averageImpact, trend.count)
      })
    }

    return trends
  }

  // 计算趋势严重程度
  calculateTrendSeverity(impact, count) {
    if (impact > 1 && count > 3) return 'high'
    if (impact > 0.5 && count > 2) return 'medium'
    return 'low'
  }

  // 获取指标名称
  getMetricName(metric) {
    const names = {
      responseTime: '响应时间',
      throughput: '吞吐量',
      errorRate: '错误率',
      cpuUsage: 'CPU使用率',
      memoryUsage: '内存使用率',
      networkLatency: '网络延迟',
      databaseQueries: '数据库查询',
      cacheHitRate: '缓存命中率'
    }
    return names[metric] || metric
  }
}

// 导出单例
export const monitorService = new MonitorService()
export default monitorService 