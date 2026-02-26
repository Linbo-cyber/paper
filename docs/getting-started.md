# 快速开始

三步创建你的博客。

## 方式一：使用 CLI（推荐）

```bash
# 创建项目
npx paper-blog init my-blog

# 安装依赖
cd my-blog && npm install

# 构建
npm run build
```

构建产物在 `dist/` 目录，可以直接部署。

## 方式二：克隆模板

```bash
git clone https://github.com/Linbo-cyber/paper.git my-blog
cd my-blog
rm -rf .git && git init
npm install
```

## 写第一篇文章

```bash
# 用 CLI 创建
npx paper new "我的第一篇文章"

# 或者手动创建 posts/my-first-post.md
```

文章格式：

```markdown
---
title: 我的第一篇文章
date: 2026-01-01
tags: [随笔]
description: 这是摘要
---

正文内容，支持完整的 Markdown 语法。
```

## 本地预览

```bash
npm run build
# 用任意静态服务器预览 dist/
# 例如: npx serve dist
```

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库
2. 推送代码
3. Settings → Pages → Source 选 **GitHub Actions**
4. 每次推送自动构建部署

项目已内置 `.github/workflows/deploy.yml`，无需额外配置。

## 目录结构

```
my-blog/
├── posts/              # 文章（Markdown）
├── pages/              # 独立页面（Markdown）
├── themes/default/     # 主题
│   ├── templates/      # HTML 模板
│   └── assets/         # CSS / JS
├── paper.config.js     # 站点配置
├── build.js            # 构建脚本
├── favicon.svg         # 站点图标
└── dist/               # 构建输出（自动生成）
```

下一步：[配置你的博客 →](configuration.md)
