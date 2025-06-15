# 在线点餐系统

这是一个基于 Vue 3 + Express + MongoDB 的在线点餐系统，包含商家端和用户端。

## 环境要求

- Node.js v16 或更高版本
- MongoDB v4.4 或更高版本
- MySQL v8.0 或更高版本
- npm 或 yarn 包管理器

## 项目结构

```
wangzhan/
├── backend/           # 后端服务
│   ├── controllers/   # 控制器
│   ├── models/       # 数据模型
│   ├── routes/       # 路由
│   ├── middleware/   # 中间件
│   ├── config/       # 配置文件
│   ├── uploads/      # 上传文件目录
│   └── app.js        # 后端入口文件
├── src/              # 前端源码
│   ├── api/          # API 请求
│   ├── assets/       # 静态资源
│   ├── components/   # 组件
│   ├── router/       # 路由配置
│   ├── stores/       # 状态管理
│   ├── views/        # 页面
│   └── App.vue       # 根组件
└── public/           # 公共资源
```

## 安装步骤

1. 克隆或下载项目到本地

2. 安装前端依赖
   ```bash
   # 在项目根目录下运行
   npm install
   ```

3. 安装后端依赖
   ```bash
   # 进入后端目录
   cd backend
   npm install
   ```

4. 配置环境变量
   - 复制 `backend/.env.example` 为 `backend/.env`
   - 根据实际情况修改配置
   - 需要配置 MongoDB 和 MySQL 的连接信息

5. 启动数据库服务
   - 确保 MongoDB 服务已启动
     - 默认连接地址：mongodb://localhost:27017
   - 确保 MySQL 服务已启动
     - 默认连接地址：localhost:3306
     - 需要创建数据库并导入初始数据（如果有）

## 运行项目

1. 启动后端服务
   ```bash
   # 在 backend 目录下运行
   npm run dev
   ```

2. 启动前端服务
   ```bash
   # 在项目根目录下运行
   npm run dev
   ```

3. 访问项目
   - 前端地址：http://localhost:5173
   - 后端地址：http://localhost:3000

## 功能特性

### 商家端
- 登录/注册
- 仪表盘数据统计
- 订单管理
- 菜品管理
- 分类管理
- 数据统计与分析
- 系统设置

### 用户端
- 登录/注册
- 浏览菜品
- 购物车
- 下单
- 订单历史
- 个人中心

## 常见问题

1. 数据库连接失败
   - MongoDB 连接问题：
     - 检查 MongoDB 服务是否启动
     - 检查 `.env` 文件中的 MONGO_URI 配置是否正确
   - MySQL 连接问题：
     - 检查 MySQL 服务是否启动
     - 检查 `.env` 文件中的 MySQL 配置是否正确
     - 确保数据库和用户已创建

2. 端口被占用
   - 可以在 `.env` 文件中修改 PORT 值
   - 或关闭占用端口的其他程序

3. 依赖安装失败
   - 检查 Node.js 版本是否兼容
   - 尝试删除 node_modules 后重新安装
   - 使用 `npm cache clean --force` 清理缓存

## 开发说明

- 前端使用 Vue 3 + Vite + Element Plus
- 后端使用 Express + MongoDB + MySQL
- 状态管理使用 Pinia
- 路由使用 Vue Router
- HTTP 请求使用 Axios
- 图表使用 ECharts

## 注意事项

1. 上传文件
   - 图片文件会上传到 backend/uploads 目录
   - 确保该目录有写入权限

2. 环境变量
   - 不要将 .env 文件提交到版本控制
   - 生产环境使用不同的环境变量配置

3. 数据库
   - 定期备份 MongoDB 和 MySQL 数据库
   - 生产环境使用更安全的数据库配置
   - 注意数据库的版本兼容性
   - 重要数据建议使用事务处理

## 技术支持

如有问题，请提交 Issue 或联系开发者。
需要填写的信息（即复制 .env.example 为 .env 并修改）通常包括：
服务器配置
PORT：后端服务端口，一般默认 3000，如果端口被占用可以修改。
NODE_ENV：环境，开发环境一般填 “development”。
MongoDB 配置
MONGO_URI：MongoDB 连接字符串，例如 “mongodb://localhost:27017/wangzhan”。
如果 MongoDB 有密码或远程连接，请根据实际情况修改。
MySQL 配置
MYSQL_HOST：MySQL 服务器地址，一般本地为 “localhost”。
MYSQL_PORT：MySQL 端口，默认 3306。
MYSQL_DATABASE：数据库名称，例如 “wangzhan”。
MYSQL_USER：数据库用户名，例如 “root”。
MYSQL_PASSWORD：数据库密码，请填写你本地 MySQL 的密码。
JWT 配置
JWT_SECRET：JWT 签名密钥，可以自定义一个随机字符串（例如 “your_jwt_secret_key”）。
JWT_EXPIRES_IN：JWT 过期时间，例如 “7d”。
文件上传配置
UPLOAD_DIR：上传文件保存目录，例如 “uploads”。
MAX_FILE_SIZE：上传文件大小限制，例如 5MB（即 5242880 字节）。
跨域配置
CORS_ORIGIN：前端地址，例如 “http://localhost:5173”，根据你前端服务地址修改。
其他配置
SESSION_SECRET：会话密钥，可以自定义一个随机字符串。
总结：
在新电脑上，你只需复制 .env.example 为 .env，然后根据你本地环境（例如数据库密码、端口、密钥等）填写对应的值即可。
