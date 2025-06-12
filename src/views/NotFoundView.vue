<template>
  <div class="not-found-page">
    <el-empty description="404 页面未找到">
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </el-empty>
  </div>
</template>

<script setup>
// 可以根据需要添加逻辑，例如记录错误或提供其他导航选项
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px); /* 减去导航栏的高度 */
  background-color: #f0f2f5;
}
</style> 