# 写作

## 文章

在 `posts/` 目录下创建 `.md` 文件。

### Frontmatter

每篇文章以 YAML frontmatter 开头：

```markdown
---
title: 文章标题
date: 2026-01-01
tags: [标签1, 标签2]
description: 文章摘要（用于 SEO 和列表页）
cover: /assets/cover.jpg    # 封面图（可选，仅详情页显示）
lang: zh-CN                 # 语言（可选，默认跟随站点配置）
draft: true                 # 草稿（可选，不会被构建）
---
```

### 用 CLI 创建

```bash
npx paper new "文章标题"
# 自动创建 posts/文章标题.md，填好 frontmatter
```

## 独立页面

在 `pages/` 目录下创建 `.md` 文件，例如 `pages/about.md`：

```markdown
---
title: 关于
---

这是关于页面。
```

会生成 `/about.html`。

## Markdown 语法

支持完整的 GFM（GitHub Flavored Markdown）：

### 基础语法

- 标题：`# H1` ~ `###### H6`
- 粗体：`**粗体**`
- 斜体：`*斜体*`
- 链接：`[文字](URL)`
- 图片：`![alt](URL)`
- 代码：`` `行内代码` ``
- 代码块：` ```语言 `
- 引用：`> 引用`
- 列表：`-` 或 `1.`
- 分割线：`---`
- 表格：标准 Markdown 表格语法

### 任务列表

```markdown
- [x] 已完成
- [ ] 未完成
```

渲染为自定义样式的复选框。

### 图片特性

所有文章内图片自动支持：
- 圆角显示
- 加载时骨架动画
- 加载失败显示占位图标

## 提示框 / Callout

两种语法均支持：

### 语法一：`:::` 块

```markdown
:::tip
这是一个提示。
:::

:::warning[自定义标题]
这是一个警告。
:::
```

### 语法二：GitHub 风格

```markdown
> [!NOTE]
> 这是一个注释。

> [!TIP]
> 这是一个提示。

> [!WARNING]
> 这是一个警告。

> [!CAUTION]
> 这是一个注意事项。

> [!IMPORTANT]
> 这是重要信息。
```

两种语法渲染效果相同，支持 5 种类型：`note`、`tip`、`warning`、`caution`、`important`。

下一步：[组件 →](components.md)
