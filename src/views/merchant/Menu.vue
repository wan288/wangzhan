<template>
  <div class="menu-mgr-container">
    <el-card class="box-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>菜品管理</span>
          <div>
            <el-button type="primary" :icon="Plus" @click="openDishDialog('add')">添加菜品</el-button>
            <el-button :icon="FolderAdd" @click="showCategoryDialog = true">分类管理</el-button>
          </div>
        </div>
      </template>

      <div class="search-filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索菜品名称"
          clearable
          style="width: 200px; margin-right: 10px;"
          @keyup.enter="fetchDishList"
        ></el-input>
        <el-select v-model="selectedCategory" placeholder="选择分类" clearable style="width: 150px; margin-right: 10px;" @change="fetchDishList">
          <el-option
            v-for="category in categories"
            :key="category._id"
            :label="category.name"
            :value="category.name"
          ></el-option>
        </el-select>
        <el-select v-model="selectedStatus" placeholder="选择状态" clearable style="width: 120px;" @change="fetchDishList">
          <el-option label="上架" :value="1"></el-option>
          <el-option label="下架" :value="0"></el-option>
        </el-select>
        <el-button :icon="Search" style="margin-left: 10px;" @click="fetchDishList">搜索</el-button>
      </div>

      <el-table :data="paginatedDishes" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 0 50px;">
              <p><b>菜品描述:</b> {{ props.row.description }}</p>
              <p><b>图片:</b> <img :src="props.row.image" alt="Dish Image" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;" /></p>
              <p v-if="props.row.originalPrice"><b>原价:</b> ¥{{ props.row.originalPrice.toFixed(2) }}</p>
              <p><b>是否特色菜品:</b> {{ props.row.featured ? '是' : '否' }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="菜品名称" width="180"></el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="scope">
            {{ scope.row.categoryId ? scope.row.categoryId.name : '未分类' }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">¥{{ scope.row.price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100"></el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="updateDishStatus(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button link type="primary" size="small" :icon="Edit" @click="openDishDialog('edit', scope.row)">编辑</el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="deleteDish(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredDishes.length"
        background
        style="margin-top: 20px; text-align: right;"
      ></el-pagination>
      
      <el-empty v-if="!loading && filteredDishes.length === 0" description="暂无菜品数据"></el-empty>
    </el-card>

    <!-- 添加/编辑菜品对话框 -->
    <el-dialog
      v-model="showDishDialog"
      :title="dishDialogType === 'add' ? '添加菜品' : '编辑菜品'"
      width="600px"
      :before-close="handleCloseDishDialog"
    >
      <el-form :model="currentDish" :rules="dishFormRules" ref="dishFormRef" label-width="100px">
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="currentDish.name" placeholder="请输入菜品名称"></el-input>
        </el-form-item>
        <el-form-item label="菜品分类" prop="categoryId">
          <el-select v-model="currentDish.categoryId" placeholder="请选择菜品分类" style="width: 100%;">
            <el-option
              v-for="category in categories.filter(c => c._id !== null)"
              :key="category._id"
              :label="category.name"
              :value="category._id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="currentDish.price" :min="0.01" :precision="2" :step="0.01" controls-position="right" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="currentDish.originalPrice" :min="0" :precision="2" :step="0.01" controls-position="right" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="currentDish.description" placeholder="请输入菜品描述"></el-input>
        </el-form-item>
        <el-form-item label="菜品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
            action="/api/upload"
            name="image"
          >
            <img v-if="currentDish.image" :src="currentDish.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="特色菜品" prop="featured">
          <el-switch v-model="currentDish.featured"></el-switch>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="currentDish.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDishDialog">取消</el-button>
          <el-button type="primary" @click="submitDishForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分类管理对话框 -->
    <el-dialog
      v-model="showCategoryDialog"
      title="分类管理"
      width="400px"
      :before-close="handleCloseCategoryDialog"
    >
      <el-form :model="newCategoryForm" :rules="categoryFormRules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="newCategoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addCategory">添加</el-button>
        </el-form-item>
      </el-form>

      <el-divider>现有分类</el-divider>
      <el-table :data="categories.filter(c => c._id !== null)" style="width: 100%">
        <el-table-column prop="name" label="分类名称"></el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button link type="danger" size="small" :icon="Delete" @click="deleteCategory(scope.row._id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseCategoryDialog">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, FolderAdd, Search, Edit, Delete } from '@element-plus/icons-vue'
import { getDishList, getCategoryList, createDish, updateDish, deleteDish, updateDishStatus, createCategory, deleteCategory, uploadDishImage } from '@/api/menu' // 引入API函数

const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref(null)
const dishes = ref([])
const categories = ref([]) // Initialize as empty, will fetch from backend

const showDishDialog = ref(false)
const dishDialogType = ref('add') // 'add' or 'edit'
const currentDish = reactive({
  _id: null, // Change from id to _id for consistency with backend
  name: '',
  categoryId: null, // Changed from 'category' to 'categoryId'
  price: 0.01,
  originalPrice: null, // Added originalPrice as per backend model
  description: '',
  image: '',
  featured: false, // Added featured as per backend model
  status: 1, // 1: 上架, 0: 下架
  sales: 0 // 模拟销量, may remove later if not part of creation
})
const dishFormRef = ref(null)
const dishFormRules = {
  name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择菜品分类', trigger: 'change' }], // Changed from 'category' to 'categoryId'
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  description: [{ required: true, message: '请输入菜品描述', trigger: 'blur' }],
  image: [{ required: true, message: '请上传菜品图片', trigger: 'change' }],
}

const showCategoryDialog = ref(false)
const newCategoryForm = reactive({
  name: ''
})
const categoryFormRef = ref(null)
const categoryFormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

const filteredDishes = computed(() => {
  let result = dishes.value
  if (searchQuery.value) {
    result = result.filter(dish => dish.name.includes(searchQuery.value))
  }
  // Filter by category ID if selectedCategory is actually a category ID
  // Current 'selectedCategory' holds category name, need to map it to ID or change how it works
  if (selectedCategory.value && selectedCategory.value !== '全部') {
    const selectedCatObj = categories.value.find(c => c.name === selectedCategory.value);
    if (selectedCatObj) {
      result = result.filter(dish => dish.categoryId._id === selectedCatObj._id); // Assuming categoryId is populated object
    }
  } else if (selectedCategory.value === '全部') {
    // No filtering by category if '全部' is selected
  }
  if (selectedStatus.value !== null) {
    result = result.filter(dish => dish.status === selectedStatus.value)
  }
  return result
})

const paginatedDishes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDishes.value.slice(start, end)
})

const fetchCategoryList = async () => {
  try {
    const response = await getCategoryList();
    // Assuming backend returns categories with _id and name
    categories.value = [{ _id: null, name: '全部' }, ...response.data]; // Add '全部' option, use _id
  } catch (error) {
    ElMessage.error('获取分类失败: ' + (error.response?.data?.message || error.message));
    console.error('获取分类失败:', error);
  }
};

const fetchDishList = async () => {
  loading.value = true
  try {
    const params = {
      name: searchQuery.value,
      status: selectedStatus.value
    };
    // If selectedCategory is not '全部', find its _id and pass it
    if (selectedCategory.value && selectedCategory.value !== '全部') {
      const selectedCatObj = categories.value.find(c => c.name === selectedCategory.value);
      if (selectedCatObj) {
        params.categoryId = selectedCatObj._id;
      }
    } else {
      // If '全部' is selected, clear categoryId from params
      delete params.categoryId;
    }

    // Using the getDishList API from src/api/menu.js
    const response = await getDishList(params);
    dishes.value = response.data; // Assuming response.data is an array of dishes
  } catch (error) {
    ElMessage.error('获取菜品列表失败: ' + (error.response?.data?.message || error.message));
    console.error('获取菜品列表失败:', error);
  } finally {
    loading.value = false
  }
}

// Dialog control
const openDishDialog = (type, dish = {}) => {
  dishDialogType.value = type;
  if (type === 'add') {
    // Reset form for adding
    Object.assign(currentDish, {
      _id: null,
      name: '',
      categoryId: null, // Reset categoryId
      price: 0.01,
      originalPrice: null,
      description: '',
      image: '',
      featured: false,
      status: 1,
      sales: 0
    });
  } else {
    // Populate form for editing
    Object.assign(currentDish, {
      _id: dish._id,
      name: dish.name,
      categoryId: dish.categoryId._id || dish.categoryId, // Ensure it's the ID (if populated) or just the ID
      price: dish.price,
      originalPrice: dish.originalPrice,
      description: dish.description,
      image: dish.image,
      featured: dish.featured,
      status: dish.status,
      sales: dish.sales
    });
  }
  showDishDialog.value = true;
  nextTick(() => {
    dishFormRef.value?.clearValidate(); // Clear validation errors
  });
};

const handleCloseDishDialog = () => {
  showDishDialog.value = false;
  dishFormRef.value?.resetFields(); // Reset form fields
};

const submitDishForm = async () => {
  if (!dishFormRef.value) return;

  await dishFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true; // Set loading state
      try {
        if (dishDialogType.value === 'add') {
          // Call createDish API
          // Ensure currentDish properties match backend expected format
          const dishData = { ...currentDish };
          delete dishData._id; // _id should not be sent for creation
          delete dishData.sales; // sales is not typically sent on creation
          await createDish(dishData);
          ElMessage.success('菜品添加成功！');
        } else {
          // Call updateDish API
          await updateDish(currentDish._id, currentDish);
          ElMessage.success('菜品更新成功！');
        }
        await fetchDishList(); // Refresh the list
        handleCloseDishDialog(); // Close dialog
      } catch (error) {
        ElMessage.error('操作失败: ' + (error.response?.data?.message || error.message));
        console.error('菜品操作失败:', error);
      } finally {
        loading.value = false; // Reset loading state
      }
    }
  });
};

// Image Upload Handlers
const handleImageSuccess = (response, file) => {
  // Assuming response contains the URL of the uploaded image
  if (response.url) {
    currentDish.image = response.url;
    ElMessage.success('图片上传成功！');
  } else {
    ElMessage.error('图片上传失败，请重试！');
  }
};

const beforeImageUpload = (rawFile) => {
  const isJPG = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png';
  const isLt2M = rawFile.size / 1024 / 1024 < 2; // 2MB

  if (!isJPG) {
    ElMessage.error('图片只能是 JPG/PNG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
};


// Category Management Dialog Handlers
const handleCloseCategoryDialog = () => {
  showCategoryDialog.value = false;
  nextTick(() => {
    categoryFormRef.value?.resetFields();
  });
};

const addCategory = async () => {
  if (!categoryFormRef.value) return;
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await createCategory(newCategoryForm);
        ElMessage.success('分类添加成功！');
        await fetchCategoryList(); // Refresh categories
        newCategoryForm.name = ''; // Clear form
      } catch (error) {
        ElMessage.error('分类添加失败: ' + (error.response?.data?.message || error.message));
        console.error('分类添加失败:', error);
      }
    } else {
      ElMessage.warning('请填写分类名称！');
    }
  });
};

const deleteCategory = async (id) => {
  ElMessageBox.confirm('确定删除此分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteCategory(id);
        ElMessage.success('分类删除成功！');
        await fetchCategoryList(); // Refresh categories
        await fetchDishList(); // Also refresh dishes in case some were in this category
      } catch (error) {
        ElMessage.error('分类删除失败: ' + (error.response?.data?.message || error.message));
        console.error('分类删除失败:', error);
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

// Update Dish Status (from switch)
const updateDishStatus = async (row) => {
  try {
    await updateDish(row._id, { status: row.status }); // Use _id from backend
    ElMessage.success('菜品状态更新成功！');
  } catch (error) {
    ElMessage.error('菜品状态更新失败: ' + (error.response?.data?.message || error.message));
    console.error('菜品状态更新失败:', error);
    // If update fails, revert the switch state
    row.status = row.status === 1 ? 0 : 1; // Revert switch state on failure
  }
};

// Initial data fetch on component mount
onMounted(async () => {
  await fetchCategoryList();
  await fetchDishList();
});

// Pagination Handlers
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // Reset to first page
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const deleteDish = (id) => {
  ElMessageBox.confirm('确定要删除此菜品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    dishes.value = dishes.value.filter(dish => dish._id !== id)
    ElMessage.success('菜品删除成功!')
    fetchDishList() // Refresh list after deletion
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style scoped lang="scss">
.menu-mgr-container {
  padding: 20px;
  background-color: #f0f2f5;

  .box-card {
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .search-filter-bar {
    margin-bottom: 20px;
  }

  .avatar-uploader .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style> 