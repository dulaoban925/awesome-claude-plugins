#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

// Claude 设置文件路径
const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');

// 查找插件安装路径
function findPluginPath() {
  try {
    const installedPluginsPath = path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json');
    if (fs.existsSync(installedPluginsPath)) {
      const content = fs.readFileSync(installedPluginsPath, 'utf-8');
      const data = JSON.parse(content);
      if (data.plugins && data.plugins['language@awesome-claude']) {
        return data.plugins['language@awesome-claude'].installPath;
      }
    }
  } catch (error) {
    console.error('Failed to find plugin path:', error.message);
  }
  return null;
}

// 加载 settings.json
function loadSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    return {
      "$schema": "https://json.schemastore.org/claude-code-settings.json",
      "hooks": {}
    };
  }

  try {
    const content = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load settings: ${error.message}`);
    return null;
  }
}

// 保存 settings.json
function saveSettings(settings) {
  try {
    const dir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 创建备份
    if (fs.existsSync(SETTINGS_PATH)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupPath = `${SETTINGS_PATH}.backup.${timestamp}`;
      fs.copyFileSync(SETTINGS_PATH, backupPath);
      console.log(`Backup created: ${backupPath}`);
    }

    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Failed to save settings: ${error.message}`);
    return false;
  }
}

// 检查 hook 是否已存在
function hasLanguageHook(settings) {
  if (!settings.hooks || !settings.hooks.UserPromptSubmit) {
    return false;
  }

  for (const hookConfig of settings.hooks.UserPromptSubmit) {
    if (hookConfig.hooks) {
      for (const hook of hookConfig.hooks) {
        if (hook.command && hook.command.includes('language-hook.js')) {
          return true;
        }
      }
    }
  }

  return false;
}

// 初始化 hook
function initHook() {
  console.log('Initializing language plugin hook...\n');

  // 查找插件路径
  const pluginPath = findPluginPath();
  if (!pluginPath) {
    console.error('Error: Cannot find language plugin installation path.');
    console.log('Please ensure the plugin is properly installed.');
    process.exit(1);
  }

  console.log(`Plugin path: ${pluginPath}`);

  // 构建 hook 命令
  const hookScriptPath = path.join(pluginPath, 'scripts', 'language-hook.js');
  if (!fs.existsSync(hookScriptPath)) {
    console.error(`Error: Hook script not found at ${hookScriptPath}`);
    process.exit(1);
  }

  console.log(`Hook script: ${hookScriptPath}\n`);

  // 加载 settings
  const settings = loadSettings();
  if (!settings) {
    console.error('Error: Failed to load settings.json');
    process.exit(1);
  }

  // 检查是否已存在
  if (hasLanguageHook(settings)) {
    console.log('✓ Language plugin hook is already configured.');
    console.log('\nNo changes needed.');
    return;
  }

  // 添加 hook
  if (!settings.hooks) {
    settings.hooks = {};
  }

  const languageHook = {
    matcher: "*",
    hooks: [
      {
        type: "command",
        command: `node ${hookScriptPath}`,
        description: "Inject language instruction based on user configuration"
      }
    ]
  };

  if (!settings.hooks.UserPromptSubmit) {
    settings.hooks.UserPromptSubmit = [languageHook];
  } else {
    settings.hooks.UserPromptSubmit.push(languageHook);
  }

  // 保存配置
  if (saveSettings(settings)) {
    console.log('✓ Language plugin hook has been successfully configured.\n');
    console.log('Hook configuration:');
    console.log(`  Event: UserPromptSubmit`);
    console.log(`  Matcher: *`);
    console.log(`  Command: node ${hookScriptPath}\n`);
    console.log('The hook will take effect immediately in new conversations.');
    console.log('\nNext steps:');
    console.log('  1. Configure your language preference: /lang-config set zh-CN');
    console.log('  2. Start a new conversation to test the plugin');
  } else {
    console.error('Error: Failed to save settings.');
    process.exit(1);
  }
}

// 检查 hook 状态
function checkHook() {
  console.log('Checking language plugin hook status...\n');

  const settings = loadSettings();
  if (!settings) {
    console.error('Error: Failed to load settings.json');
    process.exit(1);
  }

  if (hasLanguageHook(settings)) {
    console.log('✓ Language plugin hook is configured.\n');

    // 显示 hook 配置
    if (settings.hooks && settings.hooks.UserPromptSubmit) {
      for (const hookConfig of settings.hooks.UserPromptSubmit) {
        if (hookConfig.hooks) {
          for (const hook of hookConfig.hooks) {
            if (hook.command && hook.command.includes('language-hook.js')) {
              console.log('Hook configuration:');
              console.log(`  Event: UserPromptSubmit`);
              console.log(`  Matcher: ${hookConfig.matcher || '*'}`);
              console.log(`  Command: ${hook.command}`);
              if (hook.description) {
                console.log(`  Description: ${hook.description}`);
              }
            }
          }
        }
      }
    }
  } else {
    console.log('✗ Language plugin hook is NOT configured.\n');
    console.log('To configure the hook, run:');
    console.log('  /lang-config init');
  }
}

// 移除 hook
function removeHook() {
  console.log('Removing language plugin hook...\n');

  const settings = loadSettings();
  if (!settings) {
    console.error('Error: Failed to load settings.json');
    process.exit(1);
  }

  if (!hasLanguageHook(settings)) {
    console.log('Language plugin hook is not configured. Nothing to remove.');
    return;
  }

  // 移除 hook
  if (settings.hooks && settings.hooks.UserPromptSubmit) {
    settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(hookConfig => {
      if (hookConfig.hooks) {
        hookConfig.hooks = hookConfig.hooks.filter(hook => {
          return !hook.command || !hook.command.includes('language-hook.js');
        });
        return hookConfig.hooks.length > 0;
      }
      return true;
    });

    // 如果 UserPromptSubmit 为空，删除该键
    if (settings.hooks.UserPromptSubmit.length === 0) {
      delete settings.hooks.UserPromptSubmit;
    }
  }

  // 保存配置
  if (saveSettings(settings)) {
    console.log('✓ Language plugin hook has been removed.\n');
    console.log('The change will take effect in new conversations.');
  } else {
    console.error('Error: Failed to save settings.');
    process.exit(1);
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'init';

  switch (command) {
    case 'init':
      initHook();
      break;

    case 'check':
      checkHook();
      break;

    case 'remove':
      removeHook();
      break;

    default:
      console.log('Usage: init-hook.js [command]');
      console.log('\nCommands:');
      console.log('  init     - Initialize language plugin hook (default)');
      console.log('  check    - Check hook configuration status');
      console.log('  remove   - Remove language plugin hook');
      process.exit(1);
  }
}

main();
