<template>
  <div class="order-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h2>订单详情</h2>
          <el-button @click="$router.back()" type="primary" plain>返回</el-button>
        </div>
      </template>

      <div v-if="order" class="order-info">
        <!-- 订单基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDate(order.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总金额">¥{{ order.totalAmount.toFixed(2) }}</el-descriptions-item>
        </el-descriptions>

        <!-- 订单状态更新 -->
        <div class="status-update" v-if="canUpdateStatus">
          <h3>更新订单状态</h3>
          <el-steps :active="getStatusStep(order.status)" finish-status="success" simple>
            <el-step title="待接单" />
            <el-step title="制作中" />
            <el-step title="待取餐" />
            <el-step title="已完成" />
          </el-steps>
          <div class="status-actions">
            <el-button 
              v-if="order.status === 'pending'" 
              type="primary" 
              @click="updateOrderStatus('preparing')"
              :loading="updating"
            >
              接单
            </el-button>
            <el-button 
              v-if="order.status === 'preparing'" 
              type="success" 
              @click="updateOrderStatus('ready')"
              :loading="updating"
            >
              完成制作
            </el-button>
            <el-button 
              v-if="order.status === 'ready'" 
              type="warning" 
              @click="updateOrderStatus('completed')"
              :loading="updating"
            >
              确认完成
            </el-button>
          </div>
        </div>

        <!-- 订单菜品列表 -->
        <div class="order-items">
          <h3>订单菜品</h3>
          <el-table :data="order.items" border style="width: 100%">
            <el-table-column prop="dishName" label="菜品名称" />
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="price" label="单价" width="120">
              <template #default="scope">
                ¥{{ scope.row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="120">
              <template #default="scope">
                ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 备注信息 -->
        <div class="order-notes" v-if="order.notes">
          <h3>备注信息</h3>
          <el-alert
            :title="order.notes"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
      </div>

      <el-empty v-else description="未找到订单信息" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail, updateOrder } from '@/api/order'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(false)
const updating = ref(false)

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const { data } = await getOrderDetail(route.params.id)
    order.value = data
  } catch (error) {
    ElMessage.error('获取订单详情失败')
    console.error('获取订单详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新订单状态
const updateOrderStatus = async (newStatus) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单状态更新为"${getStatusText(newStatus)}"吗？`,
      '确认更新',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    updating.value = true
    await updateOrder(order.value._id, { status: newStatus })
    ElMessage.success('订单状态更新成功')
    await fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('更新订单状态失败')
      console.error('更新订单状态失败:', error)
    }
  } finally {
    updating.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'info',
    preparing: 'warning',
    ready: 'success',
    completed: 'success',
    cancelled: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待接单',
    preparing: '制作中',
    ready: '待取餐',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取状态步骤
const getStatusStep = (status) => {
  const stepMap = {
    pending: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
    cancelled: 0
  }
  return stepMap[status] || 0
}

// 判断是否可以更新状态
const canUpdateStatus = computed(() => {
  if (!order.value) return false
  return ['pending', 'preparing', 'ready'].includes(order.value.status)
})

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-update {
  margin: 20px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.status-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.order-items {
  margin-top: 20px;
}

.order-notes {
  margin-top: 20px;
}

h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #606266;
}
</style> 