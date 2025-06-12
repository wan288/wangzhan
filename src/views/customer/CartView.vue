<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">购物车</h1>

      <div class="cart-content" v-if="cartItems.length > 0">
        <!-- 购物车列表 -->
        <div class="cart-items">
          <el-card v-for="item in cartItems" :key="item._id" class="cart-item">
            <div class="item-content">
              <!-- 商品图片 -->
              <div class="item-image">
                <el-image
                  :src="item.image"
                  fit="cover"
                  :preview-src-list="[item.image]"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>

              <!-- 商品信息 -->
              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                <div class="item-price">¥{{ item.price }}</div>
              </div>

              <!-- 数量控制 -->
              <div class="item-quantity">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="99"
                  size="small"
                  @change="(value) => updateQuantity(item._id, value)"
                />
              </div>

              <!-- 小计 -->
              <div class="item-subtotal">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </div>

              <!-- 删除按钮 -->
              <div class="item-actions">
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  @click="removeItem(item._id)"
                />
              </div>
            </div>
          </el-card>
        </div>

        <!-- 结算栏 -->
        <div class="cart-summary">
          <el-card>
            <div class="summary-content">
              <div class="summary-info">
                <div class="total-items">
                  共 {{ totalItems }} 件商品
                </div>
                <div class="total-price">
                  总计: <span class="price">¥{{ totalPrice.toFixed(2) }}</span>
                </div>
              </div>

              <div class="summary-actions">
                <el-button @click="clearCart">清空购物车</el-button>
                <el-button type="primary" @click="checkout" :loading="checkingOut">
                  去结算
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 空购物车状态 -->
      <el-empty
        v-else
        description="购物车是空的"
      >
        <el-button type="primary" @click="$router.push('/menu')">
          去点餐
        </el-button>
      </el-empty>
    </div>

    <!-- 结算对话框 -->
    <el-dialog
      v-model="checkoutDialogVisible"
      title="确认订单"
      width="500px"
    >
      <div class="checkout-form">
        <!-- 配送信息 -->
        <el-form :model="deliveryInfo" label-width="100px">
          <el-form-item label="收货人">
            <el-input v-model="deliveryInfo.name" placeholder="请输入收货人姓名" />
          </el-form-item>
          
          <el-form-item label="联系电话">
            <el-input v-model="deliveryInfo.phone" placeholder="请输入联系电话" />
          </el-form-item>
          
          <el-form-item label="配送地址">
            <el-input
              v-model="deliveryInfo.address"
              type="textarea"
              placeholder="请输入详细配送地址"
            />
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="deliveryInfo.notes"
              type="textarea"
              placeholder="请输入订单备注（选填）"
            />
          </el-form-item>
        </el-form>

        <!-- 订单摘要 -->
        <div class="order-summary">
          <h3>订单摘要</h3>
          <div class="summary-item">
            <span>商品总数:</span>
            <span>{{ totalItems }} 件</span>
          </div>
          <div class="summary-item">
            <span>配送费:</span>
            <span>¥{{ deliveryFee.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span>应付总额:</span>
            <span class="price">¥{{ (totalPrice + deliveryFee).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="checkoutDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitOrder"
            :loading="submitting"
          >
            提交订单
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Delete, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios' // Import axios

const router = useRouter()
const userStore = useUserStore()

// 状态
const checkingOut = ref(false)
const submitting = ref(false)
const checkoutDialogVisible = ref(false)
const deliveryInfo = ref({
  name: userStore.userInfo.username || '',
  phone: '',
  address: '',
  notes: ''
})

// 计算属性
const cartItems = computed(() => userStore.cart)
const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
})
const deliveryFee = computed(() => {
  // 可以根据订单金额设置不同的配送费
  return totalPrice.value >= 100 ? 0 : 10
})

// 方法
function updateQuantity(itemId, quantity) {
  userStore.updateCartItemQuantity(itemId, quantity)
}

function removeItem(itemId) {
  userStore.removeFromCart(itemId)
  ElMessage.success('商品已从购物车移除')
}

function clearCart() {
  ElMessageBox.confirm(
    '确定要清空购物车吗?'
    ,'提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      userStore.clearCart()
      ElMessage.success('购物车已清空')
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

function checkout() {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录才能结算')
    router.push('/login')
    return
  }
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空，请先添加商品')
    return
  }

  // 预填充配送信息（如果用户资料有，但目前只获取了用户名）
  // 未来可以考虑从用户资料中获取更多信息
  deliveryInfo.value.name = userStore.userInfo.username || '';

  checkoutDialogVisible.value = true
}

async function submitOrder() {
  if (!deliveryInfo.value.name || !deliveryInfo.value.phone || !deliveryInfo.value.address) {
    ElMessage.error('请填写完整的收货信息')
    return
  }

  submitting.value = true
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`
      }
    }

    const orderItemsPayload = cartItems.value.map(item => ({
      dish: item._id, // 对应后端 Dish 模型的 ObjectId
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
    }))

    const orderPayload = {
      items: orderItemsPayload,
      deliveryInfo: deliveryInfo.value,
    }

    const response = await axios.post('/api/orders', orderPayload, config)

    if (response.data) {
      ElMessage.success('订单提交成功！')
      userStore.clearCart() // 清空购物车
      checkoutDialogVisible.value = false
      router.push('/orders') // 跳转到我的订单页面
    } else {
      ElMessage.error('订单提交失败')
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '订单提交失败，请重试')
    console.error(err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cart-page {
  padding: 2rem 0;
}

.page-title {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.cart-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start; /* Aligns content to the top */
}

.cart-items {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.item-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.item-image {
  width: 90px;
  height: 90px;
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
  font-size: 1.8rem;
}

.item-info {
  flex-grow: 1;
}

.item-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 0.3rem;
}

.item-description {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.5rem;
}

.item-price {
  font-size: 1rem;
  font-weight: bold;
  color: var(--kfc-red);
}

.item-quantity {
  flex-shrink: 0;
}

.item-subtotal {
  width: 100px;
  text-align: right;
  font-weight: bold;
  color: var(--kfc-red);
}

.item-actions {
  flex-shrink: 0;
}

.cart-summary {
  flex: 1;
  position: sticky;
  top: 2rem; /* Adjust as needed for sticky positioning */
}

.summary-content {
  padding: 1.5rem;
}

.summary-info > div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.summary-info .total-price .price {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--kfc-red);
}

.summary-item.total {
  border-top: 1px solid #eee;
  padding-top: 0.8rem;
  font-size: 1.1rem;
  font-weight: bold;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.el-empty {
  margin-top: 5rem;
}

.checkout-form {
  padding: 1rem 0;
}

.order-summary {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #eee;
}

.order-summary h3 {
  margin-bottom: 1rem;
  color: var(--el-color-primary);
}

.order-summary .summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.order-summary .summary-item.total .price {
  font-size: 1.5rem;
  color: var(--kfc-red);
}

.dialog-footer {
  text-align: right;
}
</style> 