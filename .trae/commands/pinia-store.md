---
name: 状态管理
description: 设计 Pinia Store 状态管理方案
---

请为项目设计 Pinia 状态管理方案：

1. **Store 划分**：按功能模块划分 Store
   - userStore：用户信息和认证状态
   - workOrderStore：工单相关状态
   - projectStore：项目/分组配置
   - appStore：全局应用状态

2. **每个 Store 包含**：
   - State 定义和类型
   - Getters 计算属性
   - Actions（同步和异步）
   - 持久化配置（localStorage）

3. **最佳实践**：
   - 使用 TypeScript 类型
   - 合理的状态粒度
   - 避免状态冗余

请给出完整的 Store 代码和使用示例。