<template>
  <div class="merchant-info">
    <div class="container">
      <div class="merchant-content">
        <div class="merchant-logo">
          <el-image
            :src="merchantInfo.logo || '/images/merchant-logo.png'"
            fit="cover"
          >
            <template #error>
              <div class="logo-error">
                <el-icon><Shop /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
        
        <div class="merchant-details">
          <h1 class="merchant-name">{{ merchantInfo.name }}</h1>
          <div class="merchant-meta">
            <div class="meta-item">
              <el-icon><Star /></el-icon>
              <span>{{ merchantInfo.rating || '暂无评分' }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ merchantInfo.address || '暂无地址' }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Phone /></el-icon>
              <span>{{ merchantInfo.phone || '暂无电话' }}</span>
            </div>
          </div>
          <p class="merchant-description">{{ merchantInfo.description || '暂无商家介绍' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Shop, Star, Location, Phone } from '@element-plus/icons-vue'
import { useMerchantStore } from '@/stores/merchant'

const merchantStore = useMerchantStore()
const merchantInfo = ref({})

onMounted(async () => {
  try {
    const info = await merchantStore.getMerchantInfo()
    merchantInfo.value = info
  } catch (error) {
    console.error('Failed to fetch merchant info:', error)
  }
})
</script>

<style scoped>
.merchant-info {
  background-color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.merchant-content {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.merchant-logo {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.merchant-logo :deep(.el-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 2rem;
}

.merchant-details {
  flex-grow: 1;
}

.merchant-name {
  margin: 0 0 1rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.merchant-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--el-text-color-regular);
}

.meta-item .el-icon {
  font-size: 1.2rem;
  color: var(--el-color-primary);
}

.merchant-description {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .merchant-content {
    flex-direction: column;
    text-align: center;
  }

  .merchant-meta {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style> 