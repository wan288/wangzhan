<template>
  <div class="cart-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>我的购物车 ({{ cartStore.totalQuantity }} 件商品)</span>
          <el-button type="danger" :icon="Delete" circle @click="clearCart" v-if="cartStore.totalQuantity > 0"></el-button>
        </div>
      </template>
      
      <div v-if="cartStore.totalQuantity === 0" class="empty-cart">
        <el-empty description="购物车是空的,快去点餐吧!" />
        <el-button type="primary" @click="router.push('/customer/menu')">去菜单</el-button>
      </div>

      <div v-else>
        <el-table :data="cartStore.items" style="width: 100%" class="cart-table">
          <el-table-column label="商品" width="300">
            <template #default="scope">
              <div class="dish-item">
                <img :src="scope.row.image" class="dish-image" alt="Dish Image" />
                <span class="dish-name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="数量" width="180">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                @change="(currentValue) => updateQuantity(scope.row.id, currentValue)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="scope">
              ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="danger" :icon="Remove" circle @click="removeItem(scope.row.id)"></el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="cart-summary">
          <div class="total-amount">总计: <span class="price">¥{{ cartStore.totalAmount.toFixed(2) }}</span></div>
          <el-button type="success" size="large" @click="showCheckoutDialog = true">去结算</el-button>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="showCheckoutDialog"
      title="填写配送信息"
      width="500px"
      :before-close="handleCloseCheckoutDialog"
    >
      <el-form :model="orderForm" :rules="orderFormRules" ref="orderFormRef" label-width="80px">
        <el-form-item label="收货人" prop="consignee">
          <el-input v-model="orderForm.consignee" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="orderForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="收货地址" prop="address">
          <el-input v-model="orderForm.address" placeholder="请输入收货地址"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="orderForm.remark" placeholder="如有特殊要求,请填写备注"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseCheckoutDialog">取消</el-button>
          <el-button type="primary" @click="submitOrder">确认下单</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Delete, Remove } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const showCheckoutDialog = ref(false)
const orderFormRef = ref(null)
const orderForm = reactive({
  consignee: '',
  phone: '',
  address: '',
  remark: ''
})

const orderFormRules = {
  consignee: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
}

const clearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  }).catch(() => {
    // 用户取消操作
  })
}

const updateQuantity = (dishId, quantity) => {
  cartStore.updateItemQuantity(dishId, quantity)
}

const removeItem = (dishId) => {
  ElMessageBox.confirm('确定要从购物车中移除此商品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cartStore.removeItem(dishId)
    ElMessage.success('商品已移除')
  }).catch(() => {
    // 用户取消操作
  })
}

const submitOrder = () => {
  orderFormRef.value.validate(async (valid) => {
    if (valid) {
      // TODO: Implement actual order submission to backend
      console.log('提交订单数据:', {
        ...orderForm,
        items: cartStore.items.map(item => ({
          dishId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cartStore.totalAmount
      })
      ElMessage.success('订单提交成功!')
      cartStore.clearCart()
      showCheckoutDialog.value = false
      router.push('/customer/home') // Redirect to home or order history page
    } else {
      ElMessage.error('请检查您的填写信息!')
    }
  })
}

const handleCloseCheckoutDialog = (done) => {
  ElMessageBox.confirm('确定要取消订单吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orderFormRef.value.resetFields()
    done()
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style scoped>
</style> 