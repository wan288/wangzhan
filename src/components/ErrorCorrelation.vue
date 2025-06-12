<template>
  <div class="error-correlation">
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
        <el-form-item label="最小关联度">
          <el-slider
            v-model="config.minCorrelation"
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

    <!-- 关联图 -->
    <el-card class="graph-card">
      <template #header>
        <div class="card-header">
          <span>错误关联图</span>
          <div class="header-actions">
            <el-tooltip content="放大" placement="top">
              <el-button :icon="ZoomIn" circle @click="zoomIn" />
            </el-tooltip>
            <el-tooltip content="缩小" placement="top">
              <el-button :icon="ZoomOut" circle @click="zoomOut" />
            </el-tooltip>
            <el-tooltip content="重置" placement="top">
              <el-button :icon="Refresh" circle @click="resetZoom" />
            </el-tooltip>
          </div>
        </div>
      </template>
      <div ref="graphContainer" class="graph-container"></div>
    </el-card>

    <!-- 分析结果 -->
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>分析结果</span>
          <el-tag type="info">
            共发现 {{ correlationData.statistics?.correlationGroups || 0 }} 个关联组
          </el-tag>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="statistics">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic
              title="总错误数"
              :value="correlationData.statistics?.totalErrors || 0"
            />
          </el-col>
          <el-col :span="6">
            <el-statistic
              title="关联错误数"
              :value="correlationData.statistics?.correlatedErrors || 0"
            />
          </el-col>
          <el-col :span="6">
            <el-statistic
              title="平均关联度"
              :value="(correlationData.statistics?.averageCorrelation || 0) * 100"
              :precision="1"
              suffix="%"
            />
          </el-col>
          <el-col :span="6">
            <el-statistic
              title="分析时间"
              :value="analysisTime"
              :formatter="formatTime"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 关联组列表 -->
      <el-collapse v-model="activeGroups" class="group-list">
        <el-collapse-item
          v-for="group in correlationData.analysis"
          :key="group.groupId"
          :name="group.groupId"
        >
          <template #title>
            <div class="group-header">
              <span class="group-title">
                关联组 {{ group.groupId }} ({{ group.errorCount }} 个错误)
              </span>
              <el-tag
                :type="getTimePatternType(group.timePattern.pattern)"
                size="small"
              >
                {{ getTimePatternName(group.timePattern.pattern) }}
              </el-tag>
            </div>
          </template>

          <!-- 共同特征 -->
          <div class="group-section">
            <h4>共同特征</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item
                v-if="group.commonFeatures.type"
                label="错误类型"
              >
                {{ getErrorTypeName(group.commonFeatures.type) }}
              </el-descriptions-item>
              <el-descriptions-item
                v-if="group.commonFeatures.severity"
                label="严重程度"
              >
                <el-tag :type="getSeverityType(group.commonFeatures.severity)">
                  {{ getSeverityName(group.commonFeatures.severity) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item
                v-if="group.commonFeatures.source"
                label="错误来源"
              >
                {{ getSourceName(group.commonFeatures.source) }}
              </el-descriptions-item>
              <el-descriptions-item
                v-if="group.commonFeatures.context"
                label="共同上下文"
              >
                <el-tag
                  v-for="(value, key) in group.commonFeatures.context"
                  :key="key"
                  class="context-tag"
                >
                  {{ key }}: {{ value }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 时间模式 -->
          <div class="group-section">
            <h4>时间模式</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="模式类型">
                {{ getTimePatternName(group.timePattern.pattern) }}
              </el-descriptions-item>
              <el-descriptions-item label="平均间隔">
                {{ formatDuration(group.timePattern.averageInterval) }}
              </el-descriptions-item>
              <el-descriptions-item label="首次发生">
                {{ formatTime(group.timePattern.firstOccurrence) }}
              </el-descriptions-item>
              <el-descriptions-item label="最后发生">
                {{ formatTime(group.timePattern.lastOccurrence) }}
              </el-descriptions-item>
              <el-descriptions-item label="持续时间">
                {{ formatDuration(group.timePattern.totalDuration) }}
              </el-descriptions-item>
              <el-descriptions-item label="标准差">
                {{ formatDuration(group.timePattern.standardDeviation) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 错误链 -->
          <div class="group-section">
            <h4>错误链</h4>
            <el-timeline>
              <el-timeline-item
                v-for="chain in group.errorChain"
                :key="chain.from"
                :type="chain.isCausal ? 'warning' : 'info'"
                :timestamp="formatTime(chain.timestamp)"
              >
                <div class="chain-item">
                  <div class="chain-header">
                    <span>错误 {{ chain.from }} → {{ chain.to }}</span>
                    <el-tag
                      :type="chain.isCausal ? 'warning' : 'info'"
                      size="small"
                    >
                      {{ chain.isCausal ? '可能因果' : '时间相关' }}
                    </el-tag>
                  </div>
                  <div class="chain-details">
                    <span>间隔: {{ formatDuration(chain.interval) }}</span>
                    <span>关联度: {{ (chain.correlation * 100).toFixed(1) }}%</span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>

          <!-- 建议 -->
          <div class="group-section">
            <h4>建议</h4>
            <el-alert
              v-for="(rec, index) in group.recommendations"
              :key="index"
              :title="rec.message"
              :type="getRecommendationType(rec.level)"
              :closable="false"
              show-icon
              class="recommendation-alert"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { monitorService } from '@/services/monitor'
import { ErrorType, ErrorSeverity } from '@/utils/error'

// 配置选项
const config = ref({
  timeRange: 'day',
  minCorrelation: 0.5,
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

// 关联数据
const correlationData = ref({
  graph: { nodes: [], edges: [] },
  groups: [],
  analysis: [],
  statistics: {}
})

// 分析时间
const analysisTime = ref(Date.now())

// 图表相关
const graphContainer = ref(null)
let chart = null
let zoomLevel = 1

// 展开的关联组
const activeGroups = ref([])

// 初始化图表
const initChart = () => {
  if (!graphContainer.value) return

  chart = echarts.init(graphContainer.value)
  updateChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 更新图表
const updateChart = () => {
  if (!chart) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: params => {
        if (params.dataType === 'edge') {
          return `关联度: ${(params.data.value * 100).toFixed(1)}%<br/>
                  共同特征: ${formatCommonFeatures(params.data.commonFeatures)}`
        }
        return `错误ID: ${params.data.id}<br/>
                关联数: ${params.data.symbolSize / 2 - 10}`
      }
    },
    legend: {
      data: ['高关联', '中关联', '低关联'],
      orient: 'vertical',
      right: 10,
      top: 20
    },
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'force',
        force: {
          repulsion: 100,
          edgeLength: 100
        },
        roam: true,
        label: {
          show: true,
          position: 'right',
          formatter: '{b}'
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 8],
        edgeLabel: {
          show: true,
          formatter: params => `${(params.data.value * 100).toFixed(0)}%`,
          fontSize: 12
        },
        data: correlationData.value.graph.nodes.map(node => ({
          ...node,
          itemStyle: {
            color: getNodeColor(node.category)
          }
        })),
        edges: correlationData.value.graph.edges.map(edge => ({
          ...edge,
          lineStyle: {
            width: edge.value * 5,
            color: getEdgeColor(edge.value)
          }
        })),
        categories: [
          { name: '高关联' },
          { name: '中关联' },
          { name: '低关联' }
        ]
      }
    ]
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
    const data = await monitorService.getErrorCorrelation(config.value)
    correlationData.value = data
    analysisTime.value = Date.now()
    updateChart()
  } catch (error) {
    console.error('获取错误关联分析失败:', error)
    ElMessage.error('获取错误关联分析失败')
  }
}

// 监听配置变化
watch(
  () => ({ ...config.value }),
  () => {
    refreshAnalysis()
  },
  { deep: true }
)

// 格式化函数
const formatTime = timestamp => {
  return new Date(timestamp).toLocaleString()
}

const formatDuration = ms => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`
  return `${(ms / 3600000).toFixed(1)}h`
}

const formatCommonFeatures = features => {
  const items = []
  if (features.type) {
    items.push(`类型: ${getErrorTypeName(features.type)}`)
  }
  if (features.severity) {
    items.push(`严重程度: ${getSeverityName(features.severity)}`)
  }
  if (features.source) {
    items.push(`来源: ${getSourceName(features.source)}`)
  }
  return items.join('<br/>')
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

const getSourceName = source => {
  return monitorService.getSourceName(source)
}

const getTimePatternName = pattern => {
  const names = {
    random: '随机',
    periodic: '周期性',
    burst: '爆发性'
  }
  return names[pattern] || pattern
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

const getTimePatternType = pattern => {
  const types = {
    random: 'info',
    periodic: 'warning',
    burst: 'danger'
  }
  return types[pattern] || 'info'
}

const getRecommendationType = level => {
  const types = {
    low: 'info',
    medium: 'warning',
    high: 'error'
  }
  return types[level] || 'info'
}

const getNodeColor = category => {
  const colors = {
    high: '#F56C6C',
    medium: '#E6A23C',
    low: '#909399'
  }
  return colors[category] || '#909399'
}

const getEdgeColor = value => {
  if (value >= 0.8) return '#F56C6C'
  if (value >= 0.6) return '#E6A23C'
  return '#909399'
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
.error-correlation {
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
      gap: 8px;
    }
  }

  .config-card {
    .el-form {
      max-width: 600px;
    }
  }

  .graph-card {
    .graph-container {
      height: 600px;
      width: 100%;
    }
  }

  .analysis-card {
    .statistics {
      margin-bottom: 20px;
    }

    .group-list {
      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .group-title {
          font-weight: bold;
        }
      }

      .group-section {
        margin-bottom: 20px;

        h4 {
          margin: 0 0 10px;
          color: #606266;
        }

        .context-tag {
          margin-right: 8px;
          margin-bottom: 4px;
        }

        .chain-item {
          .chain-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
          }

          .chain-details {
            display: flex;
            gap: 16px;
            color: #909399;
            font-size: 12px;
          }
        }

        .recommendation-alert {
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
</style> 