# Paper

极简静态博客框架。纸质暖色调，4 个依赖，50ms 构建，为 GitHub Pages 而生。

[![Use this template](https://img.shields.io/badge/-Use%20this%20template-2ea44f?style=for-the-badge&logo=github)](https://github.com/Linbo-cyber/paper/generate)

[Demo](https://linbo-cyber.github.io/paper/) · [文档](docs/)

## 开始使用

### 方式一：GitHub 模板（推荐）

点击上方 **Use this template** 按钮，或仓库页面右上角的绿色按钮，直接创建你自己的博客仓库。

然后：

```bash
git clone https://github.com/你的用户名/你的仓库.git
cd 你的仓库
npm install && npm run build
```

### 方式二：手动克隆

```bash
git clone https://github.com/Linbo-cyber/paper.git my-blog
cd my-blog && rm -rf .git && git init
npm install && npm run build
```

### 方式三：CLI

```bash
npx paper-blog init my-blog
cd my-blog && npm install && npm run build
```

## 写文章

```bash
npx paper new "文章标题"
```

```markdown
---
title: 文章标题
date: 2026-01-01
tags: [标签]
description: 摘要
cover: /assets/cover.jpg
---

正文，支持完整 GFM 语法。
```

## 特性

- Markdown + YAML frontmatter
- 纸质暖色调 + 深色模式
- 客户端搜索（Ctrl+K）
- 自动目录、标签、归档、分页
- 代码高亮（Prism.js）
- 评论（utterances）
- RSS / Atom / Sitemap
- 多语言 i18n
- 阅读时间 + 进度条
- 打印友好
- GitHub Actions 一键部署

## 内置组件

```markdown
{% player src="song.mp3" title="歌名" artist="歌手" %}

{% card icon="📝" title="标题" text="描述" %}

{% btn label="按钮" href="/link" style="primary" %}

{% counter key="likes" label="点赞" icon="👍" %}
```

提示框：

```markdown
:::tip
这是提示
:::

> [!WARNING]
> 这是警告
```

## 配置

编辑 `paper.config.js`：

```js
module.exports = {
  title: 'My Blog',
  url: 'https://username.github.io',
  basePath: '',        // 项目页面设为 '/repo-name'
  author: 'Your Name',
  language: 'zh-CN',
  comments: { enabled: true, repo: 'user/repo' },
};
```

## 部署

推送到 GitHub → Settings → Pages → Source: GitHub Actions。完成。

内置 `.github/workflows/deploy.yml`，无需额外配置。

## 文档

详细文档见 [docs/](docs/)：

- [快速开始](docs/getting-started.md)
- [配置](docs/configuration.md)
- [写作](docs/writing.md)
- [组件](docs/components.md)
- [主题](docs/theming.md)
- [部署](docs/deployment.md)
- [进阶](docs/advanced.md)

## 技术栈

| 依赖 | 用途 |
|------|------|
| marked | Markdown 解析 |
| gray-matter | Frontmatter |
| feed | RSS/Atom |
| chokidar | 文件监听 |

单文件构建脚本，无打包工具，构建时间 ~50ms。

## License

MIT
