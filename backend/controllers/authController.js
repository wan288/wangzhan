console.log('Loading authController.js...'); // DEBUG: Confirm file loading

// const express = require('express'); // Removed: Express should not be required in controllers
// const User = require('../models/User'); // Temporarily commented out for debug
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// 生成 JWT Token
const generateToken = (id) => {
  console.log(`[authController] Generating token for user ID: ${id}`); // DEBUG: Log ID
  const token = jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { // 使用备用密钥
    expiresIn: '1h',
  });
  console.log(`[authController] Token generated: ${token ? 'YES' : 'NO'}`); // DEBUG: Confirm token generation
  return token;
};

// @desc    注册用户
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // 检查用户名是否已存在
    const userExistsByUsername = await User.findOne({ username });
    if (userExistsByUsername) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
      return res.status(400).json({ message: '邮箱已存在' });
    }

    // 对密码进行哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'customer',
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        // avatar: user.avatar, // Assuming no avatar for now
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: '无效的用户数据' });
    }
  } catch (error) {
    console.error('[authController] Register error:', error); // DEBUG: Log register errors
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    登录用户
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  console.log('[authController] login function entered.'); // DEBUG: Entry point
  try {
    console.log('[authController] Request body:', req.body); // DEBUG: Log request body
    const { identifier, password } = req.body;

    console.log(`[authController] Attempting to find user: ${identifier}`); // DEBUG: Before findOne
    // 根据用户名或邮箱查找用户
    let user;
    if (identifier.includes('@')) {
      user = await User.findOne({ email: identifier });
    } else {
      user = await User.findOne({ username: identifier });
    }

    console.log(`[authController] User found: ${user ? user.username : 'None'}`); // DEBUG: After findOne

    if (!user) {
      console.log('[authController] User not found.'); // DEBUG: User not found
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[authController] Comparing passwords...'); // DEBUG: Before bcrypt.compare
    // 比较密码
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(`[authController] Password match result: ${isMatch}`); // DEBUG: After bcrypt.compare

    if (!isMatch) {
      console.log('[authController] Password mismatch.'); // DEBUG: Password mismatch
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[authController] Generating token...'); // DEBUG: Before generateToken
    // 生成JWT Token
    const token = generateToken(user.id); // 使用 user.id

    console.log('[authController] Sending success response...'); // DEBUG: Before response
    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: { id: user.id, username: user.username, role: user.role }
      }
    });
  } catch (error) {
    console.error('[authController] Login error:', error); // DEBUG: Catch login errors
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

// @desc    获取当前用户信息 (暂时简化)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  console.log('GetMe function (simplified) received request');
  res.json({ message: 'GetMe function hit, but bypassed logic.' });
};

// @desc    更新用户信息 (暂时简化)
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  console.log('UpdateMe function (simplified) received request');
  res.json({ message: 'UpdateMe function hit, but bypassed logic.' });
};

// @desc    修改密码 (暂时简化)
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  console.log('ChangePassword function (simplified) received request');
  res.json({ message: 'ChangePassword function hit, but bypassed logic.' });
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
}; 