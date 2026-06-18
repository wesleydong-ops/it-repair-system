---
name: Git提交
description: 分析当前变更并生成规范的Git提交信息
---

请分析当前的代码变更，并生成规范的 Git 提交信息：

1. 查看 `git status` 和 `git diff` 了解变更内容
2. 根据变更类型确定提交类型：
   - `feat`: 新功能
   - `fix`: 修复bug
   - `docs`: 文档修改
   - `style`: 代码格式调整
   - `refactor`: 重构
   - `test`: 测试相关
   - `chore`: 构建/工具相关
3. 生成简洁明了的提交信息（中文）
4. 如果有多个不相关的变更，建议分开提交

请给出具体的 git commit 命令。