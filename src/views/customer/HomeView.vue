<template>
  <div class="home">
    <!-- Header Banner -->
    <div class="banner">
      <el-carousel :interval="5000" arrow="always" indicator-position="outside">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-content" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-overlay"></div>
            <div class="banner-text">
              <h2 class="animate__animated animate__fadeInDown">{{ banner.title }}</h2>
              <p class="animate__animated animate__fadeInUp">{{ banner.description }}</p>
              <el-button
                type="primary"
                size="large"
                class="order-btn animate__animated animate__fadeInUp"
                @click="$router.push('/menu')"
              >
                立即订购
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions container">
      <div class="action-item" @click="$router.push('/menu')">
        <el-icon><Menu /></el-icon>
        <span>浏览菜单</span>
      </div>
      <div class="action-item" @click="$router.push('/cart')">
        <el-icon><ShoppingCart /></el-icon>
        <span>购物车</span>
        <el-badge v-if="userStore.cart && userStore.cart.length" :value="userStore.cart.length" class="cart-badge" />
      </div>
      <div class="action-item" @click="$router.push('/orders')">
        <el-icon><List /></el-icon>
        <span>我的订单</span>
      </div>
      <div class="action-item" @click="$router.push('/profile')">
        <el-icon><User /></el-icon>
        <span>个人中心</span>
      </div>
    </div>

    <!-- Featured Categories, Items, Offers are within a main container div -->
    <div class="container">
      <section class="featured-categories">
        <div class="section-header">
          <h2 class="section-title">特色分类</h2>
          <p class="section-subtitle">探索我们的美食分类</p>
        </div>
        <div class="category-grid">
          <el-card
            v-for="category in menuStore.categories"
            :key="category._id"
            class="category-card animate__animated animate__fadeIn"
            @click="$router.push(`/menu?category=${category._id}`)"
          >
            <div class="category-image-wrapper">
              <img :src="category.image" :alt="category.name" class="category-image">
              <div class="category-overlay">
                <span>查看详情</span>
              </div>
            </div>
            <h3>{{ category.name }}</h3>
          </el-card>
        </div>
      </section>

      <!-- Featured Items -->
      <section class="featured-items">
        <div class="section-header">
          <h2 class="section-title">热门菜品</h2>
          <p class="section-subtitle">顾客最爱的美食</p>
        </div>
        <div class="items-grid">
          <el-card
            v-for="item in menuStore.getFeaturedItems"
            :key="item._id"
            class="item-card animate__animated animate__fadeIn"
            :body-style="{ padding: '0px' }"
          >
            <div class="item-image-wrapper">
              <img :src="item.image" :alt="item.name" class="item-image">
              <div class="item-overlay">
                <el-button type="primary" @click.stop="addToCart(item)">
                  加入购物车
                </el-button>
              </div>
            </div>
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-price">
                <span class="price">¥{{ item.price }}</span>
                <el-rate
                  v-model="item.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}分"
                />
              </div>
            </div>
          </el-card>
        </div>
      </section>

      <!-- Special Offers -->
      <section class="special-offers">
        <div class="section-header">
          <h2 class="section-title">特别优惠</h2>
          <p class="section-subtitle">限时特惠，不要错过</p>
        </div>
        <div class="offers-grid">
          <el-card
            v-for="offer in specialOffers"
            :key="offer.id"
            class="offer-card animate__animated animate__fadeIn"
            :class="{ 'highlighted': offer.highlighted }"
          >
            <div class="offer-content">
              <el-icon class="offer-icon" :size="40">
                <component :is="offer.icon" />
              </el-icon>
              <h3>{{ offer.title }}</h3>
              <p>{{ offer.description }}</p>
              <el-button type="primary" class="offer-btn" @click="$router.push(offer.link)">
                了解更多
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </el-card>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ArrowRight, Menu, ShoppingCart, List, User, Discount, Present, Star } from '@element-plus/icons-vue'
import 'animate.css/animate.min.css'

const menuStore = useMenuStore()
const userStore = useUserStore()

// Mock data - replace with actual API calls
const banners = ref([
  {
    id: 1,
    title: '香辣鸡腿堡新品上市',
    description: '尝尝我们全新特制酱料的香辣鸡腿堡！限时特惠中',
    image: '/images/banner1.jpg'
  },
  {
    id: 2,
    title: '家庭套餐优惠',
    description: '家庭聚餐最佳选择 - 立省30%！更多优惠等你来',
    image: '/images/banner2.jpg'
  },
  {
    id: 3,
    title: '下午茶套餐',
    description: '精选小食搭配饮品，享受悠闲下午时光',
    image: '/images/banner3.jpg'
  }
])

const specialOffers = ref([
  {
    id: 1,
    title: '学生专属折扣',
    description: '凭学生证可享85折优惠，每日限时特惠',
    link: '/offers/student',
    highlighted: true,
    icon: 'Discount'
  },
  {
    id: 2,
    title: '超值家庭组合',
    description: '用我们的特别组合满足全家人胃口，送精美礼品',
    link: '/offers/family',
    highlighted: false,
    icon: 'Present'
  },
  {
    id: 3,
    title: '会员专享',
    description: '成为会员享受更多优惠，积分可兑换美食',
    link: '/offers/member',
    highlighted: false,
    icon: 'Star'
  }
])

onMounted(async () => {
  await menuStore.fetchCategories()
  await menuStore.fetchMenuItems()
})

function addToCart(item) {
  userStore.addToCart(item)
  ElMessage({
    message: '已添加到购物车！',
    type: 'success',
    duration: 2000,
    showClose: true
  })
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  width: 100%; /* Added this line */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.banner {
  flex: 1;
  margin-bottom: 2rem;
  width: calc(100vw + 2px); /* Slightly increased width to cover potential sub-pixel gaps */
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.el-carousel {
  height: 100%;
}

.el-carousel-item {
  height: 100%;
}

.banner-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* Ensured padding is 0 */
  position: relative;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4));
}

.banner-text {
  position: relative;
  color: white;
  max-width: none; /* Removed max-width to allow full expansion */
  width: 100%; /* Take full width of its parent */
  z-index: 1;
  padding: 2rem 0; /* Only vertical padding, no horizontal */
  text-align: center;
  margin: 0 auto;
}

.banner-text h2 {
  font-size: 3.8rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-text p {
  font-size: 1.4rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.order-btn {
  padding: 1rem 2.8rem;
  font-size: 1.3rem;
  border-radius: 30px;
  transition: transform 0.3s;
}

.order-btn:hover {
  transform: translateY(-2px);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: -1rem auto 2rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  position: relative;
}

.action-item:hover {
  background-color: var(--el-color-primary-light-9);
  transform: translateY(-2px);
}

.action-item .el-icon {
  font-size: 1.5rem;
  color: var(--el-color-primary);
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2.5rem;
  color: var(--el-color-primary);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.category-card {
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-image-wrapper {
  position: relative;
  overflow: hidden;
  padding-top: 75%;
}

.category-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-card:hover .category-image {
  transform: scale(1.1);
}

.category-card h3 {
  padding: 1rem;
  margin: 0;
  text-align: center;
  font-size: 1.2rem;
  color: #333;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.item-card {
  transition: all 0.3s;
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.item-image-wrapper {
  position: relative;
  overflow: hidden;
  padding-top: 75%;
}

.item-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.item-card:hover .item-overlay {
  opacity: 1;
}

.item-card:hover .item-image {
  transform: scale(1.1);
}

.item-info {
  padding: 1.5rem;
}

.item-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  color: #333;
}

.item-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.item-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.4rem;
  color: var(--el-color-danger);
  font-weight: bold;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.offer-card {
  text-align: center;
  padding: 2rem;
  transition: all 0.3s;
  border: none;
  border-radius: 15px;
}

.offer-card.highlighted {
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-7));
}

.offer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.offer-icon {
  color: var(--el-color-primary);
  margin-bottom: 1rem;
}

.offer-content h3 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 1rem;
}

.offer-content p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.offer-btn {
  border-radius: 20px;
  padding: 0.8rem 1.5rem;
}

@media (max-width: 768px) {
  .banner-text h2 {
    font-size: 2rem;
  }

  .banner-text p {
    font-size: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-grid,
  .items-grid,
  .offers-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .banner-text {
    padding: 1rem;
  }

  .banner-text h2 {
    font-size: 1.8rem;
  }
}
</style>