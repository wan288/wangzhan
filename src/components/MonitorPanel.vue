<template>
  <div class="monitor-panel">
    <!-- 监控状态 -->
    <div class="monitor-status">
      <el-card class="status-card">
        <template #header>
          <div class="card-header">
            <span>监控状态</span>
            <el-switch
              v-model="isMonitoring"
              active-text="监控中"
              inactive-text="已停止"
              @change="handleMonitoringChange"
            />
          </div>
        </template>
        <div class="status-content">
          <div class="status-item">
            <span class="label">总错误数：</span>
            <span class="value">{{ stats.total }}</span>
          </div>
          <div class="status-item">
            <span class="label">最后告警：</span>
            <span class="value">{{ formatTime(status.lastAlertTime) }}</span>
          </div>
          <div class="status-item">
            <span class="label">活跃告警：</span>
            <span class="value">{{ status.activeAlerts.length }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 错误统计 -->
    <div class="error-stats">
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>错误统计</span>
            <el-button-group>
              <el-button size="small" @click="refreshStats">刷新</el-button>
              <el-button size="small" @click="showConfigDialog">配置</el-button>
            </el-button-group>
          </div>
        </template>
        <div class="stats-content">
          <!-- 错误类型分布 -->
          <div class="stats-section">
            <h3>错误类型分布</h3>
            <div class="chart-container">
              <div
                v-for="(count, type) in stats.byType"
                :key="type"
                class="chart-item"
              >
                <div class="chart-bar">
                  <div
                    class="bar-fill"
                    :style="{ width: getPercentage(count, stats.total) + '%' }"
                    :class="getSeverityClass(type)"
                  ></div>
                </div>
                <div class="chart-label">
                  <span class="type">{{ getErrorTypeName(type) }}</span>
                  <span class="count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 错误严重程度分布 -->
          <div class="stats-section">
            <h3>错误严重程度分布</h3>
            <div class="severity-stats">
              <div
                v-for="(count, severity) in stats.bySeverity"
                :key="severity"
                class="severity-item"
                :class="getSeverityClass(severity)"
              >
                <span class="severity-name">{{ getSeverityName(severity) }}</span>
                <span class="severity-count">{{ count }}</span>
                <span class="severity-threshold">
                  阈值: {{ status.config.thresholds[severity] }}
                </span>
              </div>
            </div>
          </div>

          <!-- 最近错误列表 -->
          <div class="stats-section">
            <h3>最近错误</h3>
            <el-table
              :data="stats.recent"
              style="width: 100%"
              height="300"
              :default-sort="{ prop: 'timestamp', order: 'descending' }"
            >
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getErrorTypeTag(row.type)" size="small">
                    {{ getErrorTypeName(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="severity" label="严重程度" width="100">
                <template #default="{ row }">
                  <el-tag
                    :type="getSeverityTag(row.severity)"
                    :effect="getSeverityEffect(row.severity)"
                    size="small"
                  >
                    {{ getSeverityName(row.severity) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="错误信息" />
              <el-table-column prop="source" label="来源" width="100">
                <template #default="{ row }">
                  <el-tag size="small" type="info">
                    {{ getSourceName(row.source) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 告警历史 -->
    <div class="alert-history">
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <span>告警历史</span>
            <el-button size="small" @click="refreshAlerts">刷新</el-button>
          </div>
        </template>
        <div class="history-content">
          <el-timeline>
            <el-timeline-item
              v-for="alert in alerts"
              :key="alert.id"
              :type="getAlertType(alert.severity)"
              :timestamp="formatTime(alert.timestamp)"
              :hollow="!isAlertActive(alert)"
            >
              <div class="alert-item">
                <div class="alert-header">
                  <span class="alert-title">
                    {{ alert.severity }}级别告警
                  </span>
                  <span class="alert-count">
                    错误数: {{ alert.count }}/{{ alert.threshold }}
                  </span>
                </div>
                <div class="alert-content">
                  <div class="alert-message">
                    {{ formatAlertMessage(alert) }}
                  </div>
                  <div class="alert-actions">
                    <el-button
                      size="small"
                      type="primary"
                      link
                      @click="showAlertDetails(alert)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>

    <!-- 配置对话框 -->
    <el-dialog
      v-model="configDialogVisible"
      title="监控配置"
      width="500px"
    >
      <el-form
        ref="configForm"
        :model="configForm"
        label-width="120px"
      >
        <el-form-item label="时间窗口">
          <el-input-number
            v-model="configForm.timeWindow"
            :min="60000"
            :max="3600000"
            :step="60000"
            @change="value => configForm.timeWindow = value * 60000"
          />
          <span class="unit">分钟</span>
        </el-form-item>

        <el-form-item label="告警冷却时间">
          <el-input-number
            v-model="configForm.alertCooldown"
            :min="60000"
            :max="3600000"
            :step="60000"
            @change="value => configForm.alertCooldown = value * 60000"
          />
          <span class="unit">分钟</span>
        </el-form-item>

        <el-form-item label="告警方式">
          <el-checkbox-group v-model="configForm.alertMethods">
            <el-checkbox label="notification">通知</el-checkbox>
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="错误阈值">
          <div class="thresholds">
            <div
              v-for="severity in severities"
              :key="severity"
              class="threshold-item"
            >
              <span class="label">{{ getSeverityName(severity) }}：</span>
              <el-input-number
                v-model="configForm.thresholds[severity]"
                :min="1"
                :max="1000"
                size="small"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveConfig">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 告警详情对话框 -->
    <el-dialog
      v-model="alertDetailsVisible"
      title="告警详情"
      width="800px"
    >
      <div v-if="selectedAlert" class="alert-details">
        <div class="details-header">
          <div class="details-title">
            <el-tag
              :type="getAlertType(selectedAlert.severity)"
              :effect="getSeverityEffect(selectedAlert.severity)"
            >
              {{ selectedAlert.severity }}级别告警
            </el-tag>
            <span class="time">
              {{ formatTime(selectedAlert.timestamp) }}
            </span>
          </div>
          <div class="details-stats">
            <div class="stat-item">
              <span class="label">错误数：</span>
              <span class="value">{{ selectedAlert.count }}</span>
            </div>
            <div class="stat-item">
              <span class="label">阈值：</span>
              <span class="value">{{ selectedAlert.threshold }}</span>
            </div>
          </div>
        </div>

        <div class="details-content">
          <h4>错误列表</h4>
          <el-table
            :data="selectedAlert.errors"
            style="width: 100%"
            height="400"
          >
            <el-table-column prop="timestamp" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getErrorTypeTag(row.type)" size="small">
                  {{ getErrorTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="错误信息" />
            <el-table-column prop="source" label="来源" width="100">
              <template #default="{ row }">
                <el-tag size="small" type="info">
                  {{ getSourceName(row.source) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ErrorType, ErrorSeverity } from '@/utils/error'
import { monitorService } from '@/services/monitor'

// 状态
const isMonitoring = ref(false)
const stats = ref({
  total: 0,
  byType: {},
  bySeverity: {},
  recent: []
})
const status = ref({
  isMonitoring: false,
  lastAlertTime: null,
  activeAlerts: [],
  config: {}
})
const alerts = ref([])

// 对话框状态
const configDialogVisible = ref(false)
const alertDetailsVisible = ref(false)
const selectedAlert = ref(null)

// 配置表单
const configForm = ref({
  timeWindow: 5,
  alertCooldown: 5,
  alertMethods: ['notification'],
  thresholds: {
    [ErrorSeverity.LOW]: 100,
    [ErrorSeverity.MEDIUM]: 50,
    [ErrorSeverity.HIGH]: 20,
    [ErrorSeverity.CRITICAL]: 5
  }
})

// 严重程度列表
const severities = [
  ErrorSeverity.LOW,
  ErrorSeverity.MEDIUM,
  ErrorSeverity.HIGH,
  ErrorSeverity.CRITICAL
]

// 初始化
onMounted(() => {
  refreshData()
  // 定时刷新数据
  const timer = setInterval(refreshData, 30000)
  onUnmounted(() => clearInterval(timer))
})

// 刷新数据
const refreshData = () => {
  stats.value = monitorService.getErrorStats()
  status.value = monitorService.getMonitorStatus()
  alerts.value = monitorService.getAlertHistory()
  isMonitoring.value = status.value.isMonitoring
}

// 刷新统计
const refreshStats = () => {
  stats.value = monitorService.getErrorStats()
}

// 刷新告警
const refreshAlerts = () => {
  alerts.value = monitorService.getAlertHistory()
}

// 处理监控状态变化
const handleMonitoringChange = (value) => {
  if (value) {
    monitorService.startMonitoring()
  } else {
    monitorService.stopMonitoring()
  }
  refreshData()
}

// 显示配置对话框
const showConfigDialog = () => {
  const currentConfig = status.value.config
  configForm.value = {
    timeWindow: currentConfig.timeWindow / 60000,
    alertCooldown: currentConfig.alertCooldown / 60000,
    alertMethods: [...currentConfig.alertMethods],
    thresholds: { ...currentConfig.thresholds }
  }
  configDialogVisible.value = true
}

// 保存配置
const saveConfig = () => {
  const config = {
    timeWindow: configForm.value.timeWindow * 60000,
    alertCooldown: configForm.value.alertCooldown * 60000,
    alertMethods: configForm.value.alertMethods,
    thresholds: configForm.value.thresholds
  }
  monitorService.updateConfig(config)
  configDialogVisible.value = false
  refreshData()
  ElMessage.success('配置已更新')
}

// 显示告警详情
const showAlertDetails = (alert) => {
  selectedAlert.value = alert
  alertDetailsVisible.value = true
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '无'
  return new Date(timestamp).toLocaleString()
}

// 获取百分比
const getPercentage = (value, total) => {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

// 获取错误类型名称
const getErrorTypeName = (type) => {
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

// 获取严重程度名称
const getSeverityName = (severity) => {
  const names = {
    [ErrorSeverity.LOW]: '低',
    [ErrorSeverity.MEDIUM]: '中',
    [ErrorSeverity.HIGH]: '高',
    [ErrorSeverity.CRITICAL]: '严重'
  }
  return names[severity] || severity
}

// 获取来源名称
const getSourceName = (source) => {
  const names = {
    global: '全局',
    promise: 'Promise',
    logged: '日志'
  }
  return names[source] || source
}

// 获取错误类型标签类型
const getErrorTypeTag = (type) => {
  const tags = {
    [ErrorType.SYSTEM]: 'danger',
    [ErrorType.NETWORK]: 'warning',
    [ErrorType.TIMEOUT]: 'warning',
    [ErrorType.AUTH]: 'danger',
    [ErrorType.VALIDATION]: 'info',
    [ErrorType.BUSINESS]: 'warning',
    [ErrorType.ORDER]: 'warning',
    [ErrorType.PAYMENT]: 'danger',
    [ErrorType.FILE]: 'warning',
    [ErrorType.UPLOAD]: 'warning',
    [ErrorType.DOWNLOAD]: 'warning',
    [ErrorType.THIRD_PARTY]: 'warning',
    [ErrorType.DATA]: 'info',
    [ErrorType.CACHE]: 'info',
    [ErrorType.DATABASE]: 'danger',
    [ErrorType.PERMISSION]: 'danger',
    [ErrorType.UNKNOWN]: 'info'
  }
  return tags[type] || 'info'
}

// 获取严重程度标签类型
const getSeverityTag = (severity) => {
  const tags = {
    [ErrorSeverity.LOW]: 'info',
    [ErrorSeverity.MEDIUM]: 'warning',
    [ErrorSeverity.HIGH]: 'danger',
    [ErrorSeverity.CRITICAL]: 'danger'
  }
  return tags[severity] || 'info'
}

// 获取严重程度标签效果
const getSeverityEffect = (severity) => {
  return severity === ErrorSeverity.CRITICAL ? 'dark' : 'light'
}

// 获取严重程度样式类
const getSeverityClass = (severity) => {
  return `severity-${severity.toLowerCase()}`
}

// 获取告警类型
const getAlertType = (severity) => {
  const types = {
    [ErrorSeverity.LOW]: 'info',
    [ErrorSeverity.MEDIUM]: 'warning',
    [ErrorSeverity.HIGH]: 'danger',
    [ErrorSeverity.CRITICAL]: 'danger'
  }
  return types[severity] || 'info'
}

// 检查告警是否活跃
const isAlertActive = (alert) => {
  const alertKey = `${alert.severity}_${Math.floor(alert.timestamp / status.value.config.alertCooldown)}`
  return status.value.activeAlerts.includes(alertKey)
}

// 格式化告警消息
const formatAlertMessage = (alert) => {
  const errorTypes = [...new Set(alert.errors.map(e => getErrorTypeName(e.type)))]
  return `检测到${alert.count}个${getSeverityName(alert.severity)}级别错误，超过阈值${alert.threshold}。错误类型：${errorTypes.join('、')}`
}
</script>

<style lang="scss" scoped>
.monitor-panel {
  padding: 20px;
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: auto 1fr;
  gap: 20px;
  height: 100%;

  .monitor-status {
    grid-column: 1;
    grid-row: 1;
  }

  .error-stats {
    grid-column: 2;
    grid-row: 1 / span 2;
  }

  .alert-history {
    grid-column: 1;
    grid-row: 2;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-card,
  .stats-card,
  .history-card {
    height: 100%;

    .status-content {
      .status-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .label {
          color: var(--el-text-color-secondary);
        }

        .value {
          font-weight: 500;
        }
      }
    }
  }

  .stats-content {
    .stats-section {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 16px;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }

      .chart-container {
        .chart-item {
          margin-bottom: 12px;

          .chart-bar {
            height: 20px;
            background-color: var(--el-fill-color-light);
            border-radius: 4px;
            overflow: hidden;

            .bar-fill {
              height: 100%;
              transition: width 0.3s ease;

              &.severity-low {
                background-color: var(--el-color-info);
              }

              &.severity-medium {
                background-color: var(--el-color-warning);
              }

              &.severity-high {
                background-color: var(--el-color-danger);
              }

              &.severity-critical {
                background-color: var(--el-color-danger-dark-2);
              }
            }
          }

          .chart-label {
            display: flex;
            justify-content: space-between;
            margin-top: 4px;
            font-size: 12px;

            .type {
              color: var(--el-text-color-regular);
            }

            .count {
              color: var(--el-text-color-secondary);
            }
          }
        }
      }

      .severity-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;

        .severity-item {
          padding: 12px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 4px;

          &.severity-low {
            background-color: var(--el-color-info-light-9);
            border: 1px solid var(--el-color-info-light-5);
          }

          &.severity-medium {
            background-color: var(--el-color-warning-light-9);
            border: 1px solid var(--el-color-warning-light-5);
          }

          &.severity-high {
            background-color: var(--el-color-danger-light-9);
            border: 1px solid var(--el-color-danger-light-5);
          }

          &.severity-critical {
            background-color: var(--el-color-danger-light-8);
            border: 1px solid var(--el-color-danger-light-4);
          }

          .severity-name {
            font-weight: 500;
          }

          .severity-count {
            font-size: 20px;
            font-weight: 600;
          }

          .severity-threshold {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  .history-content {
    .alert-item {
      .alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .alert-title {
          font-weight: 500;
        }

        .alert-count {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }

      .alert-content {
        .alert-message {
          color: var(--el-text-color-regular);
          margin-bottom: 8px;
        }
      }
    }
  }

  .alert-details {
    .details-header {
      margin-bottom: 20px;

      .details-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .time {
          color: var(--el-text-color-secondary);
          font-size: 14px;
        }
      }

      .details-stats {
        display: flex;
        gap: 24px;

        .stat-item {
          .label {
            color: var(--el-text-color-secondary);
            margin-right: 8px;
          }

          .value {
            font-weight: 500;
          }
        }
      }
    }

    .details-content {
      h4 {
        margin: 0 0 16px;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
    }
  }
}

.unit {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

.thresholds {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  .threshold-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      min-width: 60px;
      color: var(--el-text-color-regular);
    }
  }
}
</style> 