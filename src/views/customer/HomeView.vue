<template>
  <div class="home">
    <!-- Header Banner -->
    <div class="banner">
      <el-carousel height="500px">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-content" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-text">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.description }}</p>
              <el-button type="primary" size="large" @click="$router.push('/menu')">
                立即订购
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- Featured Categories -->
    <div class="container">
      <section class="featured-categories">
        <h2 class="section-title">特色分类</h2>
        <div class="category-grid">
          <el-card
            v-for="category in menuStore.categories"
            :key="category._id"
            class="category-card"
            @click="$router.push(`/menu?category=${category._id}`)"
          >
            <img :src="category.image" :alt="category.name" class="category-image">
            <h3>{{ category.name }}</h3>
          </el-card>
        </div>
      </section>

      <!-- Featured Items -->
      <section class="featured-items">
        <h2 class="section-title">热门菜品</h2>
        <div class="items-grid">
          <el-card
            v-for="item in menuStore.getFeaturedItems"
            :key="item._id"
            class="item-card"
            @click="addToCart(item)"
          >
            <img :src="item.image" :alt="item.name" class="item-image">
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-price">
                <span class="price">¥{{ item.price }}</span>
                <el-button type="primary" size="small" @click.stop="addToCart(item)">
                  加入购物车
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </section>

      <!-- Special Offers -->
      <section class="special-offers">
        <h2 class="section-title">特别优惠</h2>
        <div class="offers-grid">
          <el-card
            v-for="offer in specialOffers"
            :key="offer.id"
            class="offer-card"
            :class="{ 'highlighted': offer.highlighted }"
          >
            <div class="offer-content">
              <h3>{{ offer.title }}</h3>
              <p>{{ offer.description }}</p>
              <el-button type="primary" @click="$router.push(offer.link)">
                了解更多
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

const menuStore = useMenuStore()
const userStore = useUserStore()

// Mock data - replace with actual API calls
const banners = ref([
  {
    id: 1,
    title: '香辣鸡腿堡新品上市',
    description: '尝尝我们全新特制酱料的香辣鸡腿堡！',
    image: '/images/banner1.jpg'
  },
  {
    id: 2,
    title: '家庭套餐优惠',
    description: '家庭聚餐最佳选择 - 立省30%！',
    image: '/images/banner2.jpg'
  }
])

const specialOffers = ref([
  {
    id: 1,
    title: '学生专属折扣',
    description: '凭学生证可享85折优惠',
    link: '/offers/student',
    highlighted: true
  },
  {
    id: 2,
    title: '超值家庭组合',
    description: '用我们的特别组合满足全家人胃口',
    link: '/offers/family',
    highlighted: false
  }
])

onMounted(async () => {
  await menuStore.fetchCategories()
  await menuStore.fetchMenuItems()
})

function addToCart(item) {
  userStore.addToCart(item)
  ElMessage.success('已添加到购物车！')
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.banner {
  margin-bottom: 2rem;
}

.banner-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  padding: 2rem;
  position: relative;
}

.banner-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.banner-text {
  position: relative;
  color: white;
  max-width: 600px;
  z-index: 1;
}

.banner-text h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin: 2rem 0;
  color: var(--primary-color);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.category-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.item-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.item-card:hover {
  transform: translateY(-5px);
}

.item-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.item-info {
  padding: 1rem;
}

.item-description {
  color: #666;
  margin: 0.5rem 0;
}

.item-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--primary-color);
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.offer-card {
  background: linear-gradient(135deg, var(--primary-color), #ff6b6b);
  color: white;
}

.offer-card.highlighted {
  background: linear-gradient(135deg, var(--secondary-color), #ffd700);
}

.offer-content {
  padding: 1.5rem;
  text-align: center;
}

.offer-content h3 {
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .banner-text h2 {
    font-size: 2rem;
  }

  .category-grid,
  .items-grid,
  .offers-grid {
    grid-template-columns: 1fr;
  }
}
</style> 