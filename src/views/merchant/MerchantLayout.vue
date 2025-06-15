<template>
  <div class="merchant-layout">
    <div class="layout-wrapper">
      <!-- 侧边栏导航 -->
      <el-aside width="200px" class="sidebar">
        <div class="logo-section">
          <img src="/images/merchant-logo.png" alt="Merchant Logo" class="merchant-logo">
          <h3>商家后台</h3>
        </div>
        <el-menu
          :default-active="activeMenu"
          router
          class="merchant-menu"
        >
          <el-menu-item index="/merchant/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/merchant/orders">
            <el-icon><Tickets /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/menu">
            <el-icon><Dish /></el-icon>
            <span>菜单管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/analytics">
            <el-icon><TrendCharts /></el-icon>
            <span>销售分析</span>
          </el-menu-item>
          <el-menu-item index="/merchant/settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
          <el-menu-item index="/logout" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container style="flex: 1; flex-direction: column;">
        <!-- 顶部导航栏 -->
        <el-header class="merchant-header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
                {{ item.meta.title || item.name }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown trigger="click">
              <el-button class="user-button">
                <el-avatar :size="32" :src="userStore.userInfo.avatar">
                  {{ userStore.userInfo.username?.[0]?.toUpperCase() }}
                </el-avatar>
                <span class="username">{{ userStore.userInfo.username }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/profile')">个人中心</el-dropdown-item>
                  <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主要内容区域 -->
        <el-main class="merchant-main">
          <div class="content-wrapper">
            <div class="router-view-wrapper">
              <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                  <component :is="Component" />
                </transition>
              </router-view>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  Tickets,
  Dish,
  TrendCharts,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.name || item.meta.title)
  return matched.map(item => ({
    path: item.path,
    name: item.name,
    meta: item.meta
  }))
})

function logout() {
  userStore.clearUserData()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
/* Removed Universal border for debugging */
/*
* {
  border: 1px solid red !important;
}
*/

.merchant-layout {
  height: 100vh;
  width: 100%; /* 确保它占据整个视口宽度 */
  display: flex;
  /* background-color: orange; */ /* DEBUG: 临时背景色 */
}

.layout-wrapper {
  flex: 1; /* 使其占据 .merchant-layout 中所有可用空间 */
  display: flex;
  flex-direction: row; /* 强制水平布局 */
  /* 移除 width: 100%; 和 height: 100%; 因为 flex: 1 会处理 */
  /* background-color: orange; */ /* DEBUG: 临时背景色 */
}

/* Removed .merchant-layout .el-container as it's no longer the outer container */

.sidebar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* 确保内容不会溢出 */
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.merchant-logo {
  width: 60px;
  height: 60px;
  margin-bottom: 0.5rem;
}

.logo-section h3 {
  color: white;
  font-size: 1.2rem;
  margin: 0;
}

.merchant-menu {
  background-color: #2c3e50;
  border-right: none;
}

.merchant-menu :deep(.el-menu-item) {
  color: white;
  margin: 0.5rem 0;
  border-radius: var(--border-radius);
}

.merchant-menu :deep(.el-menu-item.is-active) {
  background-color: var(--primary-color);
  color: white;
}

.merchant-menu :deep(.el-menu-item:hover) {
  background-color: #3f5872;
}

.merchant-menu :deep(.el-menu-item .el-icon) {
  margin-right: 10px;
}

.merchant-header {
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-left .el-breadcrumb {
  font-size: 1rem;
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

.merchant-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* background-color: purple; */ /* DEBUG: 临时背景色 */
  width: 100%;
  overflow: auto; /* 允许内容滚动 */
}

.merchant-main :deep(.el-main) {
  padding: 0 !important;
  width: 100% !important;
  flex-grow: 1;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  /* background-color: yellow; */ /* DEBUG: 临时背景色 */
}

.router-view-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.merchant-main :deep(.router-view-container) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 确保 el-main 内容区域没有 max-width 限制 */
.merchant-main :deep(.el-main__body) {
  max-width: none !important;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px !important;
    padding: 0.5rem;
  }

  .sidebar .logo-section {
    display: none;
  }

  .merchant-menu :deep(.el-menu-item span) {
    display: none;
  }

  .merchant-menu :deep(.el-menu-item) {
    padding: 0 !important;
    justify-content: center;
  }

  .merchant-menu :deep(.el-menu-item .el-icon) {
    margin-right: 0;
  }

  .merchant-header .username {
    display: none;
  }
}
</style> 