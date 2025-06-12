<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">我的购物车</h1>

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
                <div class="item-price">
                  <span>单价:</span>
                  <span>¥{{ item.price.toFixed(2) }}</span>
                </div>
              </div>

              <!-- 数量控制 -->
              <div class="item-quantity">
                <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  :max="99"
                  size="default"
                  @change="(value) => updateQuantity(item._id, value)"
                />
              </div>

              <!-- 小计 -->
              <div class="item-subtotal">
                <span class="label">小计:</span>
                <span class="value">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
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
          <el-card shadow="hover">
            <div class="summary-content">
              <div class="summary-info">
                <div class="summary-line">
                  <span class="label">商品数量:</span>
                  <span class="value">{{ totalItems }} 件</span>
                </div>
                <div class="summary-line">
                  <span class="label">商品总价:</span>
                  <span class="value">¥{{ totalPrice.toFixed(2) }}</span>
                </div>
                <div class="summary-line delivery-fee">
                  <span class="label">配送费:</span>
                  <span class="value">¥{{ deliveryFee.toFixed(2) }}</span>
                </div>
                <el-divider />
                <div class="summary-line total">
                  <span class="label">应付总额:</span>
                  <span class="price">¥{{ (totalPrice + deliveryFee).toFixed(2) }}</span>
                </div>
              </div>

              <div class="summary-actions">
                <el-button @click="clearCart" size="large">清空购物车</el-button>
                <el-button type="primary" @click="checkout" :loading="checkingOut" size="large">
                  <el-icon><PriceTag /></el-icon>
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
        description="购物车是空的，快去挑选美食吧！"
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
      class="checkout-dialog"
      center
    >
      <div class="checkout-form">
        <!-- 配送信息 -->
        <el-form :model="deliveryInfo" label-width="80px" label-position="left">
          <el-form-item label="收货人" prop="name">
            <el-input v-model="deliveryInfo.name" placeholder="请输入收货人姓名" />
          </el-form-item>
          
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="deliveryInfo.phone" placeholder="请输入联系电话" />
          </el-form-item>
          
          <el-form-item label="配送地址" prop="address">
            <el-input
              v-model="deliveryInfo.address"
              type="textarea"
              :rows="3"
              placeholder="请输入详细配送地址"
            />
          </el-form-item>
          
          <el-form-item label="备注" prop="notes">
            <el-input
              v-model="deliveryInfo.notes"
              type="textarea"
              :rows="2"
              placeholder="请输入订单备注（选填）"
            />
          </el-form-item>
        </el-form>

        <!-- 订单摘要 -->
        <div class="order-summary-dialog">
          <h3>订单详情</h3>
          <div class="summary-list">
            <div class="summary-item-dialog" v-for="item in cartItems" :key="item._id">
              <span>{{ item.name }} x {{ item.quantity }}</span>
              <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <el-divider border-style="dashed"/>
          <div class="summary-line">
            <span>商品总价:</span>
            <span>¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-line">
            <span>配送费:</span>
            <span>¥{{ deliveryFee.toFixed(2) }}</span>
          </div>
          <el-divider />
          <div class="summary-line total">
            <span>应付总额:</span>
            <span class="price">¥{{ (totalPrice + deliveryFee).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="checkoutDialogVisible = false" size="large">取消</el-button>
          <el-button
            type="primary"
            @click="submitOrder"
            :loading="submitting"
            size="large"
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
import { Delete, Picture, PriceTag } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

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

.cart-content {
  display: flex;
  gap: 2rem;
}

.cart-items {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.cart-item:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.item-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.item-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.el-image {
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
  font-size: 2rem;
}

.item-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-description {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  max-height: 2.8em; /* Limit to 2 lines */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 0.5rem;
}

.item-price {
  font-size: 1rem;
  color: var(--el-text-color-secondary);
  display: flex;
  gap: 5px;
}

.item-quantity {
  flex-shrink: 0;
}

.item-subtotal {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--kfc-red);
  margin-left: 1rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.item-subtotal .label {
  font-weight: normal;
  color: var(--el-text-color-regular);
  font-size: 0.9rem;
}

.item-actions {
  margin-left: 1rem;
  flex-shrink: 0;
}

.cart-summary {
  flex: 1;
}

.summary-content {
  padding: 1.5rem;
}

.summary-info .summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.summary-info .summary-line .label {
  color: var(--el-text-color-regular);
}

.summary-info .summary-line .value {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.summary-info .summary-line.total {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--kfc-red);
}

.summary-info .summary-line.total .price {
  font-size: 1.8rem;
  color: var(--kfc-red);
}

.summary-info .summary-line.delivery-fee {
  color: var(--el-text-color-secondary);
}

.summary-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.summary-actions .el-button {
  flex: 1;
}

.summary-actions .el-button.el-button--primary {
  background-color: var(--kfc-red);
  border-color: var(--kfc-red);
}

.summary-actions .el-button.el-button--primary:hover {
  background-color: #e03f2a;
  border-color: #e03f2a;
}

/* Empty cart state */
.el-empty {
  margin-top: 3rem;
}

/* Checkout Dialog */
.checkout-dialog .el-dialog__header {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.checkout-dialog .el-dialog__title {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.checkout-form {
  padding: 0 1rem;
}

.order-summary-dialog {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  background-color: var(--el-fill-color-light);
}

.order-summary-dialog h3 {
  font-size: 1.3rem;
  color: var(--el-text-color-primary);
  margin-bottom: 1rem;
  text-align: center;
}

.summary-list {
  max-height: 150px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.summary-item-dialog {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: var(--el-text-color-regular);
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-line span:first-child {
  color: var(--el-text-color-regular);
}

.summary-line span:last-child {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.summary-line.total {
  font-size: 1.2rem;
  font-weight: bold;
}

.summary-line.total .price {
  font-size: 1.5rem;
  color: var(--kfc-red);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--el-border-color-lighter);
}

/* Responsive */
@media (max-width: 992px) {
  .cart-content {
    flex-direction: column;
  }
  .cart-summary {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding: 1rem;
  }
  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  .item-content {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }
  .item-image {
    width: 80px;
    height: 80px;
  }
  .item-info {
    align-items: center;
  }
  .item-price {
    width: 100%;
    justify-content: center;
  }
  .item-quantity,
  .item-subtotal,
  .item-actions {
    margin-left: 0;
    margin-top: 1rem;
  }
  .item-subtotal {
    width: 100%;
    justify-content: center;
  }
  .cart-summary .summary-actions {
    flex-direction: column;
  }
}
</style> 