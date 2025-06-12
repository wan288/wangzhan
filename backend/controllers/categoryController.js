const Category = require('../models/Category');

// @desc    获取所有分类
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    console.log('[CategoryController] Fetching all categories...');
    const categories = await Category.find({});
    console.log('[CategoryController] Categories fetched:', categories);
    res.status(200).json({
      code: 200,
      message: '分类数据获取成功',
      data: categories
    });
  } catch (error) {
    console.error('[CategoryController] Error fetching categories:', error);
    res.status(500).json({ code: 500, message: '服务器错误，无法获取分类' });
  }
};

module.exports = {
  getCategories,
}; 