<template>
  <div class="login-page">
    <el-card class="login-card">
      <div class="logo-container">
        <img src="/images/logo.png" alt="Logo" class="login-logo">
        <h2>欢迎登录</h2>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
      >
        <el-form-item label="用户名/邮箱" prop="identifier">
          <el-input
            v-model="loginForm.identifier"
            placeholder="请输入用户名或邮箱"
            :prefix-icon="User"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading || userStore.loading" @click="handleLogin" class="login-button">
            登录
          </el-button>
        </el-form-item>
        <el-form-item class="register-link">
          <span>还没有账号? <router-link to="/register">立即注册</router-link></span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)

const loginForm = reactive({
  identifier: '',
  password: ''
})

const loginRules = reactive({
  identifier: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
})

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const success = await userStore.login(loginForm.identifier, loginForm.password)
        if (success) {
          ElMessage.success('登录成功!')
          
          const redirect = router.currentRoute.value.query.redirect
          console.log('[LoginView] Redirect query:', redirect);
          console.log('[LoginView] userStore.isMerchant:', userStore.isMerchant);
          console.log('[LoginView] userStore.isAdmin:', userStore.isAdmin);

          if (userStore.isMerchant || userStore.isAdmin) {
            const targetPath = redirect || '/merchant/dashboard';
            console.log('[LoginView] Attempting to redirect to merchant/admin dashboard:', targetPath);
            router.push(targetPath)
          } else {
            const targetPath = redirect || '/';
            console.log('[LoginView] Attempting to redirect to customer home:', targetPath);
            router.push(targetPath)
          }
        } else {
          ElMessage.error(userStore.error || '登录失败，请检查用户名/邮箱和密码')
        }
      } catch (error) {
        ElMessage.error('登录请求发送失败')
        console.error('Login request failed:', error)
      }
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
}

.logo-container h2 {
  color: var(--el-color-primary);
  font-size: 1.8rem;
  margin: 0;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.register-link {
  text-align: center;
  margin-top: 15px;
}

.register-link a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 20px;
  }
}
</style> 