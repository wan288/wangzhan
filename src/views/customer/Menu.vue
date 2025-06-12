<template>
  <div class="menu-container">
    <el-row :gutter="20">
      <el-col :span="5" class="category-sidebar">
        <el-card shadow="hover" class="box-card">
          <template #header>
            <div class="card-header">
              <span>菜品分类</span>
            </div>
          </template>
          <el-menu
            :default-active="activeCategory"
            class="category-menu"
            @select="handleCategorySelect"
          >
            <el-menu-item
              v-for="category in categories"
              :key="category.id"
              :index="category.name"
            >
              {{ category.name }}
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="19" class="dish-list-area">
        <el-card shadow="hover" class="box-card">
          <template #header>
            <div class="card-header">
              <span>{{ activeCategory || '全部菜品' }}</span>
              <el-input
                v-model="searchQuery"
                placeholder="搜索菜品"
                clearable
                style="width: 200px;"
                @keyup.enter="filterDishes"
              >
                <template #append>
                  <el-button :icon="Search" @click="filterDishes"></el-button>
                </template>
              </el-input>
            </div>
          </template>
          <el-row :gutter="20" class="dish-items">
            <el-col :span="8" v-for="dish in filteredDishes" :key="dish.id">
              <el-card class="dish-card" shadow="hover">
                <img :src="dish.image" class="dish-image" alt="Dish Image" />
                <div class="dish-info">
                  <div class="dish-name">{{ dish.name }}</div>
                  <div class="dish-price">¥{{ dish.price.toFixed(2) }}</div>
                  <div class="dish-actions">
                    <el-button type="primary" :icon="Plus" circle @click="addToCart(dish)"></el-button>
                    <el-tag v-if="cartStore.getItemQuantity(dish.id) > 0" type="success" class="cart-quantity">{{ cartStore.getItemQuantity(dish.id) }}</el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-empty v-if="filteredDishes.length === 0" description="暂无菜品"></el-empty>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Plus } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const cartStore = useCartStore()

const searchQuery = ref('')
const activeCategory = ref('全部')

const categories = ref([
  { id: 0, name: '全部' },
  { id: 1, name: '汉堡' },
  { id: 2, name: '炸鸡' },
  { id: 3, name: '小食' },
  { id: 4, name: '饮品' },
  { id: 5, name: '甜点' },
  { id: 6, name: '套餐' }
])

const dishes = ref([
  { id: 1, name: '巨无霸汉堡', category: '汉堡', price: 25.00, image: 'https://fakeimg.pl/200x200/ff0000/fff?text=Burger' },
  { id: 2, name: '香辣鸡腿堡', category: '汉堡', price: 22.00, image: 'https://fakeimg.pl/200x200/00ff00/fff?text=Chicken' },
  { id: 3, name: '薯条(大)', category: '小食', price: 15.00, image: 'https://fakeimg.pl/200x200/0000ff/fff?text=Fries' },
  { id: 4, name: '可口可乐', category: '饮品', price: 8.00, image: 'https://fakeimg.pl/200x200/ffff00/000?text=Coke' },
  { id: 5, name: '奥尔良烤翅', category: '炸鸡', price: 18.00, image: 'https://fakeimg.pl/200x200/FF5733/fff?text=Wings' },
  { id: 6, name: '吮指原味鸡', category: '炸鸡', price: 12.00, image: 'https://fakeimg.pl/200x200/DAF7A6/000?text=OriginalChicken' },
  { id: 7, name: '圣代', category: '甜点', price: 10.00, image: 'https://fakeimg.pl/200x200/C70039/fff?text=Sundae' },
  { id: 8, name: '超值全家桶', category: '套餐', price: 89.00, image: 'https://fakeimg.pl/200x200/900C3F/fff?text=FamilyBucket' },
  { id: 9, name: '劲脆鸡腿堡', category: '汉堡', price: 23.00, image: 'https://fakeimg.pl/200x200/581845/fff?text=CrispyChicken' },
])

const filteredDishes = computed(() => {
  let result = dishes.value
  if (activeCategory.value !== '全部') {
    result = result.filter(dish => dish.category === activeCategory.value)
  }
  if (searchQuery.value) {
    result = result.filter(dish => dish.name.includes(searchQuery.value))
  }
  return result
})

const handleCategorySelect = (key) => {
  activeCategory.value = key
  searchQuery.value = '' // Clear search when category changes
}

const filterDishes = () => {
  // Trigger computed property re-evaluation
  // No explicit action needed here as computed property handles filtering
}

const addToCart = (dish) => {
  cartStore.addItem(dish)
  console.log(`${dish.name} 已加入购物车`) 
}

onMounted(() => {
  if (route.query.category) {
    activeCategory.value = route.query.category
  }
})
</script>

<style scoped lang="scss">
.menu-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .category-sidebar {
    .box-card {
      min-height: 500px;
    }
    .category-menu {
      border-right: none;
    }
  }

  .dish-list-area {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
    }

    .dish-items {
      .dish-card {
        margin-bottom: 20px;
        border-radius: 8px;
        
        img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 8px 8px 0 0;
        }

        .dish-info {
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;

          .dish-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .dish-price {
            font-size: 14px;
            color: #F56C6C;
            margin-bottom: 10px;
          }

          .dish-actions {
            display: flex;
            align-items: center;

            .cart-quantity {
              margin-left: 8px;
            }
          }
        }
      }
    }
  }
}
</style> 