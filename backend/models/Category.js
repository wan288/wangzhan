const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '请填写分类名称'],
      unique: true,
      trim: true,
      maxLength: [50, '分类名称不能超过50个字符'],
    },
    image: {
      type: String,
      default: '/images/default-category.png',
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 