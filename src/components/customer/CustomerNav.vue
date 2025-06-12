<template>
  <el-header class="customer-nav">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <img src="/images/logo.png" alt="Logo" class="logo-image">
      </router-link>

      <!-- Navigation Links -->
      <el-menu
        mode="horizontal"
        :router="true"
        class="nav-menu"
        :ellipsis="false"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/menu">菜单</el-menu-item>
        <el-menu-item index="/orders" v-if="userStore.isAuthenticated">我的订单</el-menu-item>
      </el-menu>

      <!-- Right Side Actions -->
      <div class="nav-actions">
        <!-- Cart -->
        <el-badge
          :value="cartItemCount"
          :hidden="cartItemCount === 0"
          class="cart-badge"
        >
          <el-button
            type="primary"
            class="cart-button"
            @click="$router.push('/cart')"
          >
            <el-icon><ShoppingCart /></el-icon>
            购物车
          </el-button>
        </el-badge>

        <!-- User Menu -->
        <template v-if="userStore.isAuthenticated && userStore.userInfo">
          <el-dropdown trigger="click" @command="handleCommand">
            <el-button class="user-button">
              <el-avatar :size="32" :src="userStore.userInfo.avatar">
                {{ userStore.userInfo.username?.[0]?.toUpperCase() || 'U' }}
              </el-avatar>
              <span class="username">{{ userStore.userInfo.username || 'User' }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">我的资料</el-dropdown-item>
                <el-dropdown-item command="orders">订单历史</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="$router.push('/login')">登录</el-button>
          <el-button @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ShoppingCart, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const cartItemCount = computed(() => {
  return userStore.cart.reduce((total, item) => total + item.quantity, 0)
})

function handleCommand(command) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'orders':
      router.push('/orders')
      break
    case 'logout':
      userStore.clearUserData()
      ElMessage.success('已成功退出')
      router.push('/')
      break
  }
}
</script>

<style scoped>
.customer-nav {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-image {
  height: 40px;
  width: auto;
}

.nav-menu {
  border-bottom: none;
  margin-left: 2rem;
}

.nav-menu :deep(.el-menu-item) {
  font-size: 1rem;
  height: 64px;
  line-height: 64px;
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cart-badge {
  margin-right: 1rem;
}

.cart-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
}

.user-button:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 0.9rem;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-menu {
    display: none;
  }

  .username {
    display: none;
  }

  .nav-actions {
    gap: 0.5rem;
  }

  .cart-button span {
    display: none;
  }
}
</style> 