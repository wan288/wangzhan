<template>
  <div class="order-detail-page">
    <div class="container">
      <h1 class="page-title">订单详情</h1>

      <el-card v-loading="loading" v-if="order" class="order-detail-card">
        <template #header>
          <div class="card-header">
            <span>订单号: {{ order._id }}</span>
            <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
        </template>

        <div class="order-info">
          <h3>订单信息</h3>
          <p><strong>下单时间:</strong> {{ new Date(order.createdAt).toLocaleString() }}</p>
          <p v-if="order.updatedAt && order.updatedAt !== order.createdAt"><strong>最后更新:</strong> {{ new Date(order.updatedAt).toLocaleString() }}</p>
          <p><strong>订单状态:</strong> <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag></p>
          <p><strong>订单总金额:</strong> <span class="price">¥{{ order.totalAmount.toFixed(2) }}</span></p>
        </div>

        <el-divider />

        <div class="delivery-info">
          <h3>配送信息</h3>
          <p><strong>收货人:</strong> {{ order.deliveryInfo.name }}</p>
          <p><strong>联系电话:</strong> {{ order.deliveryInfo.phone }}</p>
          <p><strong>配送地址:</strong> {{ order.deliveryInfo.address }}</p>
          <p v-if="order.deliveryInfo.notes"><strong>备注:</strong> {{ order.deliveryInfo.notes }}</p>
        </div>

        <el-divider />

        <div class="order-items">
          <h3>订单商品</h3>
          <el-table :data="order.items" style="width: 100%">
            <el-table-column label="商品图片" width="100">
              <template #default="scope">
                <el-image :src="scope.row.image" fit="cover" style="width: 80px; height: 80px; border-radius: 4px;" :preview-src-list="[scope.row.image]">
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </template>
            </el-table-column>
            <el-table-column label="商品名称" prop="name"></el-table-column>
            <el-table-column label="单价" prop="price" width="100">
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
          <el-button type="danger" @click="handleCancelOrder" :loading="cancelling">取消订单</el-button>
        </div>
      </el-card>

      <el-empty v-else-if="!loading" description="未找到订单信息"></el-empty>
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
    // 如果获取失败，可以考虑跳回订单列表页
    // router.push('/orders')
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
          order.value = response.data // 更新本地订单状态
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
    'pending': 'info',
    'confirmed': 'primary',
    'preparing': 'warning',
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
  padding: 2rem 0;
}

.page-title {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.order-detail-card {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info, .delivery-info, .order-items {
  margin-bottom: 1.5rem;
}

.order-info h3, .delivery-info h3, .order-items h3 {
  margin-bottom: 1rem;
  color: var(--el-color-primary);
}

.order-info p, .delivery-info p {
  margin: 0.5rem 0;
}

.price {
  font-weight: bold;
  color: var(--kfc-red);
}

.image-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #ccc;
  font-size: 1.8rem;
  border-radius: 4px;
}

.order-actions {
  margin-top: 2rem;
  text-align: center;
}
</style> 