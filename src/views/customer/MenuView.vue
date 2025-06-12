<template>
  <div class="menu-page">
    <div class="container">
      <!-- 分类导航 -->
      <div class="category-nav">
        <el-scrollbar>
          <div class="category-list">
            <el-button
              v-for="category in categories"
              :key="category._id"
              :type="selectedCategory === category._id ? 'primary' : 'default'"
              class="category-btn"
              @click="selectCategory(category._id)"
            >
              {{ category.name }}
            </el-button>
          </div>
        </el-scrollbar>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索菜品..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>

      <!-- 菜品列表 -->
      <div class="menu-content">
        <template v-if="loading">
          <div class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>
        </template>

        <template v-else-if="error">
          <el-empty description="加载失败,请稍后重试">
            <el-button type="primary" @click="fetchMenuItems">重试</el-button>
          </el-empty>
        </template>

        <template v-else>
          <!-- 分类标题 -->
          <h2 class="category-title" v-if="selectedCategory">
            {{ getCategoryName(selectedCategory) }}
          </h2>

          <!-- 菜品网格 -->
          <div class="menu-grid">
            <el-card
              v-for="item in filteredItems"
              :key="item._id"
              class="menu-item"
              :body-style="{ padding: '0px' }"
            >
              <div class="item-image">
                <el-image
                  :src="item.image"
                  fit="cover"
                  :preview-src-list="[item.image]"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>

              <div class="item-info">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                
                <div class="item-footer">
                  <div class="item-price">
                    <span class="price">¥{{ item.price }}</span>
                    <span class="original-price" v-if="item.originalPrice">
                      ¥{{ item.originalPrice }}
                    </span>
                  </div>

                  <div class="item-actions">
                    <el-button
                      type="primary"
                      :icon="ShoppingCart"
                      circle
                      @click="addToCart(item)"
                    />
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 空状态 -->
          <el-empty
            v-if="filteredItems.length === 0"
            description="没有找到相关菜品"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import { ShoppingCart, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const menuStore = useMenuStore()
const userStore = useUserStore()

// 状态
const selectedCategory = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const error = ref(null)

// 计算属性
const categories = computed(() => menuStore.categories)
const menuItems = computed(() => menuStore.menuItems)

const filteredItems = computed(() => {
  let items = menuItems.value

  // 按分类筛选
  if (selectedCategory.value) {
    items = items.filter(item => item.categoryId === selectedCategory.value)
  }

  // 按搜索词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }

  return items
})

// 方法
function selectCategory(categoryId) {
  selectedCategory.value = categoryId === selectedCategory.value ? null : categoryId
}

function getCategoryName(categoryId) {
  const category = categories.value.find(c => c._id === categoryId)
  return category ? category.name : ''
}

function handleSearch() {
  // 可以添加防抖逻辑
}

async function addToCart(item) {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  
  userStore.addToCart(item)
  ElMessage.success('已添加到购物车')
}

// 生命周期钩子
onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      menuStore.fetchCategories(),
      menuStore.fetchMenuItems()
    ])
  } catch (err) {
    error.value = '加载菜单失败'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.menu-page {
  padding: 2rem 0;
}

.category-nav {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.category-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  padding-bottom: 10px;
}

.category-btn {
  flex-shrink: 0;
}

.search-bar {
  margin-bottom: 2rem;
}

.menu-content {
  min-height: 500px; /* Ensure content area has min height */
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.category-title {
  font-size: 1.8rem;
  color: var(--el-color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;
}

.category-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: var(--kfc-red);
  border-radius: 2px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.menu-item {
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  transition: all 0.3s ease;
  overflow: hidden;
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--el-box-shadow-hover);
}

.item-image {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0; /* Placeholder background */
}

.el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #ccc;
  font-size: 3rem;
}

.item-info {
  padding: 1rem;
}

.item-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 0.5rem;
}

.item-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  height: 40px; /* Fixed height for description */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.item-price .price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--kfc-red);
}

.item-price .original-price {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
  margin-left: 0.5rem;
}

.item-actions .el-button {
  font-size: 1.2rem;
}

.el-empty {
  margin-top: 3rem;
}
</style> 