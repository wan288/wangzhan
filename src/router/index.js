import { createRouter, createWebHistory } from 'vue-router'
import CustomerLayout from '@/views/customer/CustomerLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: CustomerLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/customer/HomeView.vue'),
          meta: { requiresAuth: false }
        },
        {
          path: 'menu',
          name: 'menu',
          component: () => import('../views/customer/MenuView.vue'),
          meta: { requiresAuth: false }
        },
        {
          path: 'cart',
          name: 'cart',
          component: () => import('../views/customer/CartView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../views/customer/OrdersView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/customer/ProfileView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      path: '/merchant',
      name: 'merchant',
      component: () => import('../views/merchant/MerchantLayout.vue'),
      meta: { requiresAuth: true, requiresMerchant: true },
      children: [
        {
          path: 'dashboard',
          name: 'merchant-dashboard',
          component: () => import('../views/merchant/DashboardView.vue')
        },
        {
          path: 'orders',
          name: 'merchant-orders',
          component: () => import('../views/merchant/OrdersView.vue')
        },
        {
          path: 'menu',
          name: 'merchant-menu',
          component: () => import('../views/merchant/MenuView.vue')
        },
        {
          path: 'analytics',
          name: 'merchant-analytics',
          component: () => import('../views/merchant/AnalyticsView.vue')
        },
        {
          path: 'settings',
          name: 'merchant-settings',
          component: () => import('../views/merchant/SettingsView.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  let isMerchant = false;
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    isMerchant = userInfo && userInfo.role === 'admin'; // Assuming 'admin' role maps to merchant functionalities
  } catch (e) {
    console.error("Error parsing userInfo from localStorage:", e);
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresMerchant && !isMerchant) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router 