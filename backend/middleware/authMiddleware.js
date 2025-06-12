const jwt = require('jsonwebtoken')
const User = require('../models/User')

// 模拟一个秘密密钥 - 实际上应该从环境变量中获取
// const secret = 'supersecretkey' // 不再需要这个模拟密钥

const verifyToken = async (req, res, next) => {
  console.log('[authMiddleware] verifyToken entered.');
  console.log('[authMiddleware] Authorization header:', req.headers.authorization);
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]

      // 验证 token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log('[authMiddleware] Token decoded:', decoded);

      // 查找用户并附加到请求对象
      req.user = await User.findById(decoded.id)
      console.log('[authMiddleware] verifyToken: req.user after findById:', req.user);

      if (!req.user) {
        console.log('[authMiddleware] verifyToken: User not found.');
        return res.status(401).json({ message: '未授权，用户不存在' });
      }

      next()
    } catch (error) {
      console.error('[authMiddleware] verifyToken error:', error);
      res.status(401).json({ message: '未授权，token 失败或过期' })
    }
  } else {
    console.log('[authMiddleware] verifyToken: No Authorization header or not starting with Bearer.');
    res.status(401).json({ message: '未授权，没有 token' })
  }
}

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log('[authMiddleware] authorizeRoles: Checking roles for user:', req.user?.username, 'with role:', req.user?.role);
    console.log('[authMiddleware] authorizeRoles: Required roles:', roles);

    if (!req.user || !roles.includes(req.user.role)) {
      console.log('[authMiddleware] authorizeRoles: User not authorized or role mismatch.');
      return res.status(403).json({ message: '无权限访问此路由' })
    }
    console.log('[authMiddleware] authorizeRoles: User authorized.');
    next()
  }
}

module.exports = {
  verifyToken,
  authorizeRoles,
} 