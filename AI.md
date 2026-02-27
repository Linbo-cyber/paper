# Paper 博客 — AI 部署指南

你正在帮助用户部署一个 Paper 静态博客。请按以下步骤操作：

## 环境要求

- Node.js >= 18
- npm
- Git

## 部署步骤

### 1. 创建项目

```bash
git clone https://github.com/Linbo-cyber/paper.git my-blog
cd my-blog
rm -rf .git && git init
npm install
```

### 2. 配置站点

编辑 `paper.config.js`，需要用户提供以下信息（直接询问用户）：

| 字段 | 说明 | 示例 |
|------|------|------|
| `title` | 博客标题 | `'My Blog'` |
| `description` | 博客描述 | `'一个极简博客'` |
| `url` | 站点 URL | `'https://username.github.io'` |
| `basePath` | 路径前缀（项目页面填仓库名，用户页面留空） | `'/blog'` 或 `''` |
| `author` | 作者名 | `'Your Name'` |
| `language` | 默认语言 | `'zh-CN'` 或 `'en'` |

评论系统（可选）：
| 字段 | 说明 |
|------|------|
| `comments.repo` | GitHub 仓库（格式：`'username/repo'`） |

友链（可选）：
| 字段 | 说明 |
|------|------|
| `links` | 数组，每项 `{ name, url, desc }` |

### 3. 删除示例文章

```bash
rm posts/hello-paper.md posts/markdown-test.md posts/components-demo.md posts/new-features.md
```

### 4. 创建用户的第一篇文章

在 `posts/` 下创建 `.md` 文件：

```markdown
---
title: 文章标题
date: YYYY-MM-DD
tags: [标签]
description: 摘要
---

正文内容
```

### 5. 编辑关于页面

编辑 `pages/about.md`，写入用户的自我介绍。

### 6. 构建并验证

```bash
npm run build
```

确认 `dist/` 目录生成正常。

### 7. 推送到 GitHub

```bash
git add -A
git commit -m "init: my paper blog"
git remote add origin https://github.com/用户名/仓库名.git
git push -u origin main
```

### 8. 启用 GitHub Pages

告诉用户：
1. 进入 GitHub 仓库 → Settings → Pages
2. Source 选择 **GitHub Actions**
3. 等待 Actions 构建完成
4. 访问 `https://用户名.github.io/仓库名/`

## 可用组件（告知用户）

```markdown
{% player src="音频URL" title="歌名" artist="歌手" %}
{% card icon="📝" title="标题" text="描述" %}
{% btn label="按钮" href="/link" style="primary" %}
{% counter key="likes" label="点赞" icon="👍" %}

:::tip
提示框内容
:::
```

## 从 Hux Blog 迁移

如果用户有现有的 Hux Blog (Jekyll)：

```bash
node bin/migrate-hux.js <hux-blog目录> --out ./my-blog
```

自动转换 `_config.yml`、文章 frontmatter、图片路径。

## 注意事项

- `basePath` 必须正确，否则资源路径会 404
- 项目页面（如 `username.github.io/blog`）需设 `basePath: '/blog'`
- 用户页面（如 `username.github.io`）设 `basePath: ''`
- 构建输出在 `dist/`，不要手动修改
- `.github/workflows/deploy.yml` 已内置，推送即部署
