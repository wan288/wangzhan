<template>
  <div class="error-message" :class="messageClass">
    <!-- 错误图标 -->
    <el-icon class="error-icon" :class="iconClass">
      <component :is="errorIcon" />
    </el-icon>

    <!-- 错误内容 -->
    <div class="error-content">
      <!-- 错误标题 -->
      <div class="error-title" v-if="title">{{ title }}</div>
      
      <!-- 错误消息 -->
      <div class="error-text">{{ message }}</div>
      
      <!-- 错误详情 -->
      <div class="error-details" v-if="showDetails && details">
        <el-collapse>
          <el-collapse-item>
            <template #title>
              <span class="details-title">错误详情</span>
            </template>
            <pre class="details-content">{{ formatDetails }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 错误操作按钮 -->
      <div class="error-actions" v-if="actions && actions.length">
        <el-button
          v-for="action in actions"
          :key="action.key"
          :type="action.type || 'primary'"
          :size="action.size || 'small'"
          @click="handleAction(action)"
        >
          {{ action.text }}
        </el-button>
      </div>
    </div>

    <!-- 关闭按钮 -->
    <el-icon 
      v-if="closable" 
      class="error-close" 
      @click="handleClose"
    >
      <Close />
    </el-icon>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { 
  Warning, 
  CircleClose, 
  Close,
  Connection,
  Timer,
  Lock,
  Document,
  Money,
  Upload,
  Download,
  Service,
  DataLine,
  Key
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ErrorType, ErrorSeverity } from '@/utils/error'

const props = defineProps({
  // 错误类型
  type: {
    type: String,
    // default: ErrorType.UNKNOWN // 移除默认值
  },
  // 错误严重程度
  severity: {
    type: String,
    // default: ErrorSeverity.MEDIUM // 移除默认值
  },
  // 错误标题
  title: {
    type: String,
    default: ''
  },
  // 错误消息
  message: {
    type: String,
    required: true
  },
  // 错误详情
  details: {
    type: [Object, String],
    default: null
  },
  // 是否显示详情
  showDetails: {
    type: Boolean,
    default: false
  },
  // 是否可关闭
  closable: {
    type: Boolean,
    default: true
  },
  // 操作按钮
  actions: {
    type: Array,
    default: () => []
  },
  // 持续时间（毫秒）
  duration: {
    type: Number,
    default: 5000
  },
  // 是否显示为通知
  isNotification: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'action'])

// 错误图标映射
const getErrorIcons = () => ({
  [ErrorType.SYSTEM]: CircleClose,
  [ErrorType.NETWORK]: Connection,
  [ErrorType.TIMEOUT]: Timer,
  [ErrorType.AUTH]: Lock,
  [ErrorType.VALIDATION]: Document,
  [ErrorType.BUSINESS]: CircleClose,
  [ErrorType.ORDER]: Document,
  [ErrorType.PAYMENT]: Money,
  [ErrorType.FILE]: Document,
  [ErrorType.UPLOAD]: Upload,
  [ErrorType.DOWNLOAD]: Download,
  [ErrorType.THIRD_PARTY]: Service,
  [ErrorType.DATA]: DataLine,
  [ErrorType.PERMISSION]: Key,
  [ErrorType.UNKNOWN]: Warning
})

// 计算错误图标
const errorIcon = computed(() => getErrorIcons()[props.type] || Warning)

// 计算消息样式类
const messageClass = computed(() => ({
  'error-message': true,
  'is-notification': props.isNotification,
  [`severity-${props.severity?.toLowerCase() || ''}`]: true,
  [`type-${props.type?.toLowerCase() || ''}`]: true
}))

// 计算图标样式类
const iconClass = computed(() => ({
  'error-icon': true,
  [`severity-${props.severity?.toLowerCase() || ''}`]: true
}))

// 格式化错误详情
const formatDetails = computed(() => {
  if (!props.details) return ''
  if (typeof props.details === 'string') return props.details
  return JSON.stringify(props.details, null, 2)
})

// 处理关闭
const handleClose = () => {
  emit('close')
}

// 处理操作按钮点击
const handleAction = (action) => {
  emit('action', action)
  if (action.callback) {
    action.callback()
  }
}
</script>

<style lang="scss" scoped>
.error-message {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-radius: 4px;
  background-color: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  margin-bottom: 16px;
  position: relative;
  border: 1px solid transparent;

  &.is-notification {
    margin-bottom: 0;
    box-shadow: none;
  }

  &.severity-low {
    border-color: var(--el-color-info-light-3);
    .error-icon {
      color: var(--el-color-info);
    }
  }

  &.severity-medium {
    border-color: var(--el-color-warning-light-3);
    .error-icon {
      color: var(--el-color-warning);
    }
  }

  &.severity-high {
    border-color: var(--el-color-danger-light-3);
    .error-icon {
      color: var(--el-color-danger);
    }
  }

  &.severity-critical {
    border-color: var(--el-color-error-light-3);
    .error-icon {
      color: var(--el-color-error);
    }
  }

  .error-icon {
    font-size: 24px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .error-content {
    flex-grow: 1;
  }

  .error-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 4px;
    color: var(--el-text-color-primary);
  }

  .error-text {
    font-size: 14px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
  }

  .error-details {
    margin-top: 8px;
    .details-title {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
    .details-content {
      background-color: var(--el-fill-color-light);
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
      color: var(--el-text-color-regular);
    }
    :deep(.el-collapse-item__header) {
      height: 36px;
      line-height: 36px;
    }
    :deep(.el-collapse-item__content) {
      padding-bottom: 0;
    }
  }

  .error-actions {
    margin-top: 12px;
    .el-button {
      margin-right: 8px;
    }
  }

  .error-close {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 16px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    &:hover {
      color: var(--el-text-color-primary);
    }
  }
}
</style> 