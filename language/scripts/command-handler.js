#!/usr/bin/env node

/**
 * Language Plugin - Unified Command Handler
 * 统一的 /lang 命令处理器
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// 配置路径
const USER_CONFIG_PATH = path.join(os.homedir(), '.claude', 'language-config.json');
const PROJECT_CONFIG_PATH = path.join(process.cwd(), '.claude', 'language-config.json');
const LANGUAGES_DIR = path.join(__dirname, '..', 'config', 'languages');
const INIT_HOOK_SCRIPT = path.join(__dirname, 'init-hook.js');
const DEFAULT_CONFIG_PATH = path.join(__dirname, '..', 'config', 'default.json');

// 版本信息
const PLUGIN_VERSION = '1.0.0';
const PLUGIN_NAME = 'Language Plugin';

// 输出美化
const LINE = '━'.repeat(60);
const CHECK = '✓';
const CROSS = '✗';
const ARROW = '→';
const DOT = '•';
const PIN = '📌';
const BULB = '💡';
const FOLDER = '📁';
const REFRESH = '🔄';
const WARNING = '⚠️';

// 加载配置
function loadConfig(configPath = null) {
  const paths = configPath
    ? [configPath]
    : [PROJECT_CONFIG_PATH, USER_CONFIG_PATH, DEFAULT_CONFIG_PATH];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf-8');
        return { config: JSON.parse(content), source: p };
      } catch (error) {
        console.error(`Failed to load config from ${p}: ${error.message}`);
      }
    }
  }

  return { config: null, source: null };
}

// 保存配置
function saveConfig(config, isGlobal = true) {
  const configPath = isGlobal ? USER_CONFIG_PATH : PROJECT_CONFIG_PATH;

  try {
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true, path: configPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 获取所有支持的语言
function listLanguages() {
  try {
    const files = fs.readdirSync(LANGUAGES_DIR);
    const languages = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const langPath = path.join(LANGUAGES_DIR, file);
        const content = fs.readFileSync(langPath, 'utf-8');
        const lang = JSON.parse(content);
        languages.push(lang);
      }
    }

    return languages.sort((a, b) => a.code.localeCompare(b.code));
  } catch (error) {
    console.error(`Failed to list languages: ${error.message}`);
    return [];
  }
}

// 查找语言
function findLanguage(code) {
  const languages = listLanguages();
  return languages.find(l => l.code === code);
}

// 运行 hook 脚本
function runInitHook(command = 'init') {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [INIT_HOOK_SCRIPT, command], {
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Hook script exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// ============ 命令实现 ============

// 无参数：显示当前状态
function cmdDefault() {
  const { config, source } = loadConfig();
  const currentLang = config?.language || 'en';
  const language = findLanguage(currentLang);
  const enabled = config?.enabled !== false;

  console.log(`\n${PLUGIN_NAME} v${PLUGIN_VERSION}\n`);
  console.log(`当前语言：${language?.name || currentLang} (${currentLang})`);
  console.log(`插件状态：${enabled ? CHECK + ' 已启用' : CROSS + ' 已禁用'}\n`);

  console.log('快速切换：');
  console.log(`  /lang en                 切换到英文`);
  console.log(`  /lang zh-CN              切换到中文`);
  console.log(`  /lang ja                 切换到日文\n`);

  console.log('常用命令：');
  console.log(`  /lang set <语言>         永久设置默认语言`);
  console.log(`  /lang list               查看所有支持的语言`);
  console.log(`  /lang help               查看完整帮助\n`);

  console.log(`提示：直接使用 /lang <语言代码> 即可临时切换语言\n`);
}

// 临时切换语言
function cmdSwitch(languageCode) {
  const language = findLanguage(languageCode);

  if (!language) {
    console.log(`\n${CROSS} 不支持的语言代码: ${languageCode}\n`);
    console.log('支持的语言：');
    const languages = listLanguages();
    languages.slice(0, 7).forEach(l => {
      console.log(`  ${l.code.padEnd(8)} ${l.name}`);
    });
    console.log(`\n使用 /lang list 查看完整列表\n`);
    return;
  }

  console.log(`\n${CHECK} 已临时切换到：${language.name} (${languageCode})\n`);
  console.log(`  ${PIN} 仅在当前会话生效`);
  console.log(`  ${BULB} 使用 /lang set ${languageCode} 永久设置默认语言\n`);

  // 临时切换通过 additionalContext 实现，这里只是提示
  // 实际的切换逻辑在 lang.md 中处理
}

// 设置默认语言
function cmdSet(languageCode, options = {}) {
  const language = findLanguage(languageCode);

  if (!language) {
    console.log(`\n${CROSS} 不支持的语言代码: ${languageCode}\n`);
    console.log('支持的语言：');
    listLanguages().slice(0, 7).forEach(l => {
      console.log(`  ${l.code.padEnd(8)} ${l.name}`);
    });
    console.log(`\n使用 /lang list 查看完整列表\n`);
    return;
  }

  const isGlobal = options.global || !options.project;
  const { config: existingConfig } = loadConfig();

  const config = existingConfig || {
    enabled: true,
    language: languageCode,
    preserveEnglish: {
      technicalTerms: true,
      code: true,
      apiNames: true,
      paths: true,
      variableNames: true
    },
    localizeContent: {
      explanations: true,
      comments: true,
      documentation: true,
      commitMessages: true,
      errorMessages: true
    },
    customInstructions: ''
  };

  config.language = languageCode;

  const result = saveConfig(config, isGlobal);

  if (result.success) {
    console.log(`\n${CHECK} 默认语言已设置为：${language.name} (${languageCode})\n`);
    console.log(`  ${FOLDER} 配置文件：${result.path.replace(os.homedir(), '~')}${isGlobal ? '' : ' (项目级)'}`);
    console.log(`  ${REFRESH} 从下次对话开始生效\n`);
    console.log(`  ${BULB} 当前会话仍使用之前的语言设置`);
    console.log(`     如需立即切换，请使用：/lang ${languageCode}\n`);
  } else {
    console.log(`\n${CROSS} 保存配置失败: ${result.error}\n`);
  }
}

// 显示配置
function cmdShow() {
  const { config, source } = loadConfig();

  if (!config) {
    console.log(`\n${CROSS} 未找到配置文件\n`);
    console.log(`使用 /lang init 初始化插件\n`);
    return;
  }

  const language = findLanguage(config.language);
  const enabled = config.enabled !== false;

  console.log(`\n${PLUGIN_NAME} 配置详情`);
  console.log(LINE);
  console.log('\n基本信息：');
  console.log(`  插件版本：${PLUGIN_VERSION}`);
  console.log(`  插件状态：${enabled ? CHECK + ' 已启用' : CROSS + ' 已禁用'}`);
  console.log(`  默认语言：${language?.name || config.language} (${config.language})`);

  console.log('\n配置文件：');
  const userConfigExists = fs.existsSync(USER_CONFIG_PATH);
  const projectConfigExists = fs.existsSync(PROJECT_CONFIG_PATH);
  console.log(`  全局配置：${USER_CONFIG_PATH.replace(os.homedir(), '~')} ${userConfigExists ? CHECK : CROSS}`);
  console.log(`  项目配置：./.claude/language-config.json ${projectConfigExists ? CHECK : CROSS}`);
  console.log(`  当前使用：${source.replace(os.homedir(), '~')}`);
  console.log(`  优先级：项目配置 > 全局配置 > 默认配置`);

  if (config.preserveEnglish) {
    console.log('\n保留英文内容：');
    Object.entries(config.preserveEnglish).forEach(([key, value]) => {
      const labels = {
        technicalTerms: '技术术语',
        code: '代码本身',
        apiNames: 'API 名称',
        paths: '文件路径',
        variableNames: '变量名'
      };
      console.log(`  ${value ? CHECK : CROSS} ${labels[key] || key}`);
    });
  }

  if (config.localizeContent) {
    console.log('\n本地化内容：');
    Object.entries(config.localizeContent).forEach(([key, value]) => {
      const labels = {
        explanations: '解释说明',
        comments: '代码注释',
        documentation: '文档',
        commitMessages: '提交信息',
        errorMessages: '错误消息'
      };
      console.log(`  ${value ? CHECK : CROSS} ${labels[key] || key}`);
    });
  }

  if (config.customInstructions) {
    console.log('\n自定义指令：');
    console.log(`  ${config.customInstructions}`);
  } else {
    console.log('\n自定义指令：');
    console.log(`  (未设置)`);
  }

  console.log('\n' + LINE);
  console.log(`\n${BULB} 使用 /lang set <语言> 更改默认语言`);
  console.log(`${BULB} 使用 /lang reset 重置为默认配置`);
  console.log(`${BULB} 配置文件可手动编辑以自定义更多选项\n`);
}

// 列出支持的语言
function cmdList(options = {}) {
  const { config } = loadConfig();
  const currentLang = config?.language || 'en';
  const languages = listLanguages();

  console.log('\n支持的语言列表');
  console.log(LINE + '\n');

  languages.forEach(lang => {
    const isCurrent = lang.code === currentLang;
    const marker = isCurrent ? CHECK : ' ';
    const suffix = isCurrent ? ' (当前默认)' : '';
    console.log(`  ${marker} ${lang.code.padEnd(8)} ${lang.name}${suffix}`);
  });

  console.log('\n' + LINE + '\n');
  console.log('快速切换：');
  console.log(`  /lang zh-CN              临时切换到简体中文`);
  console.log(`  /lang set en             永久设置为 English\n`);
  console.log(`${BULB} 更多语言支持即将推出`);
  console.log(`${BULB} 如需添加新语言，请访问：`);
  console.log(`   https://github.com/dulaoban925/awesome-claude-plugins\n`);
}

// 初始化插件
async function cmdInit() {
  console.log(`\n正在初始化 ${PLUGIN_NAME}...`);
  console.log(LINE + '\n');

  try {
    await runInitHook('init');

    console.log('\n' + LINE);
    console.log(`\n${CHECK} ${PLUGIN_NAME} 初始化完成！\n`);

    const { config, source } = loadConfig();
    if (config) {
      const language = findLanguage(config.language);
      console.log('当前设置：');
      console.log(`  语言：${language?.name || config.language} (${config.language})`);
      console.log(`  状态：${config.enabled !== false ? '已启用' : '已禁用'}\n`);
    }

    console.log('下一步：');
    console.log(`  1. 使用 /lang set zh-CN 设置中文`);
    console.log(`  2. 使用 /lang list 查看支持的语言`);
    console.log(`  3. 使用 /lang help 查看完整帮助\n`);
    console.log(`${BULB} 插件已就绪，开始使用吧！\n`);
  } catch (error) {
    console.log(`\n${CROSS} 初始化失败: ${error.message}\n`);
  }
}

// 查看状态
async function cmdStatus() {
  console.log(`\n${PLUGIN_NAME} 状态检查`);
  console.log(LINE + '\n');

  console.log('插件信息：');
  console.log(`  名称：${PLUGIN_NAME}`);
  console.log(`  版本：${PLUGIN_VERSION}`);

  const { config, source } = loadConfig();
  const enabled = config?.enabled !== false;
  const hookConfigured = fs.existsSync(path.join(os.homedir(), '.claude', 'settings.json'));
  const configExists = config !== null;
  const scriptExists = fs.existsSync(path.join(__dirname, 'language-hook.js'));

  console.log('\n运行状态：');
  console.log(`  插件状态：${enabled ? CHECK : CROSS} ${enabled ? '已启用' : '已禁用'}`);
  console.log(`  Hook 状态：${hookConfigured ? CHECK : CROSS} ${hookConfigured ? '已配置' : '未配置'}`);
  console.log(`  配置状态：${configExists ? CHECK : CROSS} ${configExists ? '配置正常' : '配置缺失'}`);

  console.log('\n配置检查：');
  console.log(`  ${hookConfigured ? CHECK : CROSS} settings.json - Hook ${hookConfigured ? '已注册' : '未注册'}`);
  console.log(`  ${configExists ? CHECK : CROSS} language-config.json - 配置${configExists ? '正常' : '不存在'}`);
  console.log(`  ${scriptExists ? CHECK : CROSS} language-hook.js - 脚本可执行`);

  if (config) {
    const language = findLanguage(config.language);
    console.log('\n当前设置：');
    console.log(`  默认语言：${language?.name || config.language} (${config.language})`);
    console.log(`  配置来源：${source.replace(os.homedir(), '~')}`);
  }

  console.log('\n' + LINE);

  const allOk = enabled && hookConfigured && configExists && scriptExists;

  if (allOk) {
    console.log(`\n${CHECK} 所有检查通过，插件运行正常\n`);
    console.log(`${BULB} 使用 /lang show 查看详细配置\n`);
  } else {
    console.log(`\n${CROSS} 发现问题\n`);
    console.log('解决方案：');
    console.log(`  运行 /lang init 初始化插件配置\n`);
    console.log(`${BULB} 如问题持续，请访问：`);
    console.log(`   https://github.com/dulaoban925/awesome-claude-plugins/issues\n`);
  }
}

// 启用插件
function cmdEnable() {
  const { config } = loadConfig();

  if (!config) {
    console.log(`\n${CROSS} 未找到配置文件\n`);
    console.log(`请先运行 /lang init 初始化插件\n`);
    return;
  }

  config.enabled = true;
  const result = saveConfig(config);

  if (result.success) {
    console.log(`\n${CHECK} ${PLUGIN_NAME} 已启用\n`);
    console.log(`从下次对话开始，插件将自动应用语言设置\n`);
    const language = findLanguage(config.language);
    console.log('当前设置：');
    console.log(`  默认语言：${language?.name || config.language} (${config.language})\n`);
    console.log(`${BULB} 使用 /lang ${config.language} 立即切换当前会话语言\n`);
  } else {
    console.log(`\n${CROSS} 启用失败: ${result.error}\n`);
  }
}

// 禁用插件
function cmdDisable() {
  const { config } = loadConfig();

  if (!config) {
    console.log(`\n${CROSS} 未找到配置文件\n`);
    return;
  }

  config.enabled = false;
  const result = saveConfig(config);

  if (result.success) {
    console.log(`\n${CHECK} ${PLUGIN_NAME} 已禁用\n`);
    console.log(`从下次对话开始，Claude Code 将使用默认语言（通常为英文）\n`);
    console.log('注意：');
    console.log(`  ${DOT} Hook 配置仍然保留`);
    console.log(`  ${DOT} 配置文件未被删除`);
    console.log(`  ${DOT} 可随时使用 /lang enable 重新启用\n`);
    console.log(`${BULB} 如需完全卸载，请使用：/lang uninstall\n`);
  } else {
    console.log(`\n${CROSS} 禁用失败: ${result.error}\n`);
  }
}

// 重置配置
function cmdReset() {
  console.log(`\n${WARNING} 即将重置 ${PLUGIN_NAME} 配置\n`);
  console.log('将执行以下操作：');
  console.log(`  ${DOT} 删除 ~/.claude/language-config.json`);
  console.log(`  ${DOT} 恢复默认设置（English）`);
  console.log(`  ${DOT} 保留 Hook 配置\n`);

  // TODO: 添加交互式确认
  // 这里先直接执行

  if (fs.existsSync(USER_CONFIG_PATH)) {
    try {
      fs.unlinkSync(USER_CONFIG_PATH);
      console.log('正在重置配置...\n');
      console.log(`${CHECK} 配置文件已删除`);
      console.log(`${CHECK} 恢复默认设置\n`);
      console.log('当前状态：');
      console.log(`  默认语言：English (en)`);
      console.log(`  插件状态：已启用\n`);
      console.log(`${BULB} 使用 /lang set zh-CN 重新设置语言\n`);
    } catch (error) {
      console.log(`\n${CROSS} 重置失败: ${error.message}\n`);
    }
  } else {
    console.log(`${CHECK} 配置文件不存在，无需重置\n`);
  }
}

// 卸载插件
async function cmdUninstall() {
  console.log(`\n${WARNING} 即将卸载 ${PLUGIN_NAME}\n`);
  console.log('将执行以下操作：');
  console.log(`  ${DOT} 从 settings.json 移除 Hook 配置`);
  console.log(`  ${DOT} 删除语言配置文件`);
  console.log(`  ${DOT} 创建配置备份\n`);
  console.log('注意：');
  console.log(`  ${DOT} 插件文件将保留（通过 /plugin uninstall 删除）`);
  console.log(`  ${DOT} 备份文件保存在 ~/.claude/backups/\n`);

  // TODO: 添加交互式确认

  try {
    console.log('正在卸载...\n');

    await runInitHook('remove');

    if (fs.existsSync(USER_CONFIG_PATH)) {
      fs.unlinkSync(USER_CONFIG_PATH);
    }

    console.log(`${CHECK} Hook 配置已移除`);
    console.log(`${CHECK} 配置文件已删除\n`);
    console.log(`${CHECK} ${PLUGIN_NAME} 已卸载\n`);
    console.log('重新安装：');
    console.log(`  /plugin install language@awesome-claude-plugins`);
    console.log(`  /lang init\n`);
    console.log(`感谢使用 ${PLUGIN_NAME}！\n`);
  } catch (error) {
    console.log(`\n${CROSS} 卸载失败: ${error.message}\n`);
  }
}

// 帮助信息
function cmdHelp(subcommand = null) {
  if (subcommand) {
    // 显示子命令帮助
    cmdHelpSubcommand(subcommand);
    return;
  }

  // 显示总览帮助
  console.log(`\n${PLUGIN_NAME} - 多语言支持插件`);
  console.log(LINE);
  console.log('\n让 Claude Code 使用您指定的语言回复，支持中文、英文、');
  console.log('日文等多种语言，智能保留技术术语和代码的英文表达。\n');
  console.log(LINE);

  console.log('\n快速开始：\n');
  console.log('  /lang zh-CN              临时切换到中文（当前会话）');
  console.log('  /lang set zh-CN          永久设置默认语言为中文');
  console.log('  /lang list               查看所有支持的语言\n');

  console.log(LINE);
  console.log('\n核心命令：\n');
  console.log('  /lang                    显示当前语言和快速帮助');
  console.log('  /lang <语言代码>         临时切换语言（仅当前会话）\n');

  console.log('配置命令：\n');
  console.log('  /lang set <语言>         永久设置默认语言');
  console.log('  /lang show               显示完整配置');
  console.log('  /lang list               列出支持的语言\n');

  console.log('管理命令：\n');
  console.log('  /lang init               初始化插件配置');
  console.log('  /lang status             查看插件运行状态');
  console.log('  /lang enable             启用插件');
  console.log('  /lang disable            禁用插件');
  console.log('  /lang reset              重置为默认配置');
  console.log('  /lang uninstall          卸载插件\n');

  console.log('帮助命令：\n');
  console.log('  /lang help               显示此帮助信息');
  console.log('  /lang help <命令>        查看命令详细说明\n');

  console.log(LINE);
  console.log('\n使用示例：\n');
  console.log('  # 临时切换（本次对话）');
  console.log('  /lang zh-CN              # 切换到中文');
  console.log('  /lang en                 # 切换到英文\n');
  console.log('  # 永久设置（所有对话）');
  console.log('  /lang set zh-CN          # 默认使用中文');
  console.log('  /lang set en             # 默认使用英文\n');
  console.log('  # 查看和管理');
  console.log('  /lang list               # 查看支持的语言');
  console.log('  /lang show               # 查看当前配置');
  console.log('  /lang status             # 检查插件状态\n');

  console.log(LINE);
  console.log('\n支持的语言：zh-CN, en, ja, ko, fr, de, es\n');
  console.log('更多信息：');
  console.log('  GitHub: https://github.com/dulaoban925/awesome-claude-plugins');
  console.log('  文档: README.md\n');
}

function cmdHelpSubcommand(subcommand) {
  const helps = {
    set: `
/lang set - 永久设置默认语言
${LINE}

用法：
  /lang set <语言代码>
  /lang set <语言代码> --global
  /lang set <语言代码> --project

说明：
  永久设置 Claude Code 的默认回复语言。
  默认保存到用户配置，下次对话开始生效。

示例：
  /lang set zh-CN          # 设置默认语言为中文
  /lang set en --global    # 全局设置为英文
  /lang set ja --project   # 当前项目使用日文

配置文件位置：
  全局：~/.claude/language-config.json
  项目：<项目>/.claude/language-config.json

注意：
  ${DOT} 项目配置优先级高于全局配置
  ${DOT} 设置后从下次对话开始生效
  ${DOT} 当前会话需要手动切换：/lang <语言代码>

相关命令：
  /lang <语言代码>         临时切换（仅当前会话）
  /lang show               查看当前配置
  /lang list               查看支持的语言
`
  };

  if (helps[subcommand]) {
    console.log(helps[subcommand]);
  } else {
    console.log(`\n未找到命令 "${subcommand}" 的帮助信息\n`);
    console.log(`使用 /lang help 查看所有可用命令\n`);
  }
}

// ============ 主函数 ============

async function main() {
  const args = process.argv.slice(2);

  // 无参数：显示当前状态
  if (args.length === 0) {
    cmdDefault();
    return;
  }

  const command = args[0];
  const subArgs = args.slice(1);

  // 已知子命令
  const knownCommands = [
    'set', 'show', 'list', 'init', 'status',
    'enable', 'disable', 'reset', 'uninstall', 'help'
  ];

  try {
    if (knownCommands.includes(command)) {
      // 执行子命令
      switch (command) {
        case 'set':
          if (subArgs.length === 0) {
            console.log('\n用法: /lang set <语言代码>\n');
            console.log('运行 /lang list 查看支持的语言\n');
            return;
          }
          cmdSet(subArgs[0], {
            global: subArgs.includes('--global'),
            project: subArgs.includes('--project')
          });
          break;

        case 'show':
          cmdShow();
          break;

        case 'list':
          cmdList();
          break;

        case 'init':
          await cmdInit();
          break;

        case 'status':
          await cmdStatus();
          break;

        case 'enable':
          cmdEnable();
          break;

        case 'disable':
          cmdDisable();
          break;

        case 'reset':
          cmdReset();
          break;

        case 'uninstall':
          await cmdUninstall();
          break;

        case 'help':
          cmdHelp(subArgs[0]);
          break;
      }
    } else {
      // 尝试作为语言代码处理
      const language = findLanguage(command);
      if (language) {
        cmdSwitch(command);
      } else {
        console.log(`\n${CROSS} 未知命令或语言代码: ${command}\n`);
        console.log('使用 /lang help 查看所有可用命令');
        console.log('使用 /lang list 查看支持的语言\n');
      }
    }
  } catch (error) {
    console.error(`\n${CROSS} 错误: ${error.message}\n`);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = {
  loadConfig,
  saveConfig,
  listLanguages,
  findLanguage
};
