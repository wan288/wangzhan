<template>
  <div class="order-detail-page">
    <div class="container">
      <h1 class="page-title">订单详情</h1>

      <el-card v-loading="loading" v-if="order" class="order-detail-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="order-id">订单号: {{ order._id }}</span>
            <el-tag :type="getStatusType(order.status)" size="large">{{ getStatusText(order.status) }}</el-tag>
          </div>
        </template>

        <div class="order-info-section">
          <h3>订单信息</h3>
          <div class="info-grid">
            <p><strong>下单时间:</strong> {{ new Date(order.createdAt).toLocaleString() }}</p>
            <p v-if="order.updatedAt && order.updatedAt !== order.createdAt"><strong>最后更新:</strong> {{ new Date(order.updatedAt).toLocaleString() }}</p>
            <p><strong>订单状态:</strong> <el-tag :type="getStatusType(order.status)" size="small">{{ getStatusText(order.status) }}</el-tag></p>
            <p><strong>订单总金额:</strong> <span class="price">¥{{ order.totalAmount.toFixed(2) }}</span></p>
          </div>
        </div>

        <el-divider />

        <div class="order-info-section">
          <h3>配送信息</h3>
          <div class="info-grid">
            <p><strong>收货人:</strong> {{ order.deliveryInfo.name }}</p>
            <p><strong>联系电话:</strong> {{ order.deliveryInfo.phone }}</p>
            <p><strong>配送地址:</strong> {{ order.deliveryInfo.address }}</p>
            <p v-if="order.deliveryInfo.notes"><strong>备注:</strong> {{ order.deliveryInfo.notes }}</p>
          </div>
        </div>

        <el-divider />

        <div class="order-info-section">
          <h3>订单商品</h3>
          <el-table :data="order.items" style="width: 100%" class="order-items-table">
            <el-table-column label="图片" width="100">
              <template #default="scope">
                <el-image :src="scope.row.image" fit="cover" class="item-image-table" :preview-src-list="[scope.row.image]">
                  <template #error>
                    <div class="image-placeholder-table">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </template>
            </el-table-column>
            <el-table-column label="商品名称" prop="name"></el-table-column>
            <el-table-column label="单价" width="120">
              <template #default="scope">
                ¥{{ scope.row.price.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="quantity" width="100"></el-table-column>
            <el-table-column label="小计" width="120">
              <template #default="scope">
                ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="order-actions" v-if="order.status === 'pending' || order.status === 'confirmed'">
          <el-button type="danger" @click="handleCancelOrder" :loading="cancelling" size="large">取消订单</el-button>
        </div>
      </el-card>

      <el-empty v-else-if="!loading" description="未找到订单信息">
        <el-button type="primary" @click="$router.push('/orders')">返回订单列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const orderId = route.params.id
const order = ref(null)
const loading = ref(true)
const cancelling = ref(false)

// 获取订单详情
async function fetchOrderDetail() {
  loading.value = true
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    }
    const response = await axios.get(`/api/orders/${orderId}`, config)
    order.value = response.data
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '获取订单详情失败')
    console.error(err)
    router.push('/orders') // Redirect to orders list on error
  } finally {
    loading.value = false
  }
}

// 取消订单
async function handleCancelOrder() {
  ElMessageBox.confirm(
    '确定要取消此订单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      cancelling.value = true
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userStore.token}`
          }
        }
        const response = await axios.patch(`/api/orders/${orderId}/cancel`, {}, config)
        if (response.data) {
          ElMessage.success('订单已取消')
          order.value = response.data // Update local order status
        } else {
          ElMessage.error('取消订单失败')
        }
      } catch (err) {
        ElMessage.error(err.response?.data?.message || '取消订单失败，请重试')
        console.error(err)
      } finally {
        cancelling.value = false
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

// 获取订单状态对应的 el-tag 类型
function getStatusType(status) {
  const statusMap = {
    'pending': 'warning',
    'confirmed': 'primary',
    'preparing': 'primary',
    'ready': 'success',
    'delivered': 'success',
    'cancelled': 'danger',
  }
  return statusMap[status] || 'info'
}

// 获取订单状态对应的中文文本
function getStatusText(status) {
  const statusMap = {
    'pending': '待确认',
    'confirmed': '已确认',
    'preparing': '制作中',
    'ready': '待配送',
    'delivered': '已送达',
    'cancelled': '已取消',
  }
  return statusMap[status] || '未知状态'
}

onMounted(() => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  padding: 2rem;
  max-width: 1000px; /* Adjusted max-width */
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

.order-detail-card {
  border-radius: 12px; /* Rounded corners for cards */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Softer shadow */
  transition: all 0.3s ease;
}

.order-detail-card:hover {
  transform: translateY(-5px); /* Lift on hover */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); /* More prominent shadow on hover */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.card-header .order-id {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.order-info-section {
  margin-bottom: 1.5rem;
  padding: 1rem 0;
}

.order-info-section h3 {
  font-size: 1.5rem;
  color: var(--kfc-red); /* Title color */
  margin-bottom: 1rem;
  border-left: 4px solid var(--kfc-red); /* Left border as a highlight */
  padding-left: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Responsive grid for info */
  gap: 0.8rem;
}

.order-info-section p {
  margin: 0;
  font-size: 1rem;
  color: var(--el-text-color-regular);
}

.order-info-section p strong {
  color: var(--el-text-color-primary);
  margin-right: 5px;
}

.price {
  font-weight: bold;
  color: var(--kfc-red);
  font-size: 1.1rem;
}

.order-items-table {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden; /* Ensures table corners are rounded */
}

.item-image-table {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
}

.image-placeholder-table {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 1.8rem;
}

.order-actions {
  margin-top: 2rem;
  text-align: center;
}

.order-actions .el-button--danger {
  background-color: var(--el-color-danger);
  border-color: var(--el-color-danger);
}

.order-actions .el-button--danger:hover {
  background-color: #c45656;
  border-color: #c45656;
}

.el-empty {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .order-detail-page {
    padding: 1rem;
  }
  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  .order-info-section h3 {
    font-size: 1.3rem;
  }
  .info-grid {
    grid-template-columns: 1fr; /* Single column on small screens */
  }
  .item-image-table {
    width: 50px;
    height: 50px;
  }
  .el-table__cell {
    padding: 8px 0; /* Adjust cell padding for smaller screens */
  }
}
</style> 