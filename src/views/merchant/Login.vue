<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="clearfix">
          <span class="login-title">商家后台登录</span>
        </div>
      </template>

      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="0px" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" :prefix-icon="User" clearable></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" placeholder="密码" :prefix-icon="Lock" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%;" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456',
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟登录API调用
        await userStore.login(loginForm.username, loginForm.password)
        ElMessage.success('登录成功!')
        router.push('/merchant/dashboard') // 登录成功后跳转到商家后台仪表盘
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名或密码。')
        console.error('Login error:', error)
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5; // 浅灰色背景

  .login-card {
    width: 400px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

    .login-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      display: block;
      text-align: center;
      padding: 10px 0;
    }

    .login-form {
      padding: 20px;

      .el-input {
        height: 40px;
      }

      .el-button--primary {
        background-color: #409EFF;
        border-color: #409EFF;

        &:hover {
          background-color: #66b1ff;
          border-color: #66b1ff;
        }
      }
    }
  }
}
</style> 