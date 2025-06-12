<template>
  <div class="profile-page">
    <div class="container">
      <h1 class="page-title">个人资料</h1>

      <el-card class="profile-card" shadow="hover">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <el-tab-pane label="基本信息" name="info">
            <el-form
              :model="profileForm"
              label-width="80px"
              class="profile-form"
              v-loading="userStore.loading"
              label-position="left"
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
                <el-input v-model="profileForm.username" placeholder="请输入用户名" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" disabled placeholder="用户邮箱" />
              </el-form-item>
              <el-form-item label="注册日期">
                <el-input :value="new Date(profileForm.createdAt).toLocaleDateString()" disabled placeholder="注册日期" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateProfile" :loading="userStore.loading" size="large">
                  更新资料
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="修改密码" name="password">
            <el-form
              :model="passwordForm"
              label-width="80px"
              class="password-form"
              v-loading="userStore.loading"
              label-position="left"
            >
              <el-form-item label="旧密码">
                <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请确认新密码" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePassword" :loading="userStore.loading" size="large">
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
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  color: var(--el-text-color-primary);
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background-color: var(--kfc-red);
  border-radius: 2px;
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.profile-tabs .el-tabs__header {
  margin-bottom: 1.5rem;
}

.profile-tabs .el-tabs__item {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--el-text-color-regular);
}

.profile-tabs .el-tabs__item.is-active {
  color: var(--kfc-red);
}

.profile-tabs .el-tabs__active-bar {
  background-color: var(--kfc-red);
}

.profile-tabs .el-tabs__content {
  padding: 1.5rem 0;
}

.profile-form, .password-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 1rem;
}

.profile-form .el-form-item,
.password-form .el-form-item {
  margin-bottom: 1.5rem;
}

.profile-form .el-input.is-disabled .el-input__inner {
  color: var(--el-text-color-regular);
  -webkit-text-fill-color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
}

.avatar-uploader .avatar {
  width: 120px; /* Larger avatar */
  height: 120px; /* Larger avatar */
  display: block;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.avatar-uploader .el-upload {
  border: 2px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 120px; /* Match avatar size */
  height: 120px; /* Match avatar size */
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader .el-upload:hover {
  border-color: var(--kfc-red);
  background-color: var(--el-color-primary-light-9); /* Light background on hover */
}

.el-icon.avatar-uploader-icon {
  font-size: 32px; /* Larger icon */
  color: var(--el-text-color-secondary);
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-button--primary {
  background-color: var(--kfc-red);
  border-color: var(--kfc-red);
}

.el-button--primary:hover {
  background-color: #e03f2a;
  border-color: #e03f2a;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  .page-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  .profile-form, .password-form {
    padding: 0;
  }
}
</style> 