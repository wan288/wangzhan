const path = require('path');
const dotenv = require('dotenv'); // Removed temporarily for debug
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Dish = require('./models/Dish');
const User = require('./models/User');
const Order = require('./models/Order'); // Import Order model
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs'); // Import bcryptjs

dotenv.config({ path: path.resolve(__dirname, '.env') }); // Load .env from backend/ directory
const MONGO_URI = process.env.MONGO_URI; // Use MONGO_URI from .env

console.log('[Seeder] Using MONGO_URI from .env:', MONGO_URI); // DEBUG

connectDB(MONGO_URI); // Pass MONGO_URI to connectDB

const seedData = async () => {
  try {
    // 清空现有数据 (可选，如果每次运行都想重新填充)
    await Category.deleteMany();
    await Dish.deleteMany();
    await Order.deleteMany(); // Clear existing orders
    await User.deleteMany({}); // Clear existing users

    // 创建分类
    const categories = await Category.insertMany([
      { name: '主菜' },
      { name: '素菜' },
      { name: '汤品' },
      { name: '饮品' },
      { name: '甜点' },
    ]);

    console.log('Categories seeded!');

    // 根据创建的分类获取它们的ID
    const mainDishCategory = categories.find(cat => cat.name === '主菜')._id;
    const vegDishCategory = categories.find(cat => cat.name === '素菜')._id;
    const soupCategory = categories.find(cat => cat.name === '汤品')._id; // Added soup category
    const drinkCategory = categories.find(cat => cat.name === '饮品')._id;
    const dessertCategory = categories.find(cat => cat.name === '甜点')._id; // Added dessert category

    // 创建菜品
    const dishes = await Dish.insertMany([
      { name: '红烧肉', description: '经典本帮菜，肥而不腻', price: 58, categoryId: mainDishCategory, image: '/images/original_chicken.jpg' },
      { name: '糖醋里脊', description: '酸甜可口，老少皆宜', price: 48, categoryId: mainDishCategory, image: '/images/wings.jpg' },
      { name: '蒜蓉西兰花', description: '清淡健康，蒜香浓郁', price: 28, categoryId: vegDishCategory, image: '/images/fries.jpg' },
      { name: '西红柿鸡蛋汤', description: '家常汤品，开胃解腻', price: 22, categoryId: soupCategory, image: '/images/soup.jpg' },
      { name: '可口可乐', description: '冰镇更爽口', price: 8, categoryId: drinkCategory, image: '/images/coke.jpg' },
      { name: '冰淇淋', description: '香甜冰爽', price: 15, categoryId: dessertCategory, image: '/images/ice_cream.jpg' },
    ]);

    console.log('Dishes seeded!');

    // 创建用户（如果用户数据已被清空或不存在）
    // 确保管理员用户存在，密码为 123456
    const adminUserExists = await User.findOne({ username: 'admin' });
    if (!adminUserExists) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: '123456', // 直接传递明文密码，让模型钩子处理哈希
        role: 'admin',
      });
      console.log('Admin user seeded!');
    }

    // 创建一些模拟用户
    const customerUserExists = await User.findOne({ username: 'customer' });
    if (!customerUserExists) {
      await User.create({
        username: 'customer',
        email: 'customer@example.com',
        password: 'password123', // 直接传递明文密码，让模型钩子处理哈希
        role: 'customer',
      });
      console.log('Customer user seeded!');
    }

    // 获取一些菜品用于创建订单
    const dish1 = dishes.find(d => d.name === '红烧肉');
    const dish2 = dishes.find(d => d.name === '糖醋里脊');
    const dish3 = dishes.find(d => d.name === '可口可乐');

    // 创建模拟订单
    const orders = await Order.insertMany([
      {
        user: (await User.findOne({ username: 'customer' }))._id,
        items: [
          { dish: dish1._id, name: dish1.name, price: dish1.price, quantity: 1, image: dish1.image },
          { dish: dish3._id, name: dish3.name, price: dish3.price, quantity: 2, image: dish3.image },
        ],
        totalAmount: dish1.price * 1 + dish3.price * 2,
        deliveryInfo: {
          name: '张三',
          phone: '13812345678',
          address: '北京市朝阳区望京SOHO',
          notes: '尽快送达',
          city: '北京',
          postalCode: '100000',
          country: '中国'
        },
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'wechatpay',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 3)), // 3天前
      },
      {
        user: (await User.findOne({ username: 'customer' }))._id,
        items: [
          { dish: dish2._id, name: dish2.name, price: dish2.price, quantity: 1, image: dish2.image },
          { dish: dish3._id, name: dish3.name, price: dish3.price, quantity: 2, image: dish3.image },
        ],
        totalAmount: dish2.price * 1 + dish3.price * 2,
        deliveryInfo: {
          name: '李四',
          phone: '13987654321',
          address: '上海市浦东新区陆家嘴',
          notes: '请勿打扰',
          city: '上海',
          postalCode: '200000',
          country: '中国'
        },
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'alipay',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)), // 1天前
      },
      {
        user: (await User.findOne({ username: 'customer' }))._id,
        items: [
          { dish: dish1._id, name: dish1.name, price: dish1.price, quantity: 2, image: dish1.image },
        ],
        totalAmount: dish1.price * 2,
        deliveryInfo: {
          name: '王五',
          phone: '13700001111',
          address: '广州市天河区珠江新城',
          notes: '无',
          city: '广州',
          postalCode: '510000',
          country: '中国'
        },
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        createdAt: new Date(), // 今天
      },
    ]);
    console.log('Orders seeded!');

    console.log('Data seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();