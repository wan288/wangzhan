<script setup>
import { ElConfigProvider } from 'element-plus'
</script>

<template>
  <el-config-provider style="flex: 1; display: flex; flex-direction: column; width: 100% !important; height: 100% !important;">
    <router-view style="flex: 1; width: 100%;" />
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
  display: flex; /* Make them flex containers */
  flex-direction: column; /* Stack content vertically */
  min-width: 100vw; /* Ensure it takes full viewport width */
  min-height: 100vh; /* Ensure it takes full viewport height */
  /* overflow: hidden; */ /* Prevent body scrolling if layout is full height */
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

/* Removed .container as it's not used in merchant layout and might cause max-width issues */
</style>