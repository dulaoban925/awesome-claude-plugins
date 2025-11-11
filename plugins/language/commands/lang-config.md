---
description: 管理语言插件配置
argument-hint: <command> [args]
---

执行语言配置管理命令：

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/config-manager.js {{args}}
```

**可用命令**：

- `init` - 初始化插件 hook 配置（自动配置到 settings.json）
- `check` - 检查 hook 配置状态
- `remove` - 移除插件 hook 配置
- `show` - 显示当前配置
- `set <语言代码>` - 设置默认语言
- `enable` - 启用语言插件
- `disable` - 禁用语言插件
- `list` - 列出所有支持的语言

**示例**：

```bash
/lang-config init              # 初始化 hook（首次使用必须运行）
/lang-config check             # 检查 hook 是否已配置
/lang-config remove            # 移除 hook 配置
/lang-config show              # 显示当前配置
/lang-config set zh-CN         # 设置默认为中文
/lang-config set en            # 设置默认为英语
/lang-config enable            # 启用插件
/lang-config disable           # 禁用插件
/lang-config list              # 列出支持的语言
```

**配置优先级**（从高到低）：
1. 项目配置：`<项目>/.claude/language-config.json`
2. 用户配置：`~/.claude/language-config.json`
3. 默认配置：插件内置配置

**注意**：
- **首次使用必须运行 `/lang-config init` 来配置 hook**
- 配置更改会在下次对话时生效
- 项目配置会覆盖用户配置
- 可以在项目中创建 `.claude/language-config.json` 来设置项目特定的语言偏好
- `init` 命令会自动备份 settings.json 文件
- 如果需要卸载插件，可以使用 `/lang-config remove` 移除 hook 配置
