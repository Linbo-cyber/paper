#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cmd = process.argv[2];
const args = process.argv.slice(3);

const HELP = `
  Paper — 极简静态博客框架

  用法:
    npx paper <command> [options]

  命令:
    init [dir]       创建新博客
    new <title>      创建新文章
    build            构建站点
    dev              开发模式（监听变更）
    clean            清理 dist/
    migrate <dir>    从 Hux Blog (Jekyll) 迁移

  选项:
    --help, -h       显示帮助
    --version, -v    显示版本

  示例:
    npx paper init my-blog
    npx paper new "我的第一篇文章"
    npx paper build
`;

function die(msg) { console.error('✗ ' + msg); process.exit(1); }
function ok(msg) { console.log('✓ ' + msg); }
function info(msg) { console.log('  ' + msg); }

// ── init ──

function init(dir) {
  dir = dir || 'my-blog';
  const dest = path.resolve(dir);

  if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
    die(`目录 ${dir} 已存在且非空`);
  }

  console.log(`\n  创建博客: ${dir}\n`);

  // Clone template structure
  fs.mkdirSync(dest, { recursive: true });

  // Find package root (where build.js lives)
  let pkgRoot = __dirname;
  // If running from bin/, go up one level
  if (path.basename(pkgRoot) === 'bin') pkgRoot = path.dirname(pkgRoot);

  // Copy scaffold files
  const scaffold = [
    'build.js',
    'paper.config.js',
    'favicon.svg',
    '.gitignore',
  ];

  for (const f of scaffold) {
    const src = path.join(pkgRoot, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(dest, f));
    }
  }

  // Copy directories
  const dirs = ['themes', 'pages', '.github'];
  for (const d of dirs) {
    const src = path.join(pkgRoot, d);
    if (fs.existsSync(src)) {
      copyDirSync(src, path.join(dest, d));
    }
  }

  // Create posts/ with a hello post
  const postsDir = path.join(dest, 'posts');
  fs.mkdirSync(postsDir, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(postsDir, 'hello.md'), `---
title: Hello Paper
date: ${today}
tags: [paper]
description: 我的第一篇文章
---

欢迎使用 Paper！这是你的第一篇文章。

## 开始写作

编辑 \`posts/\` 目录下的 Markdown 文件即可。

## 配置

编辑 \`paper.config.js\` 自定义你的博客。

## 部署

推送到 GitHub，自动部署到 GitHub Pages。
`);

  // Create package.json
  const pkg = {
    name: dir,
    version: '1.0.0',
    private: true,
    scripts: {
      build: 'node build.js',
      dev: 'node build.js --watch',
      clean: 'rm -rf dist',
    },
    dependencies: {
      marked: '^15.0.0',
      'gray-matter': '^4.0.3',
      feed: '^4.2.2',
      chokidar: '^4.0.0',
    },
  };
  fs.writeFileSync(path.join(dest, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

  ok('项目已创建');
  console.log(`
  下一步:
    cd ${dir}
    npm install
    npm run build

  编辑 paper.config.js 配置你的博客
  在 posts/ 下写 Markdown 文章
  推送到 GitHub 自动部署
`);
}

// ── new ──

function newPost(title) {
  if (!title) die('请指定文章标题: paper new "标题"');

  const slug = title
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .replace(/^-|-$/g, '')
    || 'untitled';

  const postsDir = path.resolve('posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const filename = `${slug}.md`;
  const filepath = path.join(postsDir, filename);

  if (fs.existsSync(filepath)) {
    die(`文件已存在: posts/${filename}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const content = `---
title: ${title}
date: ${today}
tags: []
description: 
---

`;

  fs.writeFileSync(filepath, content);
  ok(`posts/${filename}`);
}

// ── build / dev ──

function build() {
  const buildScript = path.resolve('build.js');
  if (!fs.existsSync(buildScript)) {
    die('找不到 build.js，请确认在博客根目录下运行');
  }
  execSync('node build.js', { stdio: 'inherit' });
}

function dev() {
  const buildScript = path.resolve('build.js');
  if (!fs.existsSync(buildScript)) {
    die('找不到 build.js，请确认在博客根目录下运行');
  }
  execSync('node build.js --watch', { stdio: 'inherit' });
}

function clean() {
  const dist = path.resolve('dist');
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true });
    ok('dist/ 已清理');
  } else {
    info('dist/ 不存在');
  }
}

// ── utils ──

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// ── main ──

switch (cmd) {
  case 'init':
    init(args[0]);
    break;
  case 'new':
    newPost(args.join(' '));
    break;
  case 'build':
    build();
    break;
  case 'dev':
    dev();
    break;
  case 'clean':
    clean();
    break;
  case 'migrate':
    if (!args[0]) die('请指定 Hux Blog 目录: paper migrate <hux-blog-dir> [--out <dir>]');
    execSync(`node ${path.join(__dirname, 'migrate-hux.js')} ${args.map(a => `"${a}"`).join(' ')}`, { stdio: 'inherit' });
    break;
  case '-v':
  case '--version':
    console.log(require(path.resolve(__dirname, '..', 'package.json')).version);
    break;
  case '-h':
  case '--help':
  case undefined:
    console.log(HELP);
    break;
  default:
    die(`未知命令: ${cmd}\n运行 paper --help 查看帮助`);
}
