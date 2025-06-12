const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// 获取仪表盘统计数据 (管理员和商家)
router.get('/dashboard', verifyToken, authorizeRoles('admin', 'merchant'), getDashboardStats);

module.exports = router; 