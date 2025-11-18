# Language Plugin for Claude Code

让 Claude Code 使用指定语言回复，支持中文、英文、日文等多种语言。

## 特性

- 🌍 多语言支持：中文、英文、日文等
- ⚙️ 灵活配置：全局配置和项目级配置
- 🎯 智能保留：技术术语和代码保持英文
- 🔄 即时切换：通过命令快速切换语言
- 📝 自定义规则：可添加自定义语言指令

## 安装

### 通过插件市场安装

1. 添加插件市场：

   ```bash
   /plugin marketplace add /path/to/awesome-claude-plugins
   ```

2. 安装插件：

   ```bash
   /plugin install language@awesome-claude-plugins
   ```

3. **运行初始化命令**（必需）：
   ```bash
   /lang init
   ```

该命令会自动将插件的 hook 配置到 `~/.claude/settings.json`，并创建备份文件。

## 使用

### 初始化插件（必需）

首次使用前，必须运行初始化命令：

```bash
/lang init
```

初始化默认使用**中文**。

检查插件状态：

```bash
/lang status
```

### 快速开始

```bash
# 查看当前状态
/lang

# 临时切换语言（当前会话）
/lang zh-CN              # 切换到中文
/lang en                 # 切换到英文

# 永久设置默认语言
/lang set zh-CN          # 设置为简体中文
/lang set en             # 设置为英语

# 查看所有命令
/lang help
```

### 核心命令

**临时切换（当前会话）**：

```bash
/lang zh-CN              # 临时切换到中文
/lang en                 # 临时切换到英文
/lang ja                 # 临时切换到日文
```

**永久设置**：

```bash
/lang set zh-CN          # 默认使用中文
/lang set en             # 默认使用英文
```

### 配置管理

**查看配置**：

```bash
/lang show               # 显示完整配置
/lang list               # 列出支持的语言
```

**插件管理**：

```bash
/lang enable             # 启用插件
/lang disable            # 禁用插件
/lang reset              # 重置为默认配置
/lang uninstall          # 卸载插件
```

### 帮助信息

```bash
/lang help               # 查看完整帮助
/lang help set           # 查看 set 命令帮助
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

1. **首先运行初始化命令**：`/lang init`
2. 检查插件状态：`/lang status`
3. 确认配置已启用：`/lang show`（确保 `enabled: true`）
4. 重启新的对话会话

### 语言切换无效

1. 确认插件状态正常：`/lang status`
2. 确认配置已启用：`enabled: true`
3. 检查语言代码是否正确：`/lang list`
4. 配置更改需要在下次对话时生效

### 找不到命令

1. 确认插件已安装：检查 `~/.claude/plugins/installed_plugins.json`
2. 重启 Claude Code
3. 如果问题仍然存在，尝试重新安装插件

### 卸载插件

如果需要完全卸载插件：

1. 移除 hook 配置：`/lang uninstall`
2. 使用 Claude Code 的插件管理功能卸载插件：`/plugin uninstall language@awesome-claude-plugins`

## 示例

详细使用示例请参考 [examples/usage.md](examples/usage.md)。

## 版本历史

### 2.0.0

- 统一命令设计：所有功能集成到 `/lang` 命令
- 废弃 `/lang-config` 命令
- 改进的命令行输出和错误提示
- 更简洁的使用体验

### 1.0.0

- 初始版本
- 支持中文、英文、日文
- 支持全局和项目级配置
- 提供 slash commands 管理配置

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT License
