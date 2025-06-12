<template>
  <div class="merchant-orders-page">
    <h1 class="page-title">订单管理</h1>

    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="所有订单" name="all"></el-tab-pane>
      <el-tab-pane label="待处理" name="pending"></el-tab-pane>
      <el-tab-pane label="处理中" name="processing"></el-tab-pane>
      <el-tab-pane label="配送中" name="shipping"></el-tab-pane>
      <el-tab-pane label="已完成" name="completed"></el-tab-pane>
      <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
    </el-tabs>

    <div class="order-list">
      <el-table
        :data="filteredOrders"
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无订单"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="order-detail-expand">
              <h4>订单详情</h4>
              <div class="detail-info">
                <p><strong>收货人:</strong> {{ props.row.deliveryInfo.name }}</p>
                <p><strong>联系电话:</strong> {{ props.row.deliveryInfo.phone }}</p>
                <p><strong>配送地址:</strong> {{ props.row.deliveryInfo.address }}</p>
                <p><strong>订单备注:</strong> {{ props.row.deliveryInfo.notes || '无' }}</p>
                <p><strong>下单时间:</strong> {{ new Date(props.row.createdAt).toLocaleString() }}</p>
              </div>
              <el-divider />
              <h4>商品列表</h4>
              <el-table :data="props.row.items" style="width: 100%" :show-header="false">
                <el-table-column label="商品名称" prop="name" />
                <el-table-column label="数量" prop="quantity" width="80" />
                <el-table-column label="单价" prop="price" width="80" />
                <el-table-column label="小计" width="100">
                  <template #default="scope">
                    ¥{{ (scope.row.quantity * scope.row.price).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="订单号" prop="_id" width="180"></el-table-column>
        <el-table-column label="用户" prop="user.username" width="120"></el-table-column>
        <el-table-column label="总金额" prop="totalAmount" width="120">
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100">
          <template #default="scope">
            <el-tag :type="getPaymentStatusTagType(scope.row.paymentStatus)">
              {{ paymentStatusMap[scope.row.paymentStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ orderStatusMap[scope.row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="180">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              size="small"
              type="primary"
              @click="handleUpdateStatus(scope.row._id, 'processing')"
            >
              标记为处理中
            </el-button>
            <el-button
              v-if="scope.row.status === 'processing'"
              size="small"
              type="success"
              @click="handleUpdateStatus(scope.row._id, 'shipping')"
            >
              标记为配送中
            </el-button>
             <el-button
              v-if="scope.row.status === 'shipping'"
              size="small"
              type="success"
              @click="handleUpdateStatus(scope.row._id, 'completed')"
            >
              标记为已完成
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending' || scope.row.status === 'processing'"
              size="small"
              type="danger"
              plain
              @click="handleUpdateStatus(scope.row._id, 'cancelled')"
            >
              取消订单
            </el-button>
            <el-button
              link
              type="primary"
              @click="viewOrderDetail(scope.row._id)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user' // Import user store to get token
import axios from 'axios' // Import axios
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const error = ref(null)
const orders = ref([]) // 存储订单数据
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const statusFilter = ref('')
const dateRange = ref([])

const orderStatusMap = {
  pending: '待处理',
  processing: '处理中',
  shipping: '配送中',
  completed: '已完成',
  cancelled: '已取消'
}

const paymentStatusMap = {
  pending: '待支付',
  paid: '已支付',
  refunded: '已退款',
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'processing':
      return 'primary'
    case 'shipping':
      return 'success'
    case 'completed':
      return 'info'
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
}

const getPaymentStatusTagType = (paymentStatus) => {
  switch (paymentStatus) {
    case 'pending':
      return 'warning'
    case 'paid':
      return 'success'
    case 'refunded':
      return 'danger'
    default:
      return 'info'
  }
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  } else {
    return orders.value.filter(order => order.status === activeTab.value)
  }
})

async function fetchOrders() {
  loading.value = true
  error.value = null
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    }
    const response = await axios.get('/api/orders', config)
    orders.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || '获取订单失败'
    console.error(err)
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      ElMessage.error('认证失败或无权限，请重新登录')
      userStore.clearUserData()
      // router.push('/login') // Consider redirecting to login
    }
  } finally {
    loading.value = false
  }
}

async function handleUpdateStatus(orderId, newStatus) {
  ElMessageBox.confirm(
    `确定要将订单状态更新为 "${orderStatusMap[newStatus]}" 吗?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userStore.token}`
          }
        }
        await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, config)
        ElMessage.success('订单状态更新成功')
        fetchOrders() // 重新获取订单列表以更新显示
      } catch (err) {
        ElMessage.error(err.response?.data?.message || '更新订单状态失败')
        console.error(err)
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// Watch for activeTab changes and re-fetch orders
watch(activeTab, () => {
  fetchOrders()
})

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push({ name: 'merchant-order-detail', params: { id: orderId } })
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.merchant-orders-page {
  flex: 1; /* Make it fill available space in column */
  display: flex;
  flex-direction: column;
  padding: 2rem; /* Re-add padding here for page content */
  box-sizing: border-box; /* Include padding in element's total width and height */
}

.page-title {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 1.5rem;
}

.order-tabs {
  margin-bottom: 1.5rem;
}

.order-list {
  flex: 1; /* Make order list fill remaining space */
  display: flex;
  flex-direction: column;
}

.el-table {
  flex: 1; /* Make table fill remaining space in order-list */
  display: flex; /* Required for table to respect flex sizing */
  flex-direction: column;
}

.el-table :deep(.el-table__inner-wrapper) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.el-table :deep(.el-table__body-wrapper) {
  flex: 1;
  overflow-y: auto; /* Enable scrolling for table body */
}

.order-detail-expand {
  padding: 1rem 2rem;
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
}

.detail-info p {
  margin-bottom: 0.5rem;
}

/* Custom styles for status tags if needed */
.el-tag {
  font-weight: bold;
}
</style> 