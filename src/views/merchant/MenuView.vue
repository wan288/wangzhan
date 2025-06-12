<template>
  <div class="merchant-menu-page">
    <h1 class="page-title">菜单管理</h1>

    <div class="menu-actions">
      <el-button type="primary" :icon="Plus" @click="openAddDialog">添加新菜品</el-button>
      <el-input
        v-model="searchQuery"
        placeholder="搜索菜品..."
        prefix-icon="Search"
        clearable
        @input="handleSearch"
        class="search-input"
      />
    </div>

    <el-table
      :data="filteredMenuItems"
      style="width: 100%"
      v-loading="loading"
      empty-text="暂无菜品"
    >
      <el-table-column label="图片" width="100">
        <template #default="scope">
          <el-image :src="scope.row.image" fit="cover" class="item-image">
            <template #error>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="名称" prop="name" width="180"></el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>
      <el-table-column label="价格" prop="price" width="100">
        <template #default="scope">
          ¥{{ scope.row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="原价" prop="originalPrice" width="100">
        <template #default="scope">
          <span v-if="scope.row.originalPrice">¥{{ scope.row.originalPrice.toFixed(2) }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120">
        <template #default="scope">
          {{ getCategoryName(scope.row.categoryId) }}
        </template>
      </el-table-column>
      <el-table-column label="特色" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.featured ? 'success' : 'info'">
            {{ scope.row.featured ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteItem(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑菜品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑菜品' : '添加新菜品'"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="currentMenuItem" label-width="100px">
        <el-form-item label="菜品名称">
          <el-input v-model="currentMenuItem.name" />
        </el-form-item>
        <el-form-item label="菜品描述">
          <el-input v-model="currentMenuItem.description" type="textarea" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="currentMenuItem.price" :min="0.01" :precision="2" />
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="currentMenuItem.originalPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="currentMenuItem.categoryId" placeholder="请选择分类">
            <el-option
              v-for="category in menuStore.categories"
              :key="category._id"
              :label="category.name"
              :value="category._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="特色菜">
          <el-switch v-model="currentMenuItem.featured" />
        </el-form-item>
        <el-form-item label="菜品图片">
          <el-upload
            class="image-uploader"
            action="/api/upload/single"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
            name="image"
          >
            <img v-if="currentMenuItem.image" :src="currentMenuItem.image" class="menu-item-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMenuItem" :loading="saving">
            {{ isEditMode ? '保存' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { useUserStore } from '@/stores/user'
import { Plus, Search, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const menuStore = useMenuStore()
const userStore = useUserStore()

// 状态
const searchQuery = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const currentMenuItem = ref({
  _id: null,
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  categoryId: null,
  featured: false,
  image: ''
})

// Computed property for upload headers
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

// 计算属性
const menuItems = computed(() => menuStore.menuItems)
const categories = computed(() => menuStore.categories)

const filteredMenuItems = computed(() => {
  if (!searchQuery.value) {
    return menuItems.value
  }
  const query = searchQuery.value.toLowerCase()
  return menuItems.value.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  )
})

// 方法
function getCategoryName(categoryId) {
  const category = categories.value.find((c) => c._id === categoryId)
  return category ? category.name : '未知分类'
}

function handleSearch() {
  // 可以添加防抖逻辑
}

function openAddDialog() {
  isEditMode.value = false
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(item) {
  isEditMode.value = true
  currentMenuItem.value = { ...item }
  dialogVisible.value = true
}

async function saveMenuItem() {
  saving.value = true
  try {
    if (isEditMode.value) {
      await menuStore.updateMenuItem(currentMenuItem.value._id, currentMenuItem.value)
      ElMessage.success('菜品更新成功')
    } else {
      await menuStore.addMenuItem(currentMenuItem.value)
      ElMessage.success('菜品添加成功')
    }
    dialogVisible.value = false
    await menuStore.fetchMenuItems()
  } catch (err) {
    ElMessage.error(menuStore.error || '操作失败')
  } finally {
    saving.value = false
  }
}

async function deleteItem(item) {
  ElMessageBox.confirm(`确定要删除菜品 "${item.name}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      saving.value = true
      try {
        await menuStore.deleteMenuItem(item._id)
        ElMessage.success('菜品删除成功')
      } catch (err) {
        ElMessage.error(menuStore.error || '删除失败')
      } finally {
        saving.value = false
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

function resetForm() {
  currentMenuItem.value = {
    _id: null,
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    categoryId: null,
    featured: false,
    image: ''
  }
}

function handleImageSuccess(response, file) {
  if (response.url) {
    currentMenuItem.value.image = response.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败: 未获取到图片URL')
  }
}

function beforeImageUpload(rawFile) {
  const isJPGPNG = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png'
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isJPGPNG) {
    ElMessage.error('图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  return isJPGPNG && isLt2M
}

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      menuStore.fetchCategories(),
      menuStore.fetchMenuItems()
    ])
  } catch (err) {
    ElMessage.error(menuStore.error || '加载数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.merchant-menu-page {
  flex: 1; /* Make it fill available space in column */
  display: flex;
  flex-direction: column;
  padding: 2rem; /* Re-add padding here for page content */
  box-sizing: border-box; /* Include padding in element's total width and height */
}

.page-title {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 1.5rem;
}

.menu-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 300px;
}

.el-table {
  flex: 1; /* Make table fill remaining space */
  display: flex; /* Required for table to respect flex sizing */
  flex-direction: column;
}

.el-table :deep(.el-table__inner-wrapper) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.el-table :deep(.el-table__body-wrapper) {
  flex: 1;
  overflow-y: auto; /* Enable scrolling for table body */
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: var(--el-border-radius-small);
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #ccc;
  font-size: 2rem;
}

.image-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}

.menu-item-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
</style> 