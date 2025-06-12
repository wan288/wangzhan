<template>
  <div class="performance-impact">
    <!-- 分析配置 -->
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>分析配置</span>
          <el-button type="primary" @click="refreshAnalysis">刷新分析</el-button>
        </div>
      </template>
      <el-form :model="config" label-width="100px">
        <el-form-item label="时间范围">
          <el-select v-model="config.timeRange">
            <el-option label="最近1小时" value="hour" />
            <el-option label="最近24小时" value="day" />
            <el-option label="最近7天" value="week" />
            <el-option label="最近30天" value="month" />
          </el-select>
        </el-form-item>
        <el-form-item label="最小影响度">
          <el-slider
            v-model="config.minImpact"
            :min="0.1"
            :max="1"
            :step="0.1"
            :format-tooltip="value => `${(value * 100).toFixed(0)}%`"
          />
        </el-form-item>
        <el-form-item label="错误类型">
          <el-select v-model="config.errorType" clearable>
            <el-option
              v-for="type in errorTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select v-model="config.severity" clearable>
            <el-option
              v-for="level in severityLevels"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 性能影响概览 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总错误数</span>
              <el-tag>{{ impactData.statistics?.totalErrors || 0 }}</el-tag>
            </div>
          </template>
          <div class="card-content">
            <el-progress
              :percentage="getErrorPercentage"
              :color="getErrorPercentageColor"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>受影响指标</span>
              <el-tag type="warning">
                {{ impactData.statistics?.affectedMetrics || 0 }}
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="metric-list">
              <el-tag
                v-for="metric in mostAffectedMetrics"
                :key="metric.metric"
                :type="getMetricTagType(metric.impact)"
                class="metric-tag"
              >
                {{ getMetricName(metric.metric) }}
                ({{ (metric.impact * 100).toFixed(1) }}%)
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>平均影响度</span>
              <el-tag :type="getImpactTagType(averageImpact)">
                {{ (averageImpact * 100).toFixed(1) }}%
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="impact-trend">
              <span class="trend-label">趋势:</span>
              <el-tag
                :type="getTrendTagType(impactTrend)"
                size="small"
              >
                {{ getTrendName(impactTrend) }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总停机时间</span>
              <el-tag type="danger">
                {{ formatDuration(totalDowntime) }}
              </el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="downtime-distribution">
              <div
                v-for="period in criticalPeriods"
                :key="period.start"
                class="downtime-bar"
                :style="getDowntimeBarStyle(period)"
                :title="getDowntimeTooltip(period)"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能指标趋势图 -->
    <el-card class="trend-card">
      <template #header>
        <div class="card-header">
          <span>性能指标趋势</span>
          <div class="header-actions">
            <el-select v-model="selectedMetrics" multiple collapse-tags>
              <el-option
                v-for="metric in availableMetrics"
                :key="metric.value"
                :label="metric.label"
                :value="metric.value"
              />
            </el-select>
            <el-button-group>
              <el-button
                :icon="ZoomIn"
                circle
                @click="zoomIn"
              />
              <el-button
                :icon="ZoomOut"
                circle
                @click="zoomOut"
              />
              <el-button
                :icon="Refresh"
                circle
                @click="resetZoom"
              />
            </el-button-group>
          </div>
        </div>
      </template>
      <div ref="trendChart" class="trend-chart"></div>
    </el-card>

    <!-- 关键时间段分析 -->
    <el-card class="periods-card">
      <template #header>
        <div class="card-header">
          <span>关键时间段分析</span>
          <el-tag type="danger">
            共 {{ criticalPeriods.length }} 个关键时段
          </el-tag>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="period in criticalPeriods"
          :key="period.start"
          :type="getPeriodType(period)"
          :timestamp="formatTime(period.start)"
          placement="top"
        >
          <el-card class="period-card">
            <template #header>
              <div class="period-header">
                <span class="period-title">
                  {{ formatTimeRange(period.start, period.end) }}
                </span>
                <el-tag
                  :type="getPeriodSeverityType(period)"
                  size="small"
                >
                  {{ getPeriodSeverityName(period) }}
                </el-tag>
              </div>
            </template>
            <div class="period-content">
              <!-- 受影响的指标 -->
              <div class="affected-metrics">
                <h4>受影响的指标</h4>
                <el-descriptions :column="2" border>
                  <el-descriptions-item
                    v-for="(change, metric) in period.affectedMetrics"
                    :key="metric"
                    :label="getMetricName(metric)"
                  >
                    <div class="metric-change">
                      <span
                        :class="{
                          'trend-up': change.trend === 'increasing',
                          'trend-down': change.trend === 'decreasing'
                        }"
                      >
                        {{ (change.impact * 100).toFixed(1) }}%
                      </span>
                      <el-tag
                        :type="getTrendTagType(change.trend)"
                        size="small"
                      >
                        {{ getTrendName(change.trend) }}
                      </el-tag>
                    </div>
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <!-- 相关错误 -->
              <div class="related-errors">
                <h4>相关错误</h4>
                <el-table
                  :data="getPeriodErrors(period)"
                  style="width: 100%"
                  size="small"
                >
                  <el-table-column prop="id" label="错误ID" width="100" />
                  <el-table-column prop="type" label="类型" width="120">
                    <template #default="{ row }">
                      {{ getErrorTypeName(row.type) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="severity" label="严重程度" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getSeverityType(row.severity)">
                        {{ getSeverityName(row.severity) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="message" label="错误信息" />
                  <el-table-column prop="impact" label="影响度" width="100">
                    <template #default="{ row }">
                      {{ (row.impact * 100).toFixed(1) }}%
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 优化建议 -->
    <el-card class="recommendations-card">
      <template #header>
        <div class="card-header">
          <span>优化建议</span>
          <el-tag type="success">
            共 {{ recommendations.length }} 条建议
          </el-tag>
        </div>
      </template>
      <el-collapse v-model="activeRecommendations">
        <el-collapse-item
          v-for="(rec, index) in recommendations"
          :key="index"
          :name="index"
        >
          <template #title>
            <div class="recommendation-header">
              <el-tag
                :type="getRecommendationType(rec.level)"
                size="small"
              >
                {{ getRecommendationLevelName(rec.level) }}
              </el-tag>
              <span class="recommendation-title">{{ rec.message }}</span>
            </div>
          </template>
          <div class="recommendation-content">
            <template v-if="rec.type === 'metric'">
              <h4>指标详情</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="指标名称">
                  {{ getMetricName(rec.metric) }}
                </el-descriptions-item>
                <el-descriptions-item label="当前值">
                  {{ getMetricCurrentValue(rec.metric) }}
                </el-descriptions-item>
                <el-descriptions-item label="基准值">
                  {{ getMetricBaseline(rec.metric) }}
                </el-descriptions-item>
                <el-descriptions-item label="变化趋势">
                  <el-tag
                    :type="getTrendTagType(getMetricTrend(rec.metric))"
                    size="small"
                  >
                    {{ getTrendName(getMetricTrend(rec.metric)) }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </template>
            <template v-else-if="rec.type === 'period'">
              <h4>时间段详情</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="开始时间">
                  {{ formatTime(getPeriodStart(rec)) }}
                </el-descriptions-item>
                <el-descriptions-item label="结束时间">
                  {{ formatTime(getPeriodEnd(rec)) }}
                </el-descriptions-item>
                <el-descriptions-item label="持续时间">
                  {{ formatDuration(getPeriodDuration(rec)) }}
                </el-descriptions-item>
                <el-descriptions-item label="影响程度">
                  {{ getPeriodImpactLevel(rec) }}
                </el-descriptions-item>
              </el-descriptions>
            </template>
            <template v-else-if="rec.type === 'trend'">
              <h4>趋势详情</h4>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="指标名称">
                  {{ getMetricName(rec.metric) }}
                </el-descriptions-item>
                <el-descriptions-item label="趋势类型">
                  <el-tag
                    :type="getTrendTagType(rec.trend)"
                    size="small"
                  >
                    {{ getTrendName(rec.trend) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="持续时间">
                  {{ formatDuration(getTrendDuration(rec)) }}
                </el-descriptions-item>
                <el-descriptions-item label="影响范围">
                  {{ getTrendScope(rec) }}
                </el-descriptions-item>
              </el-descriptions>
            </template>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { monitorService } from '@/services/monitor'
import { ErrorType, ErrorSeverity } from '@/utils/error'

// 配置选项
const config = ref({
  timeRange: 'day',
  minImpact: 0.1,
  errorType: null,
  severity: null
})

// 错误类型选项
const errorTypes = Object.entries(ErrorType).map(([key, value]) => ({
  label: getErrorTypeName(value),
  value
}))

// 严重程度选项
const severityLevels = Object.entries(ErrorSeverity).map(([key, value]) => ({
  label: getSeverityName(value),
  value
}))

// 性能指标选项
const availableMetrics = [
  { label: '响应时间', value: 'responseTime' },
  { label: '吞吐量', value: 'throughput' },
  { label: '错误率', value: 'errorRate' },
  { label: 'CPU使用率', value: 'cpuUsage' },
  { label: '内存使用率', value: 'memoryUsage' },
  { label: '网络延迟', value: 'networkLatency' },
  { label: '数据库查询', value: 'databaseQueries' },
  { label: '缓存命中率', value: 'cacheHitRate' }
]

// 选中的指标
const selectedMetrics = ref(['responseTime', 'errorRate', 'cpuUsage'])

// 性能影响数据
const impactData = ref({
  impactAnalysis: {
    impacts: [],
    errorPeriods: [],
    baselineMetrics: {}
  },
  metricsChanges: [],
  report: {
    summary: {},
    recommendations: [],
    trends: []
  },
  statistics: {}
})

// 分析时间
const analysisTime = ref(Date.now())

// 图表相关
const trendChart = ref(null)
let chart = null
let zoomLevel = 1

// 展开的建议
const activeRecommendations = ref([])

// 计算属性
const getErrorPercentage = computed(() => {
  const total = impactData.value.statistics?.totalErrors || 0
  return Math.min((total / 100) * 100, 100)
})

const getErrorPercentageColor = computed(() => {
  const percentage = getErrorPercentage.value
  if (percentage >= 80) return '#F56C6C'
  if (percentage >= 50) return '#E6A23C'
  return '#67C23A'
})

const mostAffectedMetrics = computed(() => {
  return impactData.value.report?.summary?.mostAffectedMetrics || []
})

const averageImpact = computed(() => {
  return impactData.value.statistics?.averageImpact || 0
})

const impactTrend = computed(() => {
  const trends = impactData.value.report?.trends || []
  const overallTrend = trends.reduce((acc, trend) => {
    if (trend.trend === 'increasing') acc.up++
    if (trend.trend === 'decreasing') acc.down++
    return acc
  }, { up: 0, down: 0 })

  if (overallTrend.up > overallTrend.down) return 'increasing'
  if (overallTrend.down > overallTrend.up) return 'decreasing'
  return 'stable'
})

const totalDowntime = computed(() => {
  return impactData.value.statistics?.totalDowntime || 0
})

const criticalPeriods = computed(() => {
  return impactData.value.report?.summary?.criticalPeriods || []
})

const recommendations = computed(() => {
  return impactData.value.report?.recommendations || []
})

// 初始化图表
const initChart = () => {
  if (!trendChart.value) return

  chart = echarts.init(trendChart.value)
  updateChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 更新图表
const updateChart = () => {
  if (!chart) return

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: selectedMetrics.value.map(metric => getMetricName(metric))
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false
    },
    yAxis: selectedMetrics.value.map(metric => ({
      type: 'value',
      name: getMetricName(metric),
      position: 'left',
      alignTicks: true,
      axisLine: {
        show: true,
        lineStyle: {
          color: getMetricColor(metric)
        }
      }
    })),
    series: selectedMetrics.value.map(metric => ({
      name: getMetricName(metric),
      type: 'line',
      smooth: true,
      data: getMetricData(metric),
      yAxisIndex: selectedMetrics.value.indexOf(metric),
      markPoint: {
        data: getMetricMarkPoints(metric)
      },
      markLine: {
        data: [
          {
            name: '基准值',
            yAxis: getMetricBaseline(metric),
            lineStyle: {
              color: getMetricColor(metric),
              type: 'dashed'
            }
          }
        ]
      }
    }))
  }

  chart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  chart?.resize()
}

// 缩放控制
const zoomIn = () => {
  zoomLevel = Math.min(zoomLevel * 1.2, 3)
  chart?.setOption({ series: [{ zoom: zoomLevel }] })
}

const zoomOut = () => {
  zoomLevel = Math.max(zoomLevel / 1.2, 0.5)
  chart?.setOption({ series: [{ zoom: zoomLevel }] })
}

const resetZoom = () => {
  zoomLevel = 1
  chart?.setOption({ series: [{ zoom: zoomLevel }] })
}

// 刷新分析
const refreshAnalysis = async () => {
  try {
    const data = await monitorService.getPerformanceImpact(config.value)
    impactData.value = data
    analysisTime.value = Date.now()
    updateChart()
  } catch (error) {
    console.error('获取性能影响分析失败:', error)
    ElMessage.error('获取性能影响分析失败')
  }
}

// 监听配置变化
watch(
  [
    () => ({ ...config.value }),
    () => [...selectedMetrics.value]
  ],
  () => {
    refreshAnalysis()
  },
  { deep: true }
)

// 格式化函数
const formatTime = timestamp => {
  return new Date(timestamp).toLocaleString()
}

const formatTimeRange = (start, end) => {
  return `${formatTime(start)} - ${formatTime(end)}`
}

const formatDuration = ms => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

// 获取显示名称
const getErrorTypeName = type => {
  return monitorService.getErrorTypeName(type)
}

const getSeverityName = severity => {
  const names = {
    [ErrorSeverity.LOW]: '低',
    [ErrorSeverity.MEDIUM]: '中',
    [ErrorSeverity.HIGH]: '高',
    [ErrorSeverity.CRITICAL]: '严重'
  }
  return names[severity] || severity
}

const getMetricName = metric => {
  return monitorService.getMetricName(metric)
}

const getTrendName = trend => {
  const names = {
    increasing: '上升',
    decreasing: '下降',
    stable: '稳定'
  }
  return names[trend] || trend
}

const getRecommendationLevelName = level => {
  const names = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return names[level] || level
}

// 获取样式类型
const getSeverityType = severity => {
  const types = {
    [ErrorSeverity.LOW]: 'info',
    [ErrorSeverity.MEDIUM]: 'warning',
    [ErrorSeverity.HIGH]: 'danger',
    [ErrorSeverity.CRITICAL]: 'error'
  }
  return types[severity] || 'info'
}

const getMetricTagType = impact => {
  if (impact >= 2) return 'danger'
  if (impact >= 1) return 'warning'
  return 'info'
}

const getImpactTagType = impact => {
  if (impact >= 2) return 'danger'
  if (impact >= 1) return 'warning'
  if (impact >= 0.5) return 'info'
  return 'success'
}

const getTrendTagType = trend => {
  const types = {
    increasing: 'danger',
    decreasing: 'success',
    stable: 'info'
  }
  return types[trend] || 'info'
}

const getRecommendationType = level => {
  const types = {
    low: 'info',
    medium: 'warning',
    high: 'danger'
  }
  return types[level] || 'info'
}

const getPeriodType = period => {
  const severity = getPeriodSeverity(period)
  const types = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return types[severity] || 'info'
}

const getPeriodSeverityType = period => {
  const severity = getPeriodSeverity(period)
  const types = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return types[severity] || 'info'
}

const getPeriodSeverityName = period => {
  const severity = getPeriodSeverity(period)
  const names = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低'
  }
  return names[severity] || severity
}

// 获取指标数据
const getMetricData = metric => {
  // 这里应该从性能数据中获取指标数据
  return []
}

const getMetricMarkPoints = metric => {
  // 这里应该从性能数据中获取标记点
  return []
}

const getMetricBaseline = metric => {
  return impactData.value.impactAnalysis?.baselineMetrics?.[metric] || 0
}

const getMetricCurrentValue = metric => {
  const changes = impactData.value.metricsChanges
  const latestChange = changes[changes.length - 1]?.changes[metric]
  return latestChange?.currentValue || 0
}

const getMetricTrend = metric => {
  const changes = impactData.value.metricsChanges
  const latestChange = changes[changes.length - 1]?.changes[metric]
  return latestChange?.trend || 'stable'
}

// 获取时间段相关数据
const getPeriodSeverity = period => {
  const impacts = period.errorIds.map(id =>
    impactData.value.impactAnalysis.impacts.find(i => i.errorId === id)
  )
  const avgImpact = impacts.reduce((sum, i) => sum + i.impactScore, 0) / impacts.length
  if (avgImpact >= 2) return 'critical'
  if (avgImpact >= 1) return 'high'
  if (avgImpact >= 0.5) return 'medium'
  return 'low'
}

const getPeriodErrors = period => {
  return period.errorIds.map(id => {
    const impact = impactData.value.impactAnalysis.impacts.find(i => i.errorId === id)
    return {
      id,
      type: impact.type,
      severity: impact.severity,
      message: impact.message,
      impact: impact.impactScore
    }
  })
}

// 获取建议相关数据
const getPeriodStart = rec => {
  const period = criticalPeriods.value.find(p => p.errorIds.includes(rec.errorId))
  return period?.start || 0
}

const getPeriodEnd = rec => {
  const period = criticalPeriods.value.find(p => p.errorIds.includes(rec.errorId))
  return period?.end || 0
}

const getPeriodDuration = rec => {
  return getPeriodEnd(rec) - getPeriodStart(rec)
}

const getPeriodImpactLevel = rec => {
  const period = criticalPeriods.value.find(p => p.errorIds.includes(rec.errorId))
  return getPeriodSeverityName(period)
}

const getTrendDuration = rec => {
  // 这里应该计算趋势持续时间
  return 0
}

const getTrendScope = rec => {
  // 这里应该计算趋势影响范围
  return '局部'
}

// 获取图表样式
const getMetricColor = metric => {
  const colors = {
    responseTime: '#F56C6C',
    throughput: '#67C23A',
    errorRate: '#E6A23C',
    cpuUsage: '#409EFF',
    memoryUsage: '#909399',
    networkLatency: '#9B59B6',
    databaseQueries: '#34495E',
    cacheHitRate: '#16A085'
  }
  return colors[metric] || '#909399'
}

const getDowntimeBarStyle = period => {
  const total = totalDowntime.value
  const duration = period.end - period.start
  const percentage = (duration / total) * 100
  return {
    width: `${percentage}%`,
    backgroundColor: getPeriodSeverityType(period)
  }
}

const getDowntimeTooltip = period => {
  return `${formatTimeRange(period.start, period.end)}\n持续时间: ${formatDuration(
    period.end - period.start
  )}`
}

// 生命周期钩子
onMounted(() => {
  initChart()
  refreshAnalysis()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<style lang="scss" scoped>
.performance-impact {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .config-card {
    .el-form {
      max-width: 600px;
    }
  }

  .overview-cards {
    .el-card {
      .card-content {
        padding: 10px 0;

        .metric-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .metric-tag {
            margin-bottom: 4px;
          }
        }

        .impact-trend {
          display: flex;
          align-items: center;
          gap: 8px;

          .trend-label {
            color: #909399;
          }
        }

        .downtime-distribution {
          display: flex;
          height: 20px;
          background-color: #f5f7fa;
          border-radius: 4px;
          overflow: hidden;

          .downtime-bar {
            height: 100%;
            transition: width 0.3s ease;
          }
        }
      }
    }
  }

  .trend-card {
    .trend-chart {
      height: 400px;
      width: 100%;
    }
  }

  .periods-card {
    .period-card {
      .period-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .period-title {
          font-weight: bold;
        }
      }

      .period-content {
        .affected-metrics {
          margin-bottom: 20px;

          h4 {
            margin: 0 0 10px;
            color: #606266;
          }

          .metric-change {
            display: flex;
            align-items: center;
            gap: 8px;

            .trend-up {
              color: #F56C6C;
            }

            .trend-down {
              color: #67C23A;
            }
          }
        }

        .related-errors {
          h4 {
            margin: 0 0 10px;
            color: #606266;
          }
        }
      }
    }
  }

  .recommendations-card {
    .recommendation-header {
      display: flex;
      align-items: center;
      gap: 12px;

      .recommendation-title {
        flex: 1;
      }
    }

    .recommendation-content {
      h4 {
        margin: 0 0 10px;
        color: #606266;
      }
    }
  }
}
</style> 