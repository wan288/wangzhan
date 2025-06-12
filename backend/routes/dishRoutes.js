const express = require('express')
const { getDishes, getDishById, createDish, updateDish, deleteDish, getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/dishController')
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()

// 菜品相关的路由
router.route('/')
  .get(getDishes) // 获取所有菜品 (公开)
  .post(verifyToken, authorizeRoles('merchant', 'admin'), createDish) // 创建菜品 (商家和管理员)

router.route('/:id')
  .get(getDishById) // 获取单个菜品 (公开)
  .put(verifyToken, authorizeRoles('merchant', 'admin'), updateDish) // 更新菜品 (商家和管理员)
  .delete(verifyToken, authorizeRoles('merchant', 'admin'), deleteDish) // 删除菜品 (商家和管理员)

// 菜品分类相关的路由
router.route('/categories')
  .get(getCategories) // 获取所有分类 (公开)
  .post(verifyToken, authorizeRoles('admin'), createCategory) // 创建分类 (管理员)

router.route('/categories/:id')
  .put(verifyToken, authorizeRoles('admin'), updateCategory) // 更新分类 (管理员)
  .delete(verifyToken, authorizeRoles('admin'), deleteCategory) // 删除分类 (管理员)

module.exports = router 