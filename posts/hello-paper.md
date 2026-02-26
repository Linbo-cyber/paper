---
title: 欢迎使用 Paper
date: 2026-02-26
tags: [Paper, 入门]
description: Paper 是一个极简的静态博客框架，纸质暖色调，为 GitHub Pages 而生。
---

## 什么是 Paper

Paper 是一个零依赖（几乎）的静态博客生成器。用 Markdown 写文章，一条命令构建，直接部署到 GitHub Pages。

特性一览：

- 📝 Markdown 写作 + YAML frontmatter
- 🎨 纸质暖色调 + 深色模式自适应
- 🔍 客户端全文搜索（Ctrl+K）
- 📑 自动生成目录（TOC）
- 🏷️ 标签系统 + 归档页
- 💬 评论系统（utterances）
- 📡 RSS + Atom 订阅
- 🗺️ 自动 Sitemap + robots.txt
- ⚡ 代码高亮（Prism.js）
- 📖 阅读时间估算
- 📄 分页
- 🚀 GitHub Actions 一键部署

## 快速开始

```bash
# 克隆
git clone https://github.com/Linbo-cyber/paper.git my-blog
cd my-blog

# 安装依赖
npm install

# 写文章
# 在 posts/ 目录下创建 .md 文件

# 构建
npm run build

# 输出在 dist/ 目录
```

## 文章格式

在 `posts/` 目录下创建 `.md` 文件，文件名即为 URL slug：

```markdown
---
title: 我的第一篇文章
date: 2026-01-01
tags: [随笔, 技术]
description: 这是文章摘要
lang: zh-CN
draft: false
---

正文内容，支持完整的 Markdown 语法。
```

### Frontmatter 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| title | ✅ | 文章标题 |
| date | ✅ | 发布日期 |
| tags | ❌ | 标签数组 |
| description | ❌ | 摘要 |
| lang | ❌ | 语言（默认跟随站点配置） |
| draft | ❌ | 设为 true 则不会构建 |

## 代码高亮

支持所有主流语言：

```javascript
function hello(name) {
  console.log(`Hello, ${name}!`);
  return { greeting: true };
}
```

```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b
```

## 自定义页面

在 `pages/` 目录下创建 `.md` 文件，会生成为根路径下的独立页面。比如 `pages/about.md` → `/about.html`。

## 主题

默认主题在 `themes/default/` 下。你可以：

- 修改 `assets/style.css` 调整样式
- 修改 `templates/` 下的 HTML 模板
- 创建新主题目录，在 `paper.config.js` 中切换

## 部署

推送到 GitHub，Actions 会自动构建并部署到 Pages。就这么简单。
