#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// 从 stdin 读取 Hook 输入
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    let timeout;

    // 设置超时，防止无限等待
    timeout = setTimeout(() => {
      reject(new Error('Timeout reading stdin'));
    }, 5000);

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      clearTimeout(timeout);
      resolve(data);
    });

    process.stdin.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// 查找配置文件
function findConfigFile(cwd) {
  const locations = [
    // 1. 项目配置
    path.join(cwd, '.claude', 'language-config.json'),
    // 2. 用户配置
    path.join(os.homedir(), '.claude', 'language-config.json'),
    // 3. 默认配置
    path.join(__dirname, '..', 'config', 'default.json'),
  ];

  for (const location of locations) {
    if (fs.existsSync(location)) {
      return location;
    }
  }

  return null;
}

// 加载配置
function loadConfig(configPath) {
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load config from ${configPath}:`, error.message);
    return null;
  }
}

// 查找插件根目录
function findPluginRoot() {
  // 方法1: 使用 __dirname (脚本在 scripts/ 目录下)
  const pluginRoot = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(pluginRoot, 'config', 'languages'))) {
    return pluginRoot;
  }

  // 方法2: 从 installed_plugins.json 读取
  try {
    const installedPluginsPath = path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json');
    if (fs.existsSync(installedPluginsPath)) {
      const content = fs.readFileSync(installedPluginsPath, 'utf-8');
      const data = JSON.parse(content);
      if (data.plugins && data.plugins['language@awesome-claude']) {
        const installPath = data.plugins['language@awesome-claude'].installPath;
        if (installPath && fs.existsSync(installPath)) {
          return installPath;
        }
      }
    }
  } catch (error) {
    // 继续尝试其他方法
  }

  // 方法3: 返回默认路径
  return path.resolve(__dirname, '..');
}

// 加载语言模板
function loadLanguageTemplate(languageCode) {
  const pluginRoot = findPluginRoot();
  const templatePath = path.join(pluginRoot, 'config', 'languages', `${languageCode}.json`);

  if (!fs.existsSync(templatePath)) {
    console.error(`Language template not found: ${languageCode}`);
    return null;
  }

  try {
    const content = fs.readFileSync(templatePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load language template ${languageCode}:`, error.message);
    return null;
  }
}

// 生成语言指令
function generateLanguageInstruction(config, template) {
  let instruction = template.instruction + '\n\n';

  // 添加规则
  if (template.rules && template.rules.length > 0) {
    instruction += '**重要规则**：\n';
    template.rules.forEach((rule) => {
      instruction += `- ${rule}\n`;
    });
    instruction += '\n';
  }

  // 添加自定义指令
  if (config.customInstructions) {
    instruction += '**自定义指令**：\n';
    instruction += config.customInstructions + '\n\n';
  }

  // 添加示例
  if (template.examples && template.examples.length > 0) {
    instruction += '**示例**：\n';
    template.examples.forEach((example) => {
      instruction += example + '\n';
    });
    instruction += '\n';
  }

  return instruction;
}

// 主函数
async function main() {
  try {
    // 读取 Hook 输入
    const input = await readStdin();

    // 如果输入为空或只有空白字符，返回空的 additionalContext
    if (!input || input.trim() === '') {
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: ''
        }
      }));
      return;
    }

    const hookData = JSON.parse(input);

    const cwd = hookData.cwd || process.cwd();

    // 查找配置文件
    const configPath = findConfigFile(cwd);
    if (!configPath) {
      // 没有配置文件，不做任何处理
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: ''
        }
      }));
      return;
    }

    // 加载配置
    const config = loadConfig(configPath);
    if (!config || !config.enabled) {
      // 配置未启用
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: ''
        }
      }));
      return;
    }

    // 加载语言模板
    const template = loadLanguageTemplate(config.language);
    if (!template) {
      // 语言模板不存在
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: ''
        }
      }));
      return;
    }

    // 生成语言指令
    const instruction = generateLanguageInstruction(config, template);

    // 输出结果
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: instruction
      }
    }));
  } catch (error) {
    console.error('Hook error:', error);
    // 发生错误时，输出空的 additionalContext
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: ''
      }
    }));
  }
}

main();
