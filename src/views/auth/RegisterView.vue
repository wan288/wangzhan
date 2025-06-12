<template>
  <div class="register-page">
    <el-card class="register-card">
      <div class="logo-container">
        <img src="/images/logo.png" alt="Logo" class="register-logo">
        <h2>注册新账号</h2>
      </div>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        class="register-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          ></el-input>
        </el-form-item>
        
        <!-- 邮箱字段已移除 -->
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <!-- 角色选择字段已移除 -->
        
        <el-form-item>
          <el-button type="primary" :loading="userStore.loading" @click="handleRegister" class="register-button">
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="login-link">
          <span>已有账号? <router-link to="/login">立即登录</router-link></span>
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
import { User, Message, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref(null)

const registerForm = reactive({
  username: '',
  // email: '', // 邮箱字段已移除
  password: '',
  confirmPassword: '',
  role: 'customer' // Default to customer
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const registerRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  // email: [
  //   { required: true, message: '请输入邮箱', trigger: 'blur' },
  //   { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  // ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ],
  // role: [
  //   { required: true, message: '请选择注册角色', trigger: 'change' }
  // ]
})

const handleRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const success = await userStore.register(
          registerForm.username,
          // registerForm.email, // 邮箱字段已移除
          registerForm.password,
          registerForm.role // Pass the default role 'customer'
        )
        if (success) {
          ElMessage.success('注册成功，请登录！')
          router.push('/login')
        } else {
          ElMessage.error(userStore.error || '注册失败，请重试')
        }
      } catch (error) {
        ElMessage.error('注册请求发送失败')
        console.error('Register request failed:', error)
      }
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.register-card {
  width: 400px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.register-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
}

.logo-container h2 {
  color: var(--el-color-primary);
  font-size: 1.8rem;
  margin: 0;
}

.register-form .el-form-item {
  margin-bottom: 20px;
}

.register-button {
  width: 100%;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  margin-top: 15px;
}

.login-link a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    width: 90%;
    padding: 20px;
  }
}
</style>