FROM node:20-alpine
WORKDIR /app

# 安装时区数据
RUN apk add --no-cache tzdata
ENV TZ=Asia/Shanghai

# 复制依赖描述文件
COPY package*.json ./

# 安装所有依赖（含 devDependencies，构建需要）
RUN npm install

# 复制业务代码
COPY . .

# 构建前端
RUN npm run build

# 构建后端（TypeScript 编译）
RUN npm run build:server

# 安装生产依赖（移除 devDependencies 减小镜像体积）
RUN npm prune --omit=dev

# 暴露端口（HTTP + HTTPS）
EXPOSE 8080 8443

# 生产环境启动
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
