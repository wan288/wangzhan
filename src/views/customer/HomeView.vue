<template>
  <div class="home">
    <!-- Header Banner -->
    <div class="banner">
      <div class="carousel-wrapper">
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
  margin-bottom: 2rem;
}

.carousel-wrapper {
  max-width: 1400px; /* Increased max-width for a larger carousel */
  width: 100%;
  margin: 0 auto; /* Center the carousel */
}

.el-carousel {
  height: 600px; /* Set a fixed height for the carousel */
}

.el-carousel-item {
  height: 100%;
}

.banner-content {
  height: 100%; /* Ensure banner content fills the carousel item height */
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  color: white;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
}

.banner-text {
  position: relative;
  z-index: 1;
  padding: 20px;
  max-width: 800px;
}

.banner-text h2 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.banner-text p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.order-btn {
  font-size: 1.2rem;
  padding: 15px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.order-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  padding: 1.5rem 0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: -4rem; /* Overlap with banner */
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.action-item:hover {
  background-color: #f0f2f5;
  color: var(--el-color-primary);
  transform: translateY(-5px);
}

.action-item .el-icon {
  font-size: 2.5rem;
  color: var(--el-color-primary);
}

.cart-badge {
  position: absolute;
  top: 5px;
  right: 5px;
}

/* Section Header Styles */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
  margin-top: 4rem;
}

.section-title {
  font-size: 2.8rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: bold;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background-color: var(--el-color-primary);
  border-radius: 2px;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
}

/* Featured Categories */
.featured-categories {
  margin-bottom: 4rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.category-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.category-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image {
  transform: scale(1.05);
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-card h3 {
  padding: 1rem;
  text-align: center;
  color: #333;
  font-size: 1.4rem;
}

/* Featured Items */
.featured-items {
  margin-bottom: 4rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.item-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.item-image-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-card:hover .item-image {
  transform: scale(1.05);
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.item-card:hover .item-overlay {
  opacity: 1;
}

.item-overlay .el-button {
  font-size: 1.1rem;
  padding: 12px 25px;
  border-radius: 30px;
}

.item-info {
  padding: 1rem;
}

.item-info h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.item-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.item-price .price {
  font-size: 1.6rem;
  color: var(--el-color-primary);
  font-weight: bold;
}

/* Special Offers */
.special-offers {
  margin-bottom: 4rem;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.offer-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
}

.offer-card.highlighted {
  border: 3px solid var(--el-color-primary);
  box-shadow: 0 6px 16px rgba(var(--el-color-primary-rgb), 0.3);
}

.offer-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.offer-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.offer-icon {
  color: var(--el-color-primary);
  margin-bottom: 1rem;
}

.offer-card h3 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.8rem;
  font-weight: bold;
}

.offer-card p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.offer-btn {
  font-size: 1rem;
  padding: 10px 20px;
  border-radius: 25px;
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.offer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .banner-text h2 {
    font-size: 2.5rem;
  }

  .banner-text p {
    font-size: 1.2rem;
  }

  .quick-actions {
    flex-direction: column;
    margin-top: -2rem;
  }

  .action-item {
    width: 100%;
    border-bottom: 1px solid #eee;
  }

  .action-item:last-child {
    border-bottom: none;
  }

  .category-grid, .items-grid, .offers-grid {
    grid-template-columns: 1fr;
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