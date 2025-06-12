const express = require('express');
const { upload, uploadSingleImage } = require('../controllers/uploadController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/upload/single
// @desc    上传单个图片文件
// @access  Private (所有已认证用户都可以上传，但在实际应用中可能需要更细粒度的权限控制，例如只有商家或管理员才能上传菜品图片，客户只能上传头像)
router.post('/single', verifyToken, upload.single('image'), uploadSingleImage);

module.exports = router; 