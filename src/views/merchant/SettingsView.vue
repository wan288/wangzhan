<template>
  <div class="merchant-settings-page">
    <h1 class="page-title">设置</h1>

    <el-card class="settings-card">
      <el-tabs tab-position="left" class="settings-tabs">
        <el-tab-pane label="店铺信息">
          <div class="tab-content">
            <h3>店铺基本信息</h3>
            <el-form :model="storeInfo" label-width="120px" class="settings-form">
              <el-form-item label="店铺名称">
                <el-input v-model="storeInfo.name" />
              </el-form-item>
              <el-form-item label="店铺地址">
                <el-input v-model="storeInfo.address" type="textarea" />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input v-model="storeInfo.phone" />
              </el-form-item>
              <el-form-item label="营业时间">
                <el-input v-model="storeInfo.openingHours" />
              </el-form-item>
              <el-form-item label="店铺 Logo">
                <div v-if="storeInfo.logo">
                  <img :src="storeInfo.logo" class="logo-image" />
                </div>
                <div v-else class="uploader-placeholder">
                  <el-icon class="uploader-icon"><Plus /></el-icon>
                  <span>上传Logo</span>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveStoreInfo" :loading="savingStoreInfo">
                  保存店铺信息
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="配送设置">
          <div class="tab-content">
            <h3>配送区域与费用</h3>
            <el-form :model="deliverySettings" label-width="120px" class="settings-form">
              <el-form-item label="配送范围">
                <el-input v-model="deliverySettings.deliveryRadius" type="number">
                  <template #append>公里</template>
                </el-input>
              </el-form-item>
              <el-form-item label="起送金额">
                <el-input v-model="deliverySettings.minOrderAmount" :min="0" :precision="2">
                  <template #prepend>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item label="基础配送费">
                <el-input v-model="deliverySettings.baseDeliveryFee" :min="0" :precision="2">
                  <template #prepend>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item label="免配送费门槛">
                <el-input v-model="deliverySettings.freeDeliveryThreshold" :min="0" :precision="2">
                  <template #prepend>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveDeliverySettings" :loading="savingDeliverySettings">
                  保存配送设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="支付设置">
          <div class="tab-content">
            <h3>支付接口配置</h3>
            <el-form :model="paymentSettings" label-width="120px" class="settings-form">
              <el-form-item label="支付宝 AppID">
                <el-input v-model="paymentSettings.alipayAppId" />
              </el-form-item>
              <el-form-item label="微信支付 MchID">
                <el-input v-model="paymentSettings.wechatPayMchId" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="savePaymentSettings" :loading="savingPaymentSettings">
                  保存支付设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const storeInfo = ref({
  name: '',
  address: '',
  phone: '',
  openingHours: '',
  logo: ''
})
const deliverySettings = ref({
  deliveryRadius: 0,
  minOrderAmount: 0,
  baseDeliveryFee: 0,
  freeDeliveryThreshold: 0
})
const paymentSettings = ref({
  alipayAppId: '',
  wechatPayMchId: ''
})

const savingStoreInfo = ref(false)
const savingDeliverySettings = ref(false)
const savingPaymentSettings = ref(false)

onMounted(() => {
  fetchSettings()
})

async function fetchSettings() {
  try {
    // TODO: 从后端获取设置数据
    // 模拟数据加载
    await new Promise(resolve => setTimeout(resolve, 500))
    storeInfo.value = {
      name: 'KFC 炸鸡店',
      address: '某某市某某区某某商业街123号',
      phone: '010-12345678',
      openingHours: '每日 09:00 - 22:00',
      logo: '/images/merchant-logo.png'
    }
    deliverySettings.value = {
      deliveryRadius: 5,
      minOrderAmount: 30,
      baseDeliveryFee: 5,
      freeDeliveryThreshold: 80
    }
    paymentSettings.value = {
      alipayAppId: '2021000123456789',
      wechatPayMchId: '1900001093'
    }
    console.log('[SettingsView] Settings data loaded successfully.'); // DEBUG: Log success
  } catch (error) {
    console.error('[SettingsView] Error fetching settings:', error); // DEBUG: Log error
    ElMessage.error('加载设置数据失败');
  }
}

async function saveStoreInfo() {
  savingStoreInfo.value = true
  try {
    // TODO: 调用后端 API 保存店铺信息
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('店铺信息保存成功')
  } catch (error) {
    ElMessage.error('店铺信息保存失败')
    console.error(error)
  } finally {
    savingStoreInfo.value = false
  }
}

async function saveDeliverySettings() {
  savingDeliverySettings.value = true
  try {
    // TODO: 调用后端 API 保存配送设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('配送设置保存成功')
  } catch (error) {
    ElMessage.error('配送设置保存失败')
    console.error(error)
  } finally {
    savingDeliverySettings.value = false
  }
}

async function savePaymentSettings() {
  savingPaymentSettings.value = true
  try {
    // TODO: 调用后端 API 保存支付设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('支付设置保存成功')
  } catch (error) {
    ElMessage.error('支付设置保存失败')
    console.error(error)
  } finally {
    savingPaymentSettings.value = false
  }
}

function handleLogoSuccess(res, file) {
  // TODO: 更新 Logo URL
  storeInfo.value.logo = res.data.url // 假设后端返回图片 URL 在 res.data.url
  ElMessage.success('Logo 上传成功')
}

function beforeLogoUpload(rawFile) {
  const isJPGPNG = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png'
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isJPGPNG) {
    ElMessage.error('图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  return isJPGPNG && isLt2M
}
</script>

<style scoped>
.merchant-settings-page {
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

.settings-card {
  flex: 1; /* Make card fill remaining space */
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.settings-card :deep(.el-card__body) {
  flex: 1; /* Ensure card body fills remaining space */
  display: flex;
  flex-direction: column;
  padding: 0; /* Remove default card body padding */
}

.settings-tabs {
  flex: 1; /* Make tabs fill remaining space */
  display: flex;
  flex-direction: column;
}

.settings-tabs :deep(.el-tabs__content) {
  flex: 1; /* Make tab content fill remaining space */
  overflow-y: auto; /* Enable scrolling for tab content */
  padding: 1.5rem;
}

.settings-tabs :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  padding-right: 1.5rem; /* Add some padding to the right of the form content */
}

.settings-form {
  width: 100%;
  max-width: 600px; /* Limit form width for better readability */
}

.logo-image {
  width: 100px;
  height: 100px;
  border-radius: var(--el-border-radius-small);
  object-fit: cover;
}

.uploader-placeholder {
  width: 100px;
  height: 100px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
  font-size: 0.8rem;
  cursor: pointer;
}

.uploader-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 5px;
}
</style> 