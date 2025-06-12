const express = require('express')
const { createOrder, getAllOrders, getMyOrders, getOrderById, updateOrderStatus, updateOrderPaymentStatus, deleteOrder, cancelOrder } = require('../controllers/orderController')
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()

// 客户侧订单路由
router.route('/')
  .post(verifyToken, authorizeRoles('customer'), createOrder) // 创建订单 (客户)

router.get('/myorders', verifyToken, authorizeRoles('customer'), getMyOrders) // 获取我的订单 (客户)

// 管理员/商家侧订单路由 - 获取单个订单详情和删除订单
router.route('/:id')
  .get(verifyToken, getOrderById) // 获取单个订单详情 (所有已认证用户)
  .delete(verifyToken, authorizeRoles('admin'), deleteOrder) // 删除订单 (管理员)

// 更新订单状态 (商家/管理员)
router.put('/:id/status', verifyToken, authorizeRoles('merchant', 'admin'), updateOrderStatus) // 更新订单状态 (商家/管理员)

// 取消订单 (客户)
router.patch('/:id/cancel', verifyToken, authorizeRoles('customer'), cancelOrder) // 取消订单 (客户)

router.put('/:id/paymentStatus', verifyToken, authorizeRoles('admin'), updateOrderPaymentStatus) // 更新订单支付状态 (管理员)

// 获取所有订单 (管理员/商家)
router.get('/', verifyToken, authorizeRoles('admin', 'merchant'), getAllOrders)

module.exports = router 