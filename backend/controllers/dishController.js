// This is a placeholder for dishController.js
// In a real application, this would interact with the database.

const Dish = require('../models/Dish');
const Category = require('../models/Category');

// @desc    获取所有菜品
// @route   GET /api/dishes
// @access  Public
exports.getDishes = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== '全部') {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      } else {
        return res.status(404).json({ code: 404, message: '分类未找到' });
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const dishes = await Dish.find(query).populate('categoryId');
    res.json({ code: 200, message: '获取菜品成功', data: dishes });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    获取单个菜品
// @route   GET /api/dishes/:id
// @access  Public
exports.getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('categoryId');
    if (dish) {
      res.json({ code: 200, message: '获取菜品成功', data: dish });
    } else {
      res.status(404).json({ code: 404, message: '菜品未找到' });
    }
  } catch (error) {
    console.error('Error fetching single dish:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    添加菜品
// @route   POST /api/dishes
// @access  Private (merchant/admin)
exports.createDish = async (req, res) => {
  try {
    const { name, description, price, originalPrice, categoryId, image, featured } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ code: 400, message: '菜品名称、价格和分类为必填项' });
    }

    const newDish = await Dish.create({
      name,
      description,
      price,
      originalPrice,
      categoryId,
      image,
      featured,
    });

    res.status(201).json({ code: 201, message: '菜品添加成功', data: newDish });
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    更新菜品
// @route   PUT /api/dishes/:id
// @access  Private (merchant/admin)
exports.updateDish = async (req, res) => {
  try {
    const { name, description, price, originalPrice, categoryId, image, featured } = req.body;

    const updatedDish = await Dish.findByIdAndUpdate(
      req.params.id,
      { name, description, price, originalPrice, categoryId, image, featured },
      { new: true, runValidators: true }
    );

    if (updatedDish) {
      res.json({ code: 200, message: '菜品更新成功', data: updatedDish });
    } else {
      res.status(404).json({ code: 404, message: '菜品未找到' });
    }
  } catch (error) {
    console.error('Error updating dish:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    删除菜品
// @route   DELETE /api/dishes/:id
// @access  Private (merchant/admin)
exports.deleteDish = async (req, res) => {
  try {
    const deletedDish = await Dish.findByIdAndDelete(req.params.id);

    if (deletedDish) {
      res.json({ code: 200, message: '菜品删除成功' });
    } else {
      res.status(404).json({ code: 404, message: '菜品未找到' });
    }
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    获取所有分类
// @route   GET /api/dishes/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({ code: 200, message: '获取分类成功', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    创建分类
// @route   POST /api/dishes/categories
// @access  Private (admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({ code: 400, message: '分类名称为必填项' });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ code: 400, message: '分类名称已存在' });
    }

    const newCategory = await Category.create({ name, image });
    res.status(201).json({ code: 201, message: '分类添加成功', data: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    更新分类
// @route   PUT /api/dishes/categories/:id
// @access  Private (admin)
exports.updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, image },
      { new: true, runValidators: true }
    );

    if (updatedCategory) {
      res.json({ code: 200, message: '分类更新成功', data: updatedCategory });
    } else {
      res.status(404).json({ code: 404, message: '分类未找到' });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    删除分类
// @route   DELETE /api/dishes/categories/:id
// @access  Private (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (deletedCategory) {
      res.json({ code: 200, message: '分类删除成功' });
    } else {
      res.status(404).json({ code: 404, message: '分类未找到' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
}; 