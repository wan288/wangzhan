import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getMerchantInfo as fetchMerchantInfo } from '@/api/merchant'

export const useMerchantStore = defineStore('merchant', () => {
  const merchantInfo = ref({})
  const loading = ref(false)
  const error = ref(null)

  async function getMerchantInfo() {
    loading.value = true
    error.value = null
    
    try {
      const info = await fetchMerchantInfo()
      merchantInfo.value = info
      return info
    } catch (err) {
      error.value = '获取商家信息失败'
      ElMessage.error(error.value)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    merchantInfo,
    loading,
    error,
    getMerchantInfo
  }
}) 