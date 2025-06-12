console.log('Loading authRoutes.js...'); // DEBUG: Confirm file loading

const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
// const authMiddleware = require('../middleware/authMiddleware') // Temporarily commented out for debug

// 用户登录
router.post('/login', authController.login)

// 获取当前用户信息 (需要认证) - Temporarily commented out for debug
// router.get('/me', authMiddleware.verifyToken, authController.getMe)

// 更新用户信息 (需要认证) - Temporarily commented out for debug
// router.put('/me', authMiddleware.verifyToken, authController.updateMe)

// 修改密码 (需要认证) - Temporarily commented out for debug
// router.post('/change-password', authMiddleware.verifyToken, authController.changePassword)

// 用户注册 (如果允许普通用户注册)
router.post('/register', authController.register)

module.exports = router 