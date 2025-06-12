import request from '@/utils/request'

// 上报错误日志
export function reportError(errorLog) {
  return request({
    url: '/log/error',
    method: 'post',
    data: errorLog
  })
}

// 上报操作日志
export const reportOperationLog = (log) => {
  return request({
    url: '/api/logs/operation',
    method: 'post',
    data: log
  })
}

// 上报性能日志
export const reportPerformanceLog = (log) => {
  return request({
    url: '/api/logs/performance',
    method: 'post',
    data: log
  })
}

// 批量上报日志
export const batchReportLogs = (logs) => {
  return request({
    url: '/api/logs/batch',
    method: 'post',
    data: logs
  })
}

// 获取日志上报状态
export const getLogReportStatus = () => {
  return request({
    url: '/api/logs/status',
    method: 'get'
  })
}

// 清理已上报的日志
export const clearReportedLogs = () => {
  return request({
    url: '/api/logs/clear',
    method: 'post'
  })
} 