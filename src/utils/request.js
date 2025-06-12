import axios from 'axios'
import { useUserStore } from '@/stores/user' // 引入 user store
import { ElMessage } from 'element-plus' // 引入 ElMessage，如果你的项目使用 Element Plus

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api', // api的base_url
  timeout: 5000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore() // 获取 user store 实例
    console.log('[Request Interceptor] userStore.token value:', userStore.token); // DEBUG: 打印 token 值
    if (userStore.token) {
      config.headers['Authorization'] = 'Bearer ' + userStore.token // 将token添加到请求头
    }
    return config
  },
  error => {
    // Do something with request error
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(
  response => {
    // TODO: 在这里处理响应数据
    const res = response.data
    // 假设后端返回的数据结构为 { code: xxx, message: xxx, data: xxx }
    // 并且成功状态码为 200
    if (res.code !== 200 && res.code !== 20000) { // 假设20000为成功状态码，或者200
      ElMessage({ // 使用 ElMessage 提示错误信息
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      // 401: 未登录或token过期
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout() // 清除用户信息
        window.location.reload() // 刷新页面
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res.data // 返回数据
    }
  },
  error => {
    console.error('Response error:', error) // for debug
    const message = error.response?.data?.message || error.message || '请求失败'
    ElMessage({ // 使用 ElMessage 提示错误信息
      message,
      type: 'error',
      duration: 5 * 1000
    })
    // 如果是 401 错误，清除 token 并刷新页面
    if (error.response && error.response.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default service