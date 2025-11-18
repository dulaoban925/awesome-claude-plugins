#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// 用户配置文件路径
const USER_CONFIG_PATH = path.join(os.homedir(), '.claude', 'language-config.json');
const LANGUAGES_DIR = path.join(__dirname, '..', 'config', 'languages');
const INIT_HOOK_SCRIPT = path.join(__dirname, 'init-hook.js');

// 加载配置
function loadConfig() {
  if (!fs.existsSync(USER_CONFIG_PATH)) {
    return null;
  }

  try {
    const content = fs.readFileSync(USER_CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load config: ${error.message}`);
    return null;
  }
}

// 保存配置
function saveConfig(config) {
  try {
    const dir = path.dirname(USER_CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(USER_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Failed to save config: ${error.message}`);
    return false;
  }
}

// 列出支持的语言
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

    return languages;
  } catch (error) {
    console.error(`Failed to list languages: ${error.message}`);
    return [];
  }
}

// 显示当前配置
function showConfig() {
  const config = loadConfig();

  if (!config) {
    console.log('No configuration found. Using default settings.');
    console.log('\nDefault configuration:');
    console.log('  Language: zh-CN (简体中文)');
    console.log('  Enabled: true');
    return;
  }

  console.log('Current language configuration:');
  console.log(`  Enabled: ${config.enabled ? 'Yes' : 'No'}`);
  console.log(`  Language: ${config.language}`);

  if (config.customInstructions) {
    console.log(`  Custom Instructions: ${config.customInstructions}`);
  }

  console.log(`\nConfiguration file: ${USER_CONFIG_PATH}`);
}

// 设置语言
function setLanguage(languageCode) {
  // 验证语言代码
  const languages = listLanguages();
  const language = languages.find((l) => l.code === languageCode);

  if (!language) {
    console.error(`Unsupported language: ${languageCode}`);
    console.log('\nAvailable languages:');
    languages.forEach((l) => {
      console.log(`  ${l.code}: ${l.name}`);
    });
    return false;
  }

  // 加载或创建配置
  let config = loadConfig();
  if (!config) {
    config = {
      enabled: true,
      language: languageCode,
      preserveEnglish: {
        technicalTerms: true,
        code: true,
        apiNames: true,
        paths: true,
        variableNames: true,
      },
      localizeContent: {
        explanations: true,
        comments: true,
        documentation: true,
        commitMessages: true,
        errorMessages: true,
      },
      customInstructions: '',
    };
  } else {
    config.language = languageCode;
  }

  if (saveConfig(config)) {
    console.log(`Language set to: ${language.name} (${languageCode})`);
    console.log('\nThe change will take effect in the next conversation.');
    return true;
  }

  return false;
}

// 启用插件
function enablePlugin() {
  let config = loadConfig();
  if (!config) {
    console.error('No configuration found. Please set a language first.');
    console.log('Example: /lang-config set zh-CN');
    return false;
  }

  config.enabled = true;
  if (saveConfig(config)) {
    console.log('Language plugin enabled.');
    console.log('The change will take effect in the next conversation.');
    return true;
  }

  return false;
}

// 禁用插件
function disablePlugin() {
  let config = loadConfig();
  if (!config) {
    console.error('No configuration found.');
    return false;
  }

  config.enabled = false;
  if (saveConfig(config)) {
    console.log('Language plugin disabled.');
    console.log('The change will take effect in the next conversation.');
    return true;
  }

  return false;
}

// 运行 init-hook 脚本
function runInitHook(command = 'init') {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [INIT_HOOK_SCRIPT, command], {
      stdio: 'inherit'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`init-hook.js exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: config-manager.js <command> [args]');
    console.log('\nCommands:');
    console.log('  init              - Initialize language plugin hook');
    console.log('  check             - Check hook configuration status');
    console.log('  remove            - Remove language plugin hook');
    console.log('  show              - Show current configuration');
    console.log('  set <language>    - Set default language');
    console.log('  enable            - Enable the plugin');
    console.log('  disable           - Disable the plugin');
    console.log('  list              - List available languages');
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'init':
        await runInitHook('init');
        break;

      case 'check':
        await runInitHook('check');
        break;

      case 'remove':
        await runInitHook('remove');
        break;

      case 'show':
        showConfig();
        break;

      case 'set':
        if (args.length < 2) {
          console.error('Usage: config-manager.js set <language>');
          console.log('\nRun "config-manager.js list" to see available languages.');
          process.exit(1);
        }
        setLanguage(args[1]);
        break;

      case 'enable':
        enablePlugin();
        break;

      case 'disable':
        disablePlugin();
        break;

      case 'list':
        const languages = listLanguages();
        console.log('Available languages:');
        languages.forEach((lang) => {
          console.log(`  ${lang.code.padEnd(8)} - ${lang.name}`);
        });
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "config-manager.js" without arguments to see usage.');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
