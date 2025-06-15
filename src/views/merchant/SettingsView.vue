<template>
    <div style="padding: 2rem; max-width: 700px;">
      <el-card>
        <el-tabs tab-position="left">
          <el-tab-pane label="店铺信息">
            <el-form :model="storeInfo" label-width="120px">
              <el-form-item label="店铺名称">
                <el-input v-model="storeInfo.name" placeholder="请输入店铺名称" />
              </el-form-item>
              <el-form-item label="店铺地址">
                <el-input v-model="storeInfo.address" placeholder="请输入店铺地址" />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input v-model="storeInfo.phone" placeholder="请输入联系电话" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveStoreInfo">保存店铺信息</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  
  const storeInfo = ref({
    name: '',
    address: '',
    phone: ''
  })
  
  function saveStoreInfo() {
    ElMessage.success('店铺信息保存成功')
  }
  </script>