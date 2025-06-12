<template>
  <div class="merchant-layout">
    <el-container>
      <el-aside width="200px" v-if="!isLoginPage">
        <div class="logo">
          <router-link to="/merchant/dashboard">商家后台</router-link>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="side-menu"
          :router="true"
        >
          <el-menu-item index="/merchant/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/merchant/menu">
            <el-icon><Menu /></el-icon>
            <span>菜品管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header height="60px" v-if="!isLoginPage">
          <div class="header-content">
            <div class="breadcrumb">
              <el-breadcrumb>
                <el-breadcrumb-item :to="{ path: '/merchant/dashboard' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="user-info">
              <el-dropdown>
                <span class="user-dropdown">
                  {{ userStore.userInfo?.username || '商家用户' }}
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { DataLine, Menu, List, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isLoginPage = computed(() => route.path === '/merchant/login')
const activeMenu = computed(() => route.path)
const currentRoute = computed(() => {
  const routeMap = {
    '/merchant/dashboard': '数据概览',
    '/merchant/menu': '菜品管理',
    '/merchant/orders': '订单管理'
  }
  return routeMap[route.path] || ''
})

const handleLogout = async () => {
  await userStore.logout()
  router.push('/merchant/login')
}
</script>

<style scoped lang="scss">
.merchant-layout {
  min-height: 100vh;
  
  .el-container {
    min-height: 100vh;
  }

  .el-aside {
    background-color: #304156;
    color: #fff;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      border-bottom: 1px solid #1f2d3d;
      
      a {
        color: #fff;
        text-decoration: none;
      }
    }

    .side-menu {
      border-right: none;
      background-color: #304156;
    }
  }

  .el-header {
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);

    .header-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;

      .user-info {
        .user-dropdown {
          cursor: pointer;
          color: #606266;
          
          .el-icon {
            margin-left: 4px;
          }
        }
      }
    }
  }

  .el-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}

:deep(.el-menu) {
  background-color: #304156;
  
  .el-menu-item {
    color: #bfcbd9;
    
    &:hover, &.is-active {
      color: #fff;
      background-color: #263445;
    }
    
    .el-icon {
      margin-right: 16px;
    }
  }
}
</style> 