# 第一阶段：构建应用
FROM node:18-alpine as builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY src/package*.json ./

# 安装依赖
RUN npm install

# 复制前端代码
COPY src/ ./

# 构建应用
RUN npm run build

# 第二阶段：用 Nginx 提供静态文件
FROM nginx:stable-alpine

# 复制构建好的静态文件到 Nginx 默认的静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置（如果需要的话，这里暂时不需要，使用默认配置）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露前端应用程序运行的端口
EXPOSE 80

# 启动 Nginx 服务器
CMD ["nginx", "-g", "daemon off;"] 