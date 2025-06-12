<template>
  <div class="customer-layout">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <div class="logo">
            <router-link to="/customer/home">点餐系统</router-link>
          </div>
          <el-menu
            mode="horizontal"
            :router="true"
            class="nav-menu"
          >
            <el-menu-item index="/customer/home">首页</el-menu-item>
            <el-menu-item index="/customer/menu">菜单</el-menu-item>
            <el-menu-item index="/customer/cart">
              购物车
              <el-badge :value="cartItemCount" class="cart-badge" v-if="cartItemCount > 0" />
            </el-menu-item>
          </el-menu>
        </div>
      </el-header>
      
      <el-main>
        <router-view></router-view>
      </el-main>

      <el-footer height="60px">
        <div class="footer-content">
          <p>&copy; 2024 点餐系统. All rights reserved.</p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const cartItemCount = computed(() => cartStore.totalQuantity)
</script>

<style scoped lang="scss">
.customer-layout {
  min-height: 100vh;
  
  .el-container {
    min-height: 100vh;
  }

  .el-header {
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: fixed;
    width: 100%;
    z-index: 1000;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .logo {
        font-size: 24px;
        font-weight: bold;
        
        a {
          color: #409EFF;
          text-decoration: none;
        }
      }

      .nav-menu {
        border-bottom: none;
      }

      .cart-badge {
        margin-left: 4px;
      }
    }
  }

  .el-main {
    padding-top: 80px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 120px);
  }

  .el-footer {
    background-color: #fff;
    border-top: 1px solid #e6e6e6;

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
    }
  }
}
</style> 