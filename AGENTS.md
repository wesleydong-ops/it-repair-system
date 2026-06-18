# IT设备扫码报修系统

## 项目简介
企业IT设备报修管理平台，支持扫码报修、工单流转、工程师分组管理。

## 技术栈
- 前端：Vue 3 + TypeScript + Tailwind CSS + Vite
- 后端：Express + TypeScript（单文件 server.ts）
- 数据存储：JSON 文件（data/ 目录）
- 认证：JWT

## 项目结构
- `src/` - 前端 Vue 源码
- `api/` - 后端 Express 源码
- `dist-api/` - 后端编译输出
- `data/` - JSON 数据文件（运行时生成）

## 角色体系
- admin：管理员，全部权限
- engineer：工程师，处理工单
- purchaser：采购专员，外修审批
- operator：运维员

## 开发约定
- 异步 API 调用必须使用 try-catch
- 前端异步函数需包含 isLoading 状态保护
- 邮箱地址默认作为 Webex ID，无需单独填写
- 工单详情页字段需与申请表单对齐，去除冗余内容
- 用户认证路由按角色分离：/engineer/login、/admin/login
