# Awesome Claude Plugin

精选的 Claude Code 插件集合，帮助你扩展 Claude Code 的功能。

## 快速开始

查看 [快速开始指南](QUICKSTART.md) 了解详细的安装和使用步骤。

## 安装方式

### 方式一：通过 `/plugin` 命令安装（推荐）

1. 添加插件市场：

   ```bash
   /plugin marketplace add /path/to/awesome-claude-plugin
   ```

2. 安装插件：

   ```bash
   /plugin install language@awesome-claude
   ```

3. 重启 Claude Code 以激活插件

### 方式二：手动安装

进入具体插件目录，运行安装脚本：

```bash
cd plugins/language
node scripts/install.js
```

## 插件列表

### Language Plugin

让 Claude Code 使用指定语言回复的插件，支持中文、英文、日文等多种语言。

**特性**：

- 自动语言切换
- 临时语言切换命令
- 智能混合语言处理（技术术语保持英文）
- 灵活的配置系统

**文档**：[plugins/language/README.md](plugins/language/README.md)

**快速开始**：

```bash
cd plugins/language
node scripts/install.js
```

## 项目结构

```text
awesome-claude-plugin/
├── .claude-plugin/
│   └── marketplace.json  # 插件市场清单
├── plugins/              # 插件目录
│   └── language/        # 语言插件
├── .claude/             # Claude Code 配置
├── README.md            # 项目说明
├── QUICKSTART.md        # 快速开始指南
└── .gitignore
```

## 插件开发

想要开发自己的 Claude Code 插件？参考以下资源：

- [Claude Code 插件文档](https://code.claude.com/docs/en/plugins.md)
- [Hooks 参考](https://code.claude.com/docs/en/hooks.md)
- [Slash Commands 参考](https://code.claude.com/docs/en/slash-commands.md)

### 插件结构

标准的 Claude Code 插件结构：

```text
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # 插件清单
├── commands/            # Slash Commands
├── hooks/              # Hooks 配置
├── agents/             # 子代理（可选）
├── skills/             # 代理技能（可选）
└── README.md
```

## 贡献

欢迎贡献新的插件或改进现有插件！

### 贡献指南

1. Fork 本仓库
2. 在 `plugins/` 目录下创建你的插件
3. 确保包含完整的文档和示例
4. 提交 Pull Request

### 插件提交要求

- 遵循 Claude Code 官方插件规范
- 提供清晰的 README 文档
- 包含使用示例
- 代码质量良好，有适当的错误处理

## 许可证

MIT License

## 相关链接

- [Claude Code 官方网站](https://code.claude.com/)
- [Claude Code 文档](https://code.claude.com/docs/)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
