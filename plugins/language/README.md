# Language Plugin for Claude Code

让 Claude Code 使用指定语言回复，支持中文、英文、日文等多种语言。

## 特性

- 🌍 多语言支持：中文、英文、日文等
- ⚙️ 灵活配置：全局配置和项目级配置
- 🎯 智能保留：技术术语和代码保持英文
- 🔄 即时切换：通过命令快速切换语言
- 📝 自定义规则：可添加自定义语言指令

## 安装

请参考 [快速开始指南](../../QUICKSTART.md)。

安装完成后，**必须运行初始化命令**来配置 hook：

```bash
/lang-config init
```

该命令会自动将插件的 hook 配置到 `~/.claude/settings.json`，并创建备份文件。

## 使用

### 初始化插件（必需）

首次使用前，必须运行初始化命令：

```bash
/lang-config init
```

检查 hook 配置状态：

```bash
/lang-config check
```

### 查看当前配置

```bash
/lang-config show
```

### 设置默认语言

```bash
/lang-config set zh-CN    # 设置为简体中文
/lang-config set en       # 设置为英语
/lang-config set ja       # 设置为日语
```

### 临时切换语言

在对话中临时切换语言（仅当前会话生效）：

```bash
/lang zh-CN    # 切换到中文
/lang en       # 切换到英语
```

### 启用/禁用插件

```bash
/lang-config enable       # 启用插件
/lang-config disable      # 禁用插件
```

### 列出支持的语言

```bash
/lang-config list
```

## 支持的语言

- `zh-CN`: 简体中文
- `en`: 英语
- `ja`: 日语

更多语言正在添加中...

## 配置

### 配置文件位置

配置文件优先级（从高到低）：

1. **项目配置**：`<项目>/.claude/language-config.json`
2. **用户配置**：`~/.claude/language-config.json`
3. **默认配置**：插件内置配置

### 配置格式

```json
{
  "enabled": true,
  "language": "zh-CN",
  "preserveEnglish": {
    "technicalTerms": true,
    "code": true,
    "apiNames": true,
    "paths": true,
    "variableNames": true
  },
  "localizeContent": {
    "explanations": true,
    "comments": true,
    "documentation": true,
    "commitMessages": true,
    "errorMessages": true
  },
  "customInstructions": ""
}
```

### 项目级配置

在项目根目录创建 `.claude/language-config.json`：

```bash
mkdir -p .claude
cat > .claude/language-config.json <<EOF
{
  "enabled": true,
  "language": "zh-CN"
}
EOF
```

这样可以为不同项目设置不同的语言偏好。

## 工作原理

插件通过 UserPromptSubmit Hook 拦截用户输入，根据配置加载相应的语言模板，并通过 `additionalContext` 将语言指令注入到 Claude 的上下文中。

### 技术细节

1. **Hook 触发**：用户提交 prompt 时触发 `UserPromptSubmit` hook
2. **配置加载**：按优先级查找配置文件
3. **模板加载**：根据语言代码加载模板
4. **指令生成**：生成语言指令
5. **上下文注入**：通过 `additionalContext` 注入指令
6. **Claude 响应**：Claude 使用目标语言回复

## 添加新语言

要添加新语言支持，在 `config/languages/` 目录下创建新的 JSON 文件：

```json
{
  "name": "语言名称",
  "code": "语言代码",
  "instruction": "主要指令",
  "rules": [
    "规则1",
    "规则2"
  ],
  "examples": [
    "示例1",
    "示例2"
  ]
}
```

例如，添加韩语支持（`ko.json`）：

```json
{
  "name": "한국어",
  "code": "ko",
  "instruction": "모든 질문과 요청에 한국어로 답변해 주세요.",
  "rules": [
    "모든 설명은 한국어로 작성",
    "전문 기술 용어는 영어로 유지"
  ]
}
```

## 故障排除

### 插件不生效

1. **首先运行初始化命令**：`/lang-config init`
2. 检查 hook 是否已配置：`/lang-config check`
3. 确认配置已启用：`/lang-config show`（确保 `enabled: true`）
4. 重启新的对话会话

### 语言切换无效

1. 确认 hook 已配置：`/lang-config check`
2. 确认配置已启用：`enabled: true`
3. 检查语言代码是否正确：`/lang-config list`
4. 配置更改需要在下次对话时生效

### 找不到命令

1. 确认插件已安装：检查 `~/.claude/plugins/installed_plugins.json`
2. 重启 Claude Code
3. 如果问题仍然存在，尝试重新安装插件

### 卸载插件

如果需要完全卸载插件：

1. 移除 hook 配置：`/lang-config remove`
2. 删除语言配置文件：`rm ~/.claude/language-config.json`
3. 使用 Claude Code 的插件管理功能卸载插件

## 示例

详细使用示例请参考 [examples/usage.md](examples/usage.md)。

## 版本历史

### 1.0.0

- 初始版本
- 支持中文、英文、日文
- 支持全局和项目级配置
- 提供 slash commands 管理配置

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT License
