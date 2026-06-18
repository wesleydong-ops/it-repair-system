---
name: Docker配置
description: 生成 Dockerfile 和 docker-compose 配置文件
---

请为当前项目生成 Docker 部署配置：

1. **Dockerfile**：
   - 多阶段构建（构建阶段 + 运行阶段）
   - 使用合适的 base 镜像（node:18-alpine 等）
   - 优化镜像层缓存
   - 设置非 root 用户运行

2. **docker-compose.yml**：
   - 应用服务配置
   - 环境变量管理
   - 端口映射
   - 数据卷挂载
   - 网络配置

3. **.dockerignore**：排除不需要的文件

请给出完整的配置文件内容和使用说明。