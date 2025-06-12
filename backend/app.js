const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import connectDB

// 引入路由
const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Import dashboardRoutes
const categoryRoutes = require('./routes/categoryRoutes'); // Import categoryRoutes

// 加载环境变量
dotenv.config();
console.log('[App] Attempting to load .env from current directory.');
console.log('[App] MONGO_URI value after dotenv.config():', process.env.MONGO_URI);

// 连接数据库
connectDB(process.env.MONGO_URI);

// Fallback for JWT_SECRET if not set in .env
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your_fallback_super_secret_jwt_key';
}

console.log('JWT_SECRET value:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

const app = express();

// Debug: Simple root route to check if server is responsive with Express
app.get('/', (req, res) => {
  console.log('Express root route hit!');
  res.send('Hello from Express server!');
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug: Log all incoming requests to help diagnose routing issues
app.use((req, res, next) => {
  console.log(`[DEBUG] Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/merchant/statistics', dashboardRoutes); // Use dashboardRoutes
app.use('/api/categories', categoryRoutes); // Use categoryRoutes

// 错误处理中间件 (可选)
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack || err);
  res.status(500).send('Something broke in Express!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

// 全局未捕获异常处理
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack || err);
  process.exit(1);
});

// 全局未处理的 Promise 拒绝处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
}); 