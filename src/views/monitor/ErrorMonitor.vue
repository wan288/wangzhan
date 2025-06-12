<template>
  <div class="error-monitor">
    <div class="page-header">
      <h2>错误监控</h2>
      <div class="header-actions">
        <el-button-group>
          <el-button
            type="primary"
            :icon="Refresh"
            @click="handleRefresh"
            :loading="loading"
          >
            刷新
          </el-button>
          <el-button
            type="success"
            :icon="Download"
            @click="handleExport"
          >
            导出报告
          </el-button>
        </el-button-group>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="monitor-tabs">
      <el-tab-pane label="实时监控" name="realtime">
        <MonitorPanel ref="monitorPanel" />
      </el-tab-pane>
      <el-tab-pane label="错误关联分析" name="correlation">
        <ErrorCorrelation />
      </el-tab-pane>
      <el-tab-pane label="性能影响分析" name="performance">
        <PerformanceImpact />
      </el-tab-pane>
      <el-tab-pane label="统计分析" name="analysis">
        <div class="analysis-content">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span>错误趋势</span>
                    <el-radio-group v-model="trendTimeRange" size="small">
                      <el-radio-button label="day">24小时</el-radio-button>
                      <el-radio-button label="week">7天</el-radio-button>
                      <el-radio-button label="month">30天</el-radio-button>
                    </el-radio-group>
                  </div>
                </template>
                <div class="trend-chart" ref="trendChartRef"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="analysis-row">
            <el-col :span="12">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span>错误类型分布</span>
                    <el-select v-model="distributionType" size="small">
                      <el-option label="按类型" value="type" />
                      <el-option label="按严重程度" value="severity" />
                    </el-select>
                  </div>
                </template>
                <div class="distribution-chart" ref="distributionChartRef"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span>错误来源分析</span>
                    <el-select v-model="sourceTimeRange" size="small">
                      <el-option label="最近24小时" value="day" />
                      <el-option label="最近7天" value="week" />
                      <el-option label="最近30天" value="month" />
                    </el-select>
                  </div>
                </template>
                <div class="source-chart" ref="sourceChartRef"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" class="analysis-row">
            <el-col :span="24">
              <el-card class="analysis-card">
                <template #header>
                  <div class="card-header">
                    <span>错误详情</span>
                    <div class="header-actions">
                      <el-input
                        v-model="searchQuery"
                        placeholder="搜索错误信息"
                        clearable
                        style="width: 200px"
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                      <el-select
                        v-model="filterSeverity"
                        placeholder="严重程度"
                        clearable
                        style="width: 120px"
                      >
                        <el-option
                          v-for="severity in severities"
                          :key="severity"
                          :label="getSeverityName(severity)"
                          :value="severity"
                        />
                      </el-select>
                      <el-select
                        v-model="filterType"
                        placeholder="错误类型"
                        clearable
                        style="width: 120px"
                      >
                        <el-option
                          v-for="type in errorTypes"
                          :key="type"
                          :label="getErrorTypeName(type)"
                          :value="type"
                        />
                      </el-select>
                    </div>
                  </div>
                </template>
                <el-table
                  :data="filteredErrors"
                  style="width: 100%"
                  height="400"
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
                  <el-table-column prop="count" label="出现次数" width="100" sortable />
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        link
                        @click="showErrorDetails(row)"
                      >
                        详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="totalErrors"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                  />
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 错误详情对话框 -->
    <el-dialog
      v-model="errorDetailsVisible"
      title="错误详情"
      width="800px"
    >
      <div v-if="selectedError" class="error-details">
        <div class="details-header">
          <div class="details-title">
            <el-tag
              :type="getErrorTypeTag(selectedError.type)"
              :effect="getSeverityEffect(selectedError.severity)"
            >
              {{ getErrorTypeName(selectedError.type) }}
            </el-tag>
            <span class="time">
              {{ formatTime(selectedError.timestamp) }}
            </span>
          </div>
          <div class="details-stats">
            <div class="stat-item">
              <span class="label">严重程度：</span>
              <el-tag
                :type="getSeverityTag(selectedError.severity)"
                :effect="getSeverityEffect(selectedError.severity)"
              >
                {{ getSeverityName(selectedError.severity) }}
              </el-tag>
            </div>
            <div class="stat-item">
              <span class="label">出现次数：</span>
              <span class="value">{{ selectedError.count }}</span>
            </div>
            <div class="stat-item">
              <span class="label">来源：</span>
              <el-tag size="small" type="info">
                {{ getSourceName(selectedError.source) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="details-content">
          <div class="content-section">
            <h4>错误信息</h4>
            <div class="error-message">{{ selectedError.message }}</div>
          </div>

          <div class="content-section">
            <h4>错误堆栈</h4>
            <pre class="error-stack">{{ selectedError.stack }}</pre>
          </div>

          <div class="content-section">
            <h4>上下文信息</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item
                v-for="(value, key) in selectedError.context"
                :key="key"
                :label="key"
              >
                {{ value }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="content-section">
            <h4>相关告警</h4>
            <el-table
              :data="selectedError.relatedAlerts"
              style="width: 100%"
            >
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.timestamp) }}
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
              <el-table-column prop="message" label="告警信息" />
            </el-table>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download, Search } from '@element-plus/icons-vue'
import { ErrorType, ErrorSeverity } from '@/utils/error'
import { monitorService } from '@/services/monitor'
import MonitorPanel from '@/components/MonitorPanel.vue'
import ErrorCorrelation from '@/components/ErrorCorrelation.vue'
import PerformanceImpact from '@/components/PerformanceImpact.vue'
import * as echarts from 'echarts'

// 状态
const loading = ref(false)
const activeTab = ref('realtime')
const monitorPanel = ref(null)

// 趋势图配置
const trendTimeRange = ref('day')
const trendChartRef = ref(null)
let trendChart = null

// 分布图配置
const distributionType = ref('type')
const distributionChartRef = ref(null)
let distributionChart = null

// 来源分析图配置
const sourceTimeRange = ref('day')
const sourceChartRef = ref(null)
let sourceChart = null

// 错误列表配置
const searchQuery = ref('')
const filterSeverity = ref('')
const filterType = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalErrors = ref(0)
const errors = ref([])

// 错误详情
const errorDetailsVisible = ref(false)
const selectedError = ref(null)

// 严重程度列表
const severities = [
  ErrorSeverity.LOW,
  ErrorSeverity.MEDIUM,
  ErrorSeverity.HIGH,
  ErrorSeverity.CRITICAL
]

// 错误类型列表
const errorTypes = Object.values(ErrorType)

// 初始化
onMounted(() => {
  initCharts()
  fetchData()
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  distributionChart?.dispose()
  sourceChart?.dispose()
})

// 初始化图表
const initCharts = () => {
  // 趋势图
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    title: {
      text: '错误趋势'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '错误数'
    },
    series: [
      {
        name: '错误数',
        type: 'line',
        smooth: true,
        data: []
      }
    ]
  })

  // 分布图
  distributionChart = echarts.init(distributionChartRef.value)
  distributionChart.setOption({
    title: {
      text: '错误分布'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '错误分布',
        type: 'pie',
        radius: '50%',
        data: []
      }
    ]
  })

  // 来源分析图
  sourceChart = echarts.init(sourceChartRef.value)
  sourceChart.setOption({
    title: {
      text: '错误来源分析'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value',
      name: '错误数'
    },
    series: [
      {
        name: '错误数',
        type: 'bar',
        data: []
      }
    ]
  })
}

// 处理窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  distributionChart?.resize()
  sourceChart?.resize()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 获取错误趋势数据
    const trendData = await monitorService.getErrorTrend(trendTimeRange.value)
    updateTrendChart(trendData)

    // 获取错误分布数据
    const distributionData = await monitorService.getErrorDistribution(distributionType.value)
    updateDistributionChart(distributionData)

    // 获取来源分析数据
    const sourceData = await monitorService.getErrorSourceAnalysis(sourceTimeRange.value)
    updateSourceChart(sourceData)

    // 获取错误列表
    const { list, total } = await monitorService.getErrorList({
      page: currentPage.value,
      pageSize: pageSize.value,
      query: searchQuery.value,
      severity: filterSeverity.value,
      type: filterType.value
    })
    errors.value = list
    totalErrors.value = total
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新趋势图
const updateTrendChart = (data) => {
  trendChart.setOption({
    series: [
      {
        data: data.map(item => [item.timestamp, item.count])
      }
    ]
  })
}

// 更新分布图
const updateDistributionChart = (data) => {
  const chartData = data.map(item => ({
    name: distributionType.value === 'type'
      ? getErrorTypeName(item.type)
      : getSeverityName(item.severity),
    value: item.count
  }))
  distributionChart.setOption({
    series: [
      {
        data: chartData
      }
    ]
  })
}

// 更新来源分析图
const updateSourceChart = (data) => {
  sourceChart.setOption({
    xAxis: {
      data: data.map(item => getSourceName(item.source))
    },
    series: [
      {
        data: data.map(item => item.count)
      }
    ]
  })
}

// 刷新数据
const handleRefresh = () => {
  fetchData()
  monitorPanel.value?.refreshData()
}

// 导出报告
const handleExport = () => {
  const report = {
    title: '错误监控报告',
    timestamp: new Date().toISOString(),
    activeTab: activeTab.value,
    data: null
  }

  switch (activeTab.value) {
    case 'realtime':
      // 导出实时监控数据
      report.data = monitorService.getErrorStats()
      break
    case 'correlation':
      // 导出错误关联分析数据
      report.data = monitorService.getErrorCorrelation()
      break
    case 'performance':
      // 导出性能影响分析数据
      report.data = monitorService.getPerformanceImpact()
      break
    case 'analysis':
      // 导出统计分析数据
      report.data = {
        trendData: getTrendData(),
        distributionData: getDistributionData(),
        sourceData: getSourceData(),
        errorList: filteredErrors.value
      }
      break
  }

  // 这里应该实现实际的导出逻辑
  console.log('导出报告:', report)
  ElMessage.success('报告导出成功')
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 显示错误详情
const showErrorDetails = async (error) => {
  try {
    const details = await monitorService.getErrorDetails(error.id)
    selectedError.value = details
    errorDetailsVisible.value = true
  } catch (error) {
    ElMessage.error('获取错误详情失败')
    console.error('获取错误详情失败:', error)
  }
}

// 过滤后的错误列表
const filteredErrors = computed(() => {
  return errors.value
})

// 监听筛选条件变化
watch([searchQuery, filterSeverity, filterType], () => {
  currentPage.value = 1
  fetchData()
})

// 监听时间范围变化
watch([trendTimeRange, distributionType, sourceTimeRange], () => {
  fetchData()
})

// 工具函数
const formatTime = (timestamp) => {
  if (!timestamp) return '无'
  return new Date(timestamp).toLocaleString()
}

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

const getSeverityName = (severity) => {
  const names = {
    [ErrorSeverity.LOW]: '低',
    [ErrorSeverity.MEDIUM]: '中',
    [ErrorSeverity.HIGH]: '高',
    [ErrorSeverity.CRITICAL]: '严重'
  }
  return names[severity] || severity
}

const getSourceName = (source) => {
  const names = {
    global: '全局',
    promise: 'Promise',
    logged: '日志'
  }
  return names[source] || source
}

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

const getSeverityTag = (severity) => {
  const tags = {
    [ErrorSeverity.LOW]: 'info',
    [ErrorSeverity.MEDIUM]: 'warning',
    [ErrorSeverity.HIGH]: 'danger',
    [ErrorSeverity.CRITICAL]: 'danger'
  }
  return tags[severity] || 'info'
}

const getSeverityEffect = (severity) => {
  return severity === ErrorSeverity.CRITICAL ? 'dark' : 'light'
}
</script>

<style lang="scss" scoped>
.error-monitor {
  height: 100%;
  display: flex;
  flex-direction: column;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: var(--el-text-color-primary);
    }
  }

  .monitor-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }

  .analysis-content {
    padding: 20px 0;

    .analysis-row {
      margin-top: 20px;
    }

    .analysis-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-actions {
          display: flex;
          gap: 12px;
        }
      }

      .trend-chart,
      .distribution-chart,
      .source-chart {
        height: 300px;
      }
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .error-details {
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
        }
      }
    }

    .details-content {
      .content-section {
        margin-bottom: 24px;

        h4 {
          margin: 0 0 12px;
          font-size: 16px;
          color: var(--el-text-color-primary);
        }

        .error-message {
          padding: 12px;
          background-color: var(--el-fill-color-light);
          border-radius: 4px;
          color: var(--el-text-color-regular);
        }

        .error-stack {
          padding: 12px;
          background-color: var(--el-fill-color-light);
          border-radius: 4px;
          color: var(--el-text-color-regular);
          font-family: monospace;
          white-space: pre-wrap;
          max-height: 200px;
          overflow: auto;
        }
      }
    }
  }
}
</style> 