<template>
  <div class="menu-item" @click="$emit('click')">
    <div class="item-image">
      <el-image
        :src="item.image"
        fit="cover"
        loading="lazy"
      >
        <template #error>
          <div class="image-error">
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
        
        <div class="item-actions" @click.stop>
          <template v-if="quantity > 0">
            <el-button
              type="primary"
              circle
              size="small"
              @click="$emit('decrease')"
            >
              <el-icon><Minus /></el-icon>
            </el-button>
            <span class="quantity">{{ quantity }}</span>
          </template>
          <el-button
            type="primary"
            :icon="Plus"
            circle
            size="small"
            @click="$emit('add')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Picture, Plus, Minus } from '@element-plus/icons-vue'

defineProps({
  item: {
    type: Object,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  }
})

defineEmits(['click', 'add', 'decrease'])
</script>

<style scoped>
.menu-item {
  background: white;
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
  position: relative;
}

.item-image :deep(.el-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-item:hover .item-image :deep(.el-image) {
  transform: scale(1.05);
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 2rem;
}

.item-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  height: 2.8em;
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
  margin-top: 0.5rem;
}

.item-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.price {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--el-color-danger);
}

.original-price {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
  text-decoration: line-through;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 500;
}

.item-actions .el-button {
  padding: 0.4rem;
}

.item-actions .el-button:hover {
  background-color: var(--el-color-danger-dark-2);
  border-color: var(--el-color-danger-dark-2);
}
</style> 