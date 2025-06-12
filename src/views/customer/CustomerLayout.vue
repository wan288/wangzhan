<template>
  <div class="customer-layout">
    <CustomerNav />
    
    <!-- Main Content -->
    <main class="main-content">
      <MerchantInfo v-if="showMerchantInfo" />
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>关于我们</h3>
            <p>用心制作美味，致力于为顾客提供最佳的用餐体验。</p>
          </div>
          
          <div class="footer-section">
            <h3>快速链接</h3>
            <ul>
              <li><router-link to="/menu">菜单</router-link></li>
              <li><router-link to="/about">关于我们</router-link></li>
              <li><router-link to="/contact">联系我们</router-link></li>
              <li><router-link to="/careers">加入我们</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h3>联系我们</h3>
            <ul class="contact-info">
              <li>
                <el-icon><Location /></el-icon>
                123 美食街, 城市, 国家
              </li>
              <li>
                <el-icon><Phone /></el-icon>
                +1 234 567 8900
              </li>
              <li>
                <el-icon><Message /></el-icon>
                info@restaurant.com
              </li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h3>关注我们</h3>
            <div class="social-links">
              <el-button circle><el-icon><Platform /></el-icon></el-button>
              <el-button circle><el-icon><ChatDotRound /></el-icon></el-button>
              <el-button circle><el-icon><Share /></el-icon></el-button>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} 餐厅名称. 版权所有.</p>
          <div class="footer-links">
            <router-link to="/privacy">隐私政策</router-link>
            <router-link to="/terms">服务条款</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import CustomerNav from '@/components/customer/CustomerNav.vue'
import MerchantInfo from '@/components/MerchantInfo.vue'
import { Location, Phone, Message, Platform, ChatDotRound, Share } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 在菜单页面显示商家信息
const showMerchantInfo = computed(() => {
  return route.path === '/menu'
})
</script>

<style scoped>
.customer-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-page);
}

.main-content {
  flex: 1;
  margin-top: 64px; /* Height of the nav */
  padding-bottom: 2rem;
}

.footer {
  background-color: #1a1a1a;
  color: white;
  padding: 3rem 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3 {
  color: var(--secondary-color);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: var(--secondary-color);
}

.contact-info li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: var(--secondary-color);
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
  .footer-content {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }
}
</style> 