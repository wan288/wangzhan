<template>
  <div class="profile-page">
    <div class="container">
      <h1 class="page-title">个人资料</h1>

      <el-card class="profile-card">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <el-tab-pane label="基本信息" name="info">
            <el-form
              :model="profileForm"
              label-width="100px"
              class="profile-form"
              v-loading="userStore.loading"
            >
              <el-form-item label="头像">
                <el-upload
                  class="avatar-uploader"
                  action="/api/upload/single"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  name="image"
                >
                  <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" disabled />
              </el-form-item>
              <el-form-item label="注册日期">
                <el-input :value="new Date(profileForm.createdAt).toLocaleDateString()" disabled />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateProfile" :loading="userStore.loading">
                  更新资料
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="修改密码" name="password">
            <el-form
              :model="passwordForm"
              label-width="100px"
              class="password-form"
              v-loading="userStore.loading"
            >
              <el-form-item label="旧密码">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="passwordForm.newPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePassword" :loading="userStore.loading">
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const activeTab = ref('info')

const profileForm = ref({
  username: '',
  email: '',
  avatar: '',
  createdAt: '',
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Computed property for upload headers
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

// 监听 userInfo 变化以更新表单
watch(() => userStore.userInfo, (newVal) => {
  if (newVal) {
    profileForm.value.username = newVal.username || '';
    profileForm.value.email = newVal.email || '';
    profileForm.value.avatar = newVal.avatar || '';
    profileForm.value.createdAt = newVal.createdAt || '';
  }
}, { immediate: true })

// 更新个人资料
async function updateProfile() {
  try {
    const success = await userStore.updateUserProfile({
      username: profileForm.value.username,
      avatar: profileForm.value.avatar,
    })
    if (success) {
      ElMessage.success('个人资料更新成功')
    } else {
      ElMessage.error(userStore.error || '更新失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('更新个人资料失败')
  }
}

// 修改密码
async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.error('新密码长度不能少于6位')
    return
  }

  try {
    const success = await userStore.changeUserPassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword
    )
    if (success) {
      ElMessage.success('密码修改成功')
      passwordForm.value.oldPassword = ''
      passwordForm.value.newPassword = ''
      passwordForm.value.confirmPassword = ''
    } else {
      ElMessage.error(userStore.error || '修改密码失败')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('修改密码失败')
  }
}

// 头像上传成功回调
function handleAvatarSuccess(response, file) {
  // 假设后端返回的图片URL在 response.url (因为我们后端统一返回 url)
  if (response.url) {
    profileForm.value.avatar = response.url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败: 未获取到图片URL')
  }
}

// 头像上传前校验
function beforeAvatarUpload(rawFile) {
  const isJPGPNG = rawFile.type === 'image/jpeg' || rawFile.type === 'image/png'
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isJPGPNG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }
  return isJPGPNG && isLt2M
}

onMounted(() => {
  if (userStore.isAuthenticated && !userStore.userInfo.username) {
    userStore.fetchUserInfo()
  }
})
</script>

<style scoped>
.profile-page {
  padding: 2rem 0;
}

.page-title {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 2rem;
  text-align: center;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.profile-tabs .el-tabs__content {
  padding: 2rem;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px;
  height: 100px;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c9399;
  width: 100px;
  height: 100px;
  text-align: center;
}

.profile-form, .password-form {
  max-width: 500px;
  margin: 0 auto;
}
</style> 