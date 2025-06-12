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
          <el-card v-for="order in filteredOrders" :key="order._id" class="order-card">
            <template #header>
              <div class="order-header">
                <span class="order-id">订单号: {{ order._id }}</span>
                <span :class="['order-status', order.status]">{{ orderStatusMap[order.status] }}</span>
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
                  <span class="item-price">¥{{ item.price }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-total">
                总计: <span class="price">¥{{ order.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="order-actions">
                <el-button v-if="order.status === 'pending'" type="primary" size="small">立即支付</el-button>
                <el-button v-if="order.status === 'completed'" size="small">评价</el-button>
                <el-button v-if="order.status === 'pending'" type="danger" size="small" plain @click="cancelOrder(order._id)">取消订单</el-button>
                <el-button size="small" @click="viewOrderDetails(order._id)">查看详情</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </template>

      <template v-else>
        <el-empty description="您还没有任何订单">
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
  pending: '待处理',
  processing: '处理中',
  shipping: '配送中',
  completed: '已完成',
  cancelled: '已取消'
}

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
        await axios.put(`/api/orders/${orderId}/status`, { status: 'cancelled' }, config)
        ElMessage.success('订单已取消')
        fetchOrders()
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
  }
})
</script>

<style scoped>
.orders-page {
  padding: 2rem 0;
}

.page-title {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.order-tabs {
  margin-bottom: 2rem;
  --el-tabs-header-height: 50px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--el-box-shadow-hover);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #666;
}

.order-id {
  font-weight: bold;
}

.order-status {
  padding: 0.2em 0.6em;
  border-radius: 4px;
  font-weight: bold;
  color: white;
}

.order-status.pending {
  background-color: var(--el-color-warning);
}

.order-status.processing {
  background-color: var(--el-color-primary);
}

.order-status.shipping {
  background-color: var(--el-color-success);
}

.order-status.completed {
  background-color: var(--el-color-info);
}

.order-status.cancelled {
  background-color: var(--el-color-danger);
}

.order-items {
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #ccc;
  font-size: 1.5rem;
}

.item-details {
  flex-grow: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-weight: bold;
  color: var(--el-color-primary);
}

.item-quantity {
  color: #999;
  font-size: 0.9em;
}

.item-price {
  font-weight: bold;
  color: var(--kfc-red);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.order-total .price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--kfc-red);
  margin-left: 0.5rem;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.el-empty {
  margin-top: 3rem;
}
</style> 