# Awesome Claude Plugins

精选的 Claude Code 插件集合，帮助你扩展 Claude Code 的功能。

## 安装方式

### 方式一：通过 `/plugin` 命令安装（推荐）

1. 克隆本仓库：

   ```bash
   git clone https://github.com/dulaoban925/awesome-claude-plugins.git
   ```

2. 添加插件市场：

   ```bash
   /plugin marketplace add /path/to/awesome-claude-plugins
   ```

3. 安装插件：

   ```bash
   /plugin install language@awesome-claude-plugins
   ```

4. 初始化插件（必需）：

   ```bash
   /lang init
   ```

### 方式二：手动安装

1. 克隆本仓库到本地
2. 在 Claude Code 中使用 `/plugin install` 命令指向插件目录
3. 运行 `/lang init` 初始化插件

## 插件列表

### 🌍 Language Plugin

让 Claude Code 使用指定语言回复的插件，支持中文、英文、日文等多种语言。

**特性**：

- 🌍 多语言支持：中文、英文、日文
- ⚙️ 灵活配置：全局配置和项目级配置
- 🎯 智能保留：技术术语和代码保持英文
- 🔄 即时切换：通过命令快速切换语言
- 📝 自定义规则：可添加自定义语言指令

**文档**：[language/README.md](language/README.md)

**快速使用**：

```bash
# 初始化插件
/lang init

# 设置为中文
/lang set zh-CN

# 临时切换语言
/lang zh-CN

# 查看帮助
/lang help
```

## 项目结构

```text
awesome-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json      # 插件市场清单
├── language/                 # 语言插件
│   ├── .claude-plugin/      # 插件配置
│   ├── commands/            # Slash Commands
│   ├── hooks/              # Hooks 配置
│   ├── scripts/            # 管理脚本
│   ├── config/             # 语言配置文件
│   ├── examples/           # 使用示例
│   └── README.md           # 插件文档
├── README.md                # 项目说明
└── .gitignore              # Git 忽略文件
```

## 插件开发

想要开发自己的 Claude Code 插件？参考以下资源：

- [Claude Code 官方文档](https://docs.claude.com/claude-code)
- [Hooks 开发指南](https://docs.claude.com/en/docs/claude-code/hooks)
- [Slash Commands 开发指南](https://docs.claude.com/en/docs/claude-code/slash-commands)

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

- [Claude Code 官方网站](https://claude.com/claude-code)
- [Claude Code 文档](https://docs.claude.com/claude-code)
- [Claude AI 官网](https://claude.ai)
