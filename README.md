# Paper

极简静态博客框架。纸质暖色调，为 GitHub Pages 而生。

## 特性

- 📝 Markdown + YAML frontmatter
- 🎨 纸质暖色调 + 深色模式自适应
- 🔍 客户端全文搜索（Ctrl+K）
- 📑 自动目录（TOC）
- 🏷️ 标签 + 归档
- 💬 评论（utterances）
- 📡 RSS / Atom
- 🗺️ Sitemap + robots.txt
- ⚡ 代码高亮（Prism.js）
- 📖 阅读时间估算
- 📄 分页
- 🌐 多语言 i18n
- 🖨️ 打印友好
- 🚀 GitHub Actions 一键部署
- 🎵 内置音乐播放器组件
- 🃏 卡片 + 按钮 + 计数器组件
- 🖼️ 图片骨架加载 + 错误状态

## 快速开始

```bash
# 1. 用这个模板创建你的博客
git clone https://github.com/Linbo-cyber/paper.git my-blog
cd my-blog
rm -rf .git && git init

# 2. 安装
npm install

# 3. 配置
# 编辑 paper.config.js

# 4. 写文章
# 在 posts/ 下创建 .md 文件

# 5. 构建
npm run build
# 输出在 dist/
```

## 目录结构

```
my-blog/
├── posts/              # 文章（Markdown）
├── pages/              # 独立页面（Markdown）
├── themes/
│   └── default/
│       ├── templates/  # HTML 模板
│       └── assets/     # CSS / JS
├── paper.config.js     # 站点配置
├── build.js            # 构建脚本
├── favicon.svg         # 站点图标
└── .github/
    └── workflows/
        └── deploy.yml  # 自动部署
```

## 文章格式

```markdown
---
title: 文章标题
date: 2026-01-01
tags: [标签1, 标签2]
description: 文章摘要
draft: false
---

正文内容...
```

## 配置

编辑 `paper.config.js`：

```js
module.exports = {
  title: 'My Blog',
  description: '...',
  url: 'https://username.github.io',
  author: 'Your Name',
  language: 'zh-CN',
  postsPerPage: 10,
  // ...
};
```

## 内置组件

在 Markdown 中使用 `{% %}` 语法插入组件。

### 音乐播放器

```markdown
{% player src="音频URL" title="标题" artist="作者" cover="封面URL" loop="true" autoplay="false" volume="true" loopBtn="true" %}
```

- `src` 必填，其余可选
- `loop`: 初始循环状态（默认 false）
- `autoplay`: 自动播放（默认 false）
- 未设置 `cover` 时显示音乐图标
- 未设置 `artist` 时不显示作者行

### 卡片

```markdown
{% card icon="🪦" title="标题" subtitle="副标题" text="描述" align="center" style="自定义CSS" %}
卡片内容（可选，支持 HTML）
{% endcard %}
```

无内容时可省略 `{% endcard %}`。

### 计数器按钮

```markdown
{% counter key="唯一标识" label="按钮文字" icon="🙏" %}
```

点击后计数 +1，基于 localStorage 持久化，每人限点一次。

### 按钮

```markdown
{% btn label="文字" href="链接" style="primary|accent" size="sm|lg" %}
```

### 图片

所有文章内的图片自动启用：
- 圆角显示
- 加载时显示骨架动画 + 图片图标
- 加载失败显示破碎图片图标

## 部署到 GitHub Pages

1. 推送到 GitHub
2. Settings → Pages → Source 选 "GitHub Actions"
3. 推送后自动构建部署

## 自定义主题

复制 `themes/default/` 为新目录，修改模板和样式，在配置中切换 `theme` 字段。

模板使用简单的 mustache 语法：
- `{{variable}}` — 转义输出
- `{{{variable}}}` — 原始 HTML
- `{{#if key}}...{{/if}}` — 条件
- `{{#each key}}...{{/each}}` — 循环

## 依赖

- [marked](https://github.com/markedjs/marked) — Markdown 解析
- [gray-matter](https://github.com/jonschlinkert/gray-matter) — Frontmatter 解析
- [feed](https://github.com/jpmonette/feed) — RSS/Atom 生成
- [Prism.js](https://prismjs.com/) — 代码高亮

## License

MIT
