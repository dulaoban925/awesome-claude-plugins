# Language Plugin 使用示例

本文档展示 Language Plugin 的各种使用场景和示例。

## 基础使用

### 场景 1：使用中文进行开发

**设置**：

```bash
/lang-config set zh-CN
```

**对话示例**：

**你**：帮我创建一个 Express 服务器，监听 3000 端口

**Claude Code**：

```
我来帮你创建一个 Express 服务器...

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

这个服务器监听 3000 端口，并在根路径返回一个 JSON 响应。
```

### 场景 2：切换到英语

**设置**：

```bash
/lang en
```

**对话示例**：

**你**：Create a React component for a todo list

**Claude Code**：

```
I'll create a React component for a todo list...

import React, { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // Component implementation...
}

This component manages a list of todos with add, remove, and toggle functionality.
```

## 项目级配置

### 场景 3：为特定项目设置语言

某些项目可能需要特定的语言设置。例如，一个国际项目需要使用英文：

```bash
cd /path/to/international-project
mkdir -p .claude
cat > .claude/language-config.json <<EOF
{
  "enabled": true,
  "language": "en"
}
EOF
```

现在这个项目中的 Claude Code 会使用英文回复，而其他项目仍使用你的全局设置。

### 场景 4：团队协作中的语言统一

在团队项目中，将语言配置文件提交到版本控制：

```bash
# 在项目根目录
mkdir -p .claude
cat > .claude/language-config.json <<EOF
{
  "enabled": true,
  "language": "zh-CN",
  "customInstructions": "请使用简洁清晰的语言，避免过于冗长的解释。"
}
EOF

# 提交到版本控制
git add .claude/language-config.json
git commit -m "添加团队语言配置"
```

这样团队成员都会使用统一的语言和风格。

## 高级用法

### 场景 5：自定义语言指令

你可以添加自定义指令来调整 Claude 的回复风格：

编辑 `~/.claude/language-config.json`：

```json
{
  "enabled": true,
  "language": "zh-CN",
  "customInstructions": "请使用简洁、直接的表达方式。在解释技术概念时，先给出简短总结，再详细展开。代码示例要简洁清晰，避免冗余。"
}
```

### 场景 6：日语开发

**设置**：

```bash
/lang-config set ja
```

**对话示例**：

**你**：REST API エンドポイントを作成してください

**Claude Code**：

```
REST API エンドポイントを作成いたします...

// GET エンドポイント - ユーザー一覧取得
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

このエンドポイントはユーザー一覧を JSON 形式で返します。
```

## 配置管理

### 场景 7：查看当前配置

```bash
/lang-config show
```

**输出**：

```
Current language configuration:
  Enabled: Yes
  Language: zh-CN

Configuration file: /Users/username/.claude/language-config.json
```

### 场景 8：列出支持的语言

```bash
/lang-config list
```

**输出**：

```
Available languages:
  zh-CN    - 简体中文
  en       - English
  ja       - 日本語
```

### 场景 9：临时禁用插件

如果某次对话你想让 Claude 使用默认行为（不受语言设置影响）：

```bash
/lang-config disable
```

完成后再启用：

```bash
/lang-config enable
```

## 实际工作流程示例

### 场景 10：多语言项目开发

假设你在开发一个多语言项目：

1. **全局默认使用中文**：

```bash
/lang-config set zh-CN
```

2. **英文文档项目使用英文**：

```bash
cd ~/projects/english-docs
mkdir -p .claude
echo '{"enabled":true,"language":"en"}' > .claude/language-config.json
```

3. **日本客户项目使用日文**：

```bash
cd ~/projects/japan-client
mkdir -p .claude
echo '{"enabled":true,"language":"ja"}' > .claude/language-config.json
```

现在，Claude Code 会根据你所在的项目自动使用相应的语言！

### 场景 11：代码审查中的语言切换

在代码审查时，你可能需要用英文撰写评论：

```bash
# 临时切换到英文
/lang en

# 进行代码审查...
```

**你**：Review this pull request

**Claude Code**：

```
I'll review this pull request...

Changes look good overall. Here are some observations:

1. Good separation of concerns in the new components
2. Consider adding error handling for the API calls
3. The test coverage could be improved...
```

审查完成后可以切换回中文：

```bash
/lang zh-CN
```

## 故障排除示例

### 场景 12：插件未生效

如果设置后插件没有生效：

```bash
# 1. 检查配置
/lang-config show

# 2. 确认插件已启用
# 如果显示 "Enabled: No"，则启用它
/lang-config enable

# 3. 运行 /hooks 命令确认并应用新的 hooks 配置
/hooks

# 4. 或者重启 Claude Code
```

### 场景 13：语言模板不存在

如果尝试使用不支持的语言：

```bash
/lang-config set fr
```

**输出**：

```
Unsupported language: fr

Available languages:
  zh-CN: 简体中文
  en: English
  ja: 日本語
```

你需要先添加法语支持（参考 README.md 中的"添加新语言"部分）。

## 最佳实践

### 1. 团队协作

- 在团队项目中使用项目级配置
- 将 `.claude/language-config.json` 提交到版本控制
- 在 README 中说明团队的语言设置

### 2. 个人使用

- 设置符合你习惯的全局默认语言
- 为特殊项目创建项目级配置
- 使用 `/lang` 命令进行临时切换

### 3. 多语言环境

- 为不同语言的项目设置相应的配置
- 利用配置优先级特性实现灵活切换
- 保持技术术语为英文以便国际协作

## 总结

Language Plugin 提供了灵活的多语言支持，让你可以：

- 使用母语进行日常开发
- 根据项目需求切换语言
- 保持代码和技术术语的英文标准
- 与团队保持一致的交流语言

祝你使用愉快！ 🎉
