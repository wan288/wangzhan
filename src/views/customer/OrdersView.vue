<template>
  <div class="orders-page">
    <div class="container">
      <h1 class="page-title">我的订单</h1>

      <template v-if="loading">
        <div class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>
      </template>

      <template v-else-if="error">
        <el-empty description="加载订单失败,请稍后重试">
          <el-button type="primary" @click="fetchOrders">重试</el-button>
        </el-empty>
      </template>

      <template v-else-if="orders.length > 0">
        <el-tabs v-model="activeTab" class="order-tabs">
          <el-tab-pane label="所有订单" name="all"></el-tab-pane>
          <el-tab-pane label="待处理" name="pending"></el-tab-pane>
          <el-tab-pane label="处理中" name="processing"></el-tab-pane>
          <el-tab-pane label="配送中" name="shipping"></el-tab-pane>
          <el-tab-pane label="已完成" name="completed"></el-tab-pane>
          <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
        </el-tabs>

        <div class="order-list">
          <el-card v-for="order in filteredOrders" :key="order._id" class="order-card" shadow="hover">
            <template #header>
              <div class="order-header">
                <span class="order-id">订单号: {{ order._id }}</span>
                <el-tag :type="orderStatusTagType(order.status)" size="large" class="order-status-tag">
                  {{ orderStatusMap[order.status] }}
                </el-tag>
              </div>
            </template>

            <div class="order-items">
              <div v-for="item in order.items" :key="item._id" class="order-item">
                <el-image :src="item.image" fit="cover" class="item-image">
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="item-details">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                  <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            <el-divider class="order-divider"/>
            <div class="order-footer">
              <div class="order-total">
                <span class="label">订单总额:</span>
                <span class="price">¥{{ order.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="order-actions">
                <el-button
                  v-if="order.status === 'pending'"
                  type="primary"
                  size="default"
                  @click="payOrder(order._id)"
                >
                  立即支付
                </el-button>
                <el-button
                  v-if="order.status === 'completed'"
                  size="default"
                  @click="reviewOrder(order._id)"
                >
                  评价
                </el-button>
                <el-button
                  v-if="['pending', 'processing'].includes(order.status)"
                  type="danger"
                  size="default"
                  plain
                  @click="cancelOrder(order._id)"
                >
                  取消订单
                </el-button>
                <el-button
                  size="default"
                  @click="viewOrderDetails(order._id)"
                  :type="order.status === 'completed' ? 'primary' : 'default'"
                  plain
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </template>

      <template v-else>
        <el-empty description="您还没有任何订单，快去点餐吧！">
          <el-button type="primary" @click="$router.push('/menu')">去点餐</el-button>
        </el-empty>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const error = ref(null)
const orders = ref([])
const activeTab = ref('all')

const orderStatusMap = {
  pending: '待支付',
  processing: '备餐中',
  shipping: '配送中',
  completed: '已完成',
  cancelled: '已取消'
}

// Computed property to determine ElTag type based on order status
const orderStatusTagType = computed(() => (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'primary'
    case 'shipping': return 'success'
    case 'completed': return 'info'
    case 'cancelled': return 'danger'
    default: return 'info'
  }
})

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  } else {
    return orders.value.filter(order => order.status === activeTab.value)
  }
})

async function fetchOrders() {
  if (!userStore.token) {
    orders.value = []
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    }
    const response = await axios.get('/api/orders/myorders', config)
    orders.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || '获取订单失败'
    console.error(err)
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      ElMessage.error('认证失败或无权限，请重新登录')
      userStore.clearUserData()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

async function payOrder(orderId) {
  ElMessage.info(`支付订单 ${orderId}... (此功能待实现)`)
  // Implement actual payment logic here
}

async function reviewOrder(orderId) {
  ElMessage.info(`评价订单 ${orderId}... (此功能待实现)`)
  // Implement actual review logic here
}

async function cancelOrder(orderId) {
  ElMessageBox.confirm(
    '确定要取消此订单吗?'
    ,'提示',
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
        // Assuming an API endpoint for cancelling orders
        await axios.put(`/api/orders/${orderId}/cancel`, {}, config)
        ElMessage.success('订单已取消')
        fetchOrders() // Refresh orders after cancellation
      } catch (err) {
        ElMessage.error(err.response?.data?.message || '取消订单失败')
        console.error(err)
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

function viewOrderDetails(orderId) {
  router.push(`/orders/${orderId}`)
}

watch(activeTab, () => {
  fetchOrders()
})

onMounted(() => {
  if (userStore.isAuthenticated) {
    fetchOrders()
  } else {
    ElMessage.warning('请先登录查看订单')
    router.push('/login')
  }
})
</script>

<style scoped>
.orders-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  color: var(--el-text-color-primary);
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background-color: var(--kfc-red);
  border-radius: 2px;
}

.loading-state,
.el-empty {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.order-tabs {
  margin-bottom: 2rem;
  --el-tabs-header-height: 55px; /* Slightly taller tabs */
}

.order-tabs .el-tabs__item {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--el-text-color-regular);
  padding: 0 20px;
}

.order-tabs .el-tabs__item.is-active {
  color: var(--kfc-red); /* Active tab color */
}

.order-tabs .el-tabs__active-bar {
  background-color: var(--kfc-red);
}

.order-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); /* Responsive grid for orders */
  gap: 2rem;
}

.order-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: var(--el-text-color-secondary);
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.order-id {
  font-weight: bold;
  color: var(--el-text-color-primary);
  font-size: 1.1rem;
}

.order-status-tag {
  font-size: 0.9rem;
  font-weight: bold;
}

.order-items {
  padding: 1rem 0;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.order-item:last-child {
  margin-bottom: 0;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image .el-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 1.5rem;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 1rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-quantity {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
  margin-top: 0.2rem;
}

.item-price {
  font-size: 1rem;
  font-weight: bold;
  color: var(--kfc-red);
  margin-top: 0.2rem;
}

.order-divider {
  margin: 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
}

.order-total {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-size: 1.1rem;
  color: var(--el-text-color-regular);
}

.order-total .label {
  font-weight: normal;
}

.order-total .price {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--kfc-red);
}

.order-actions .el-button {
  margin-left: 10px;
}

.order-actions .el-button--primary {
  background-color: var(--kfc-red);
  border-color: var(--kfc-red);
}

.order-actions .el-button--primary:hover {
  background-color: #e03f2a;
  border-color: #e03f2a;
}

.order-actions .el-button--danger.is-plain {
  color: var(--el-color-danger);
  background: #fef0f0;
  border-color: #fde2e2;
}

.order-actions .el-button--danger.is-plain:hover {
  background-color: var(--el-color-danger);
  color: white;
  border-color: var(--el-color-danger);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .orders-page {
    padding: 1rem;
  }
  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  .order-tabs .el-tabs__item {
    padding: 0 10px;
    font-size: 1rem;
  }
  .order-list {
    grid-template-columns: 1fr; /* Single column on small screens */
    gap: 1.5rem;
  }
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .order-id {
    font-size: 1rem;
  }
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .order-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .order-actions .el-button {
    flex: 1;
    margin-left: 0;
  }
}
</style> 