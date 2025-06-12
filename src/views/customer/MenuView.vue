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
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.category-nav {
  margin-bottom: 0;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 1rem;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 0;
  justify-content: center;
}

.category-btn {
  flex-shrink: 0;
  font-size: 1rem;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.category-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category-btn.el-button--primary {
  background-color: var(--kfc-red);
  border-color: var(--kfc-red);
  color: white;
}

.category-btn.el-button--default {
  background-color: var(--el-fill-color-lighter);
  color: var(--el-text-color-regular);
}

.search-bar {
  margin-bottom: 1rem;
}

.menu-content {
  min-height: 500px;
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.category-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.category-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background-color: var(--kfc-red);
  border-radius: 2px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  justify-content: center;
}

.menu-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.item-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.el-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-item:hover .el-image {
  transform: scale(1.05);
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 3rem;
}

.item-info {
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.item-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-description {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  height: 3.6em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin-bottom: 1rem;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.item-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.price {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--kfc-red);
}

.original-price {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
  text-decoration: line-through;
}

.item-actions .el-button {
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  background-color: var(--kfc-red);
  border-color: var(--kfc-red);
}

.item-actions .el-button:hover {
  background-color: #e03f2a;
  border-color: #e03f2a;
}

.el-empty {
  margin-top: 3rem;
}

@media (max-width: 768px) {
  .menu-page {
    padding: 1rem;
  }
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  .item-image {
    height: 180px;
  }
  .item-name {
    font-size: 1.2rem;
  }
  .item-description {
    font-size: 0.85rem;
  }
  .price {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
  .item-image {
    height: 220px;
  }
}
</style> 