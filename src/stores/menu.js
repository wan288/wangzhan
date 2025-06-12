import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from './user' // 引入用户 store 来获取 token

export const useMenuStore = defineStore('menu', () => {
  const categories = ref([])
  const menuItems = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getItemsByCategory = computed(() => {
    return (categoryId) => menuItems.value.filter(item => item.categoryId === categoryId)
  })

  const getFeaturedItems = computed(() => {
    return menuItems.value.filter(item => item.featured)
  })

  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/categories')
      categories.value = Array.isArray(response.data) ? response.data : []
    } catch (err) {
      error.value = 'Failed to fetch categories'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchMenuItems() {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get('/api/dishes')
      menuItems.value = Array.isArray(response.data) ? response.data : []
    } catch (err) {
      error.value = 'Failed to fetch menu items'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function addMenuItem(item) {
    loading.value = true
    error.value = null
    const userStore = useUserStore()
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.token}`
        }
      }
      const response = await axios.post('/api/dishes', item, config)
      menuItems.value.push(response.data)
    } catch (err) {
      error.value = 'Failed to add menu item'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function updateMenuItem(id, updates) {
    loading.value = true
    error.value = null
    const userStore = useUserStore()
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userStore.token}`
        }
      }
      const response = await axios.put(`/api/dishes/${id}`, updates, config)
      const index = menuItems.value.findIndex(item => item._id === id) // 后端返回的id是_id
      if (index !== -1) {
        menuItems.value[index] = response.data
      }
    } catch (err) {
      error.value = 'Failed to update menu item'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function deleteMenuItem(id) {
    loading.value = true
    error.value = null
    const userStore = useUserStore()
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      }
      await axios.delete(`/api/dishes/${id}`, config)
      menuItems.value = menuItems.value.filter(item => item._id !== id) // 后端返回的id是_id
    } catch (err) {
      error.value = 'Failed to delete menu item'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    menuItems,
    loading,
    error,
    getItemsByCategory,
    getFeaturedItems,
    fetchCategories,
    fetchMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  }
}) 