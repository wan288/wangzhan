import request from '@/utils/request'

// 获取菜品列表
export function getDishList(params) {
  return request({
    url: '/',
    method: 'get',
    params
  })
}

// 获取菜品详情
export function getDishDetail(id) {
  return request({
    url: `/${id}`,
    method: 'get'
  })
}

// 创建菜品
export function createDish(data) {
  return request({
    url: '/',
    method: 'post',
    data
  })
}

// 更新菜品
export function updateDish(id, data) {
  return request({
    url: `/${id}`,
    method: 'put',
    data
  })
}

// 删除菜品
export function deleteDish(id) {
  return request({
    url: `/${id}`,
    method: 'delete'
  })
}

// 更新菜品状态
export function updateDishStatus(id, status) {
  return request({
    url: `/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 获取菜品分类列表
export function getCategoryList() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

// 创建菜品分类
export function createCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

// 更新菜品分类
export function updateCategory(id, data) {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  })
}

// 删除菜品分类
export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}

// 上传菜品图片
export function uploadDishImage(data) {
  return request({
    url: '/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 批量导入菜品
export function batchImportDishes(data) {
  return request({
    url: '/batch-import',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
} 