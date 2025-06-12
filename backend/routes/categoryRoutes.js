const express = require('express');
const { getCategories } = require('../controllers/categoryController');

const router = express.Router();

// @desc    获取所有分类
// @route   GET /api/categories
// @access  Public
router.get('/', getCategories);

module.exports = router; 