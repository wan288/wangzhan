<template>
  <div class="home-container">
    <el-card class="search-card" shadow="hover">
      <el-input
        placeholder="搜索您想点的美味"
        v-model="searchQuery"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch"></el-button>
        </template>
      </el-input>
    </el-card>

    <el-carousel :interval="4000" type="card" height="200px" class="promotion-carousel">
      <el-carousel-item v-for="item in promotions" :key="item.id">
        <img :src="item.image" class="carousel-image" alt="Promotion Image" />
      </el-carousel-item>
    </el-carousel>

    <h2 class="section-title">热门推荐</h2>
    <el-row :gutter="20" class="dish-list">
      <el-col :span="6" v-for="dish in recommendedDishes" :key="dish.id">
        <el-card class="dish-card" shadow="hover">
          <img :src="dish.image" class="dish-image" alt="Dish Image" />
          <div class="dish-info">
            <div class="dish-name">{{ dish.name }}</div>
            <div class="dish-price">¥{{ dish.price.toFixed(2) }}</div>
            <el-button type="primary" :icon="Plus" circle @click="addToCart(dish)"></el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <h2 class="section-title">分类浏览</h2>
    <el-row :gutter="20" class="category-list">
      <el-col :span="4" v-for="category in categories" :key="category.id">
        <el-card class="category-card" shadow="hover" @click="goToMenu(category.name)">
          <img :src="category.image" class="category-image" alt="Category Image" />
          <div class="category-name">{{ category.name }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const searchQuery = ref('')

const promotions = ref([
  { id: 1, image: 'https://fakeimg.pl/600x200/cccccc/909090?text=Promotion+1' },
  { id: 2, image: 'https://fakeimg.pl/600x200/dddddd/909090?text=Promotion+2' },
  { id: 3, image: 'https://fakeimg.pl/600x200/eeeeee/909090?text=Promotion+3' }
])

const recommendedDishes = ref([
  { id: 1, name: '巨无霸汉堡', price: 25.00, image: 'https://fakeimg.pl/200x200/ff0000/fff?text=Burger' },
  { id: 2, name: '香辣鸡腿堡', price: 22.00, image: 'https://fakeimg.pl/200x200/00ff00/fff?text=Chicken' },
  { id: 3, name: '薯条(大)', price: 15.00, image: 'https://fakeimg.pl/200x200/0000ff/fff?text=Fries' },
  { id: 4, name: '可口可乐', price: 8.00, image: 'https://fakeimg.pl/200x200/ffff00/000?text=Coke' },
])

const categories = ref([
  { id: 1, name: '汉堡', image: 'https://fakeimg.pl/100x100/ff0000/fff?text=Hamburger' },
  { id: 2, name: '炸鸡', image: 'https://fakeimg.pl/100x100/00ff00/fff?text=Fried+Chicken' },
  { id: 3, name: '小食', image: 'https://fakeimg.pl/100x100/0000ff/fff?text=Snacks' },
  { id: 4, name: '饮品', image: 'https://fakeimg.pl/100x100/ffff00/000?text=Drinks' },
  { id: 5, name: '甜点', image: 'https://fakeimg.pl/100x100/ff00ff/fff?text=Desserts' },
  { id: 6, name: '套餐', image: 'https://fakeimg.pl/100x100/00ffff/fff?text=Combos' },
])

const handleSearch = () => {
  console.log('搜索内容:', searchQuery.value)
  // TODO: Implement actual search functionality, perhaps navigate to menu page with search query
}

const addToCart = (dish) => {
  cartStore.addItem(dish)
  console.log(`${dish.name} 已加入购物车`) 
}

const goToMenu = (categoryName) => {
  console.log(`跳转到菜单页并筛选分类: ${categoryName}`)
  router.push({ path: '/customer/menu', query: { category: categoryName } })
}
</script>

<style scoped lang="scss">
.home-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;
  }

  .promotion-carousel {
    margin-bottom: 30px;
    border-radius: 8px;
    overflow: hidden;

    .carousel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .section-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
    border-left: 5px solid #409EFF;
    padding-left: 10px;
  }

  .dish-list, .category-list {
    margin-bottom: 30px;
  }

  .dish-card, .category-card {
    margin-bottom: 20px;
    border-radius: 8px;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-5px);
      transition: all 0.3s ease;
    }

    img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: 8px 8px 0 0;
    }
  }

  .dish-info {
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .dish-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .dish-price {
      font-size: 16px;
      color: #F56C6C;
      margin-bottom: 10px;
    }
  }

  .category-card {
    text-align: center;
    
    .category-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 10px;
      border: 2px solid #eee;
    }

    .category-name {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style> 