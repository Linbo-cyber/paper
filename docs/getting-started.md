# 快速开始

三种方式创建你的博客。

## 方式一：GitHub 模板（推荐）

1. 打开 [Paper 仓库](https://github.com/Linbo-cyber/paper)
2. 点击右上角绿色的 **Use this template** → **Create a new repository**
3. 填写仓库名，点击创建
4. 克隆你的新仓库：

```bash
git clone https://github.com/你的用户名/你的仓库.git
cd 你的仓库
npm install
npm run build
```

这是最简单的方式，自动继承所有文件和 GitHub Actions 配置。

## 方式二：使用 CLI

```bash
# 创建项目
npx paper-blog init my-blog

# 安装依赖
cd my-blog && npm install

# 构建
npm run build
```

## 方式三：手动克隆

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
