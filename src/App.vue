<script setup>
import { ElConfigProvider } from 'element-plus'
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>

<style>
:root {
  --primary-color: #e4002b;
  --secondary-color: #f8b62b;
  --text-color: #333333;
  --background-color: #ffffff;
  --border-radius: 8px;
}

html, body, #app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevent body scrolling if layout is full height */
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--background-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>