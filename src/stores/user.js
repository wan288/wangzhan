import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

// 辅助函数：安全地从 localStorage 解析 JSON
const safeParseJSON = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === 'undefined') {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error parsing localStorage item "${key}":`, e);
    return defaultValue;
  }
};

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  console.log('[UserStore] Initial token from localStorage:', token.value);
  const userInfo = ref(safeParseJSON('userInfo', {}))
  const cart = ref([])
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isMerchant = computed(() => userInfo.value?.role === 'merchant')
  const isAdmin = computed(() => userInfo.value?.role === 'admin')

  function setToken(newToken) {
    console.log('[UserStore] setToken called with:', newToken);
    token.value = newToken
    localStorage.setItem('token', newToken)
    console.log('[UserStore] token set in localStorage:', localStorage.getItem('token'));
  }

  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function clearUserData() {
    token.value = ''
    userInfo.value = {}
    cart.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  async function register(username, password, role) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/auth/register', { username, password, role })
      setToken(response.data.token)
      setUserInfo(response.data)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || '注册失败'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(identifier, password) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post('/api/auth/login', { identifier: identifier, password })
      console.log('[UserStore] Login API response data:', response.data);
      setToken(response.data.data.token)
      setUserInfo(response.data.data.user)
      console.log('[UserStore] Token and UserInfo set after login.');
      return true
    } catch (err) {
      error.value = err.response?.data?.message || '登录失败'
      console.error('[UserStore] Login error:', err);
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return
    loading.value = true
    error.value = null
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }
      const response = await axios.get('/api/auth/me', config)
      setUserInfo(response.data)
    } catch (err) {
      error.value = err.response?.data?.message || '获取用户信息失败'
      console.error(err)
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        clearUserData()
      }
    } finally {
      loading.value = false
    }
  }

  async function updateUserProfile(updates) {
    loading.value = true
    error.value = null
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`
        }
      }
      const response = await axios.put('/api/auth/me', updates, config)
      setUserInfo(response.data)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || '更新用户信息失败'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function changeUserPassword(oldPassword, newPassword) {
    loading.value = true
    error.value = null
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`
        }
      }
      await axios.put('/api/auth/change-password', { oldPassword, newPassword }, config)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || '修改密码失败'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  function addToCart(item) {
    const existingItem = cart.value.find(i => i._id === item._id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.value.push({ ...item, quantity: 1 })
    }
  }

  function removeFromCart(itemId) {
    cart.value = cart.value.filter(item => item._id !== itemId)
  }

  function updateCartItemQuantity(itemId, quantity) {
    const item = cart.value.find(i => i._id === itemId)
    if (item) {
      item.quantity = quantity
    }
  }

  function clearCart() {
    cart.value = []
  }

  return {
    token,
    userInfo,
    cart,
    loading,
    error,
    isAuthenticated,
    isMerchant,
    isAdmin,
    setToken,
    setUserInfo,
    clearUserData,
    register,
    login,
    fetchUserInfo,
    updateUserProfile,
    changeUserPassword,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
  }
}, {
  persist: {
    paths: [
      {
        key: 'token',
        storage: localStorage,
        serializer: {
          serialize: (value) => value, // Store as is (string)
          deserialize: (value) => value, // Retrieve as is (string)
        },
      },
      'userInfo',
      'cart',
    ]
  }
}) 