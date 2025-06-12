# 在线点餐系统

这是一个基于 Vue 3 + Express + MongoDB 的在线点餐系统，包含商家端和用户端。

## 环境要求

- Node.js v16 或更高版本
- MongoDB v4.4 或更高版本
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

5. 启动 MongoDB
   - 确保 MongoDB 服务已启动
   - 默认连接地址：mongodb://localhost:27017

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

1. MongoDB 连接失败
   - 检查 MongoDB 服务是否启动
   - 检查 `.env` 文件中的 MONGO_URI 配置是否正确

2. 端口被占用
   - 可以在 `.env` 文件中修改 PORT 值
   - 或关闭占用端口的其他程序

3. 依赖安装失败
   - 检查 Node.js 版本是否兼容
   - 尝试删除 node_modules 后重新安装
   - 使用 `npm cache clean --force` 清理缓存

## 开发说明

- 前端使用 Vue 3 + Vite + Element Plus
- 后端使用 Express + MongoDB
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
   - 定期备份数据库
   - 生产环境使用更安全的数据库配置

## 技术支持

如有问题，请提交 Issue 或联系开发者。
