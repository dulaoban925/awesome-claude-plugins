---
description: 多语言支持 - 统一命令
argument-hint: [语言代码|命令] [参数...]
---

Language Plugin - 让 Claude Code 使用指定语言回复

**快速使用**：
```bash
/lang zh-CN          # 临时切换到中文
/lang en             # 临时切换到英文
/lang set zh-CN      # 永久设置默认语言为中文
/lang help           # 查看完整帮助
```

**可用命令**：

**核心命令**：
- (无参数) - 显示当前语言和快速帮助
- `<语言代码>` - 临时切换语言（仅当前会话）

**配置命令**：
- `set <语言>` - 永久设置默认语言
- `show` - 显示完整配置
- `list` - 列出支持的语言

**管理命令**：
- `init` - 初始化插件配置（首次使用必须运行）
- `status` - 查看插件运行状态
- `enable` - 启用插件
- `disable` - 禁用插件
- `reset` - 重置为默认配置
- `uninstall` - 卸载插件

**帮助命令**：
- `help` - 显示完整帮助
- `help <命令>` - 查看命令详细说明

**支持的语言**：zh-CN (简体中文), en (English), ja (日本語), ko (한국어), fr (Français), de (Deutsch), es (Español)

---

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/command-handler.js {{args}}
```
