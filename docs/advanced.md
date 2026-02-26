# 进阶

## CLI 命令

```bash
npx paper init [dir]       # 创建新博客
npx paper new <title>      # 创建新文章
npx paper build            # 构建站点
npx paper dev              # 开发模式（监听文件变更，自动重建）
npx paper clean            # 清理 dist/
```

## 构建性能

Paper 的构建脚本是单文件 Node.js，无打包工具依赖。

典型性能：
- 4 篇文章：~50ms
- 50 篇文章：~200ms
- 100 篇文章：~400ms

## 搜索

内置客户端全文搜索，快捷键 `Ctrl+K` / `⌘+K`。

构建时自动生成 `search-index.json`，包含所有文章的标题、URL、日期、摘要和标签。搜索在浏览器端完成，无需后端。

## SEO

自动生成：
- `<meta>` 标签（description, og:title, og:description）
- `sitemap.xml`
- `robots.txt`
- RSS (`feed.xml`) 和 Atom (`atom.xml`)

文章的 `description` frontmatter 用于 SEO 摘要，建议每篇都填写。

## 阅读进度条

文章页面顶部自动显示阅读进度条，随滚动更新。

## 返回顶部

滚动超过一定距离后，右下角出现返回顶部按钮。

## 打印

所有页面支持打印友好样式，`Ctrl+P` 打印时自动隐藏导航、侧边栏等非内容元素。

## 技术栈

Paper 只依赖 4 个 npm 包：

| 包 | 用途 |
|---|------|
| [marked](https://github.com/markedjs/marked) | Markdown → HTML |
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | YAML frontmatter 解析 |
| [feed](https://github.com/jpmonette/feed) | RSS/Atom 生成 |
| [chokidar](https://github.com/paulmillr/chokidar) | 文件监听（dev 模式） |

代码高亮使用预下载的 [Prism.js](https://prismjs.com/)，无运行时 CDN 依赖。

## 模板引擎

Paper 内置轻量模板引擎，支持：
- `{{var}}` — 转义输出
- `{{{var}}}` — 原始 HTML
- `{{#if key}}...{{/if}}` — 条件渲染
- `{{#unless key}}...{{/unless}}` — 反向条件
- `{{#each key}}...{{/each}}` — 循环
- 支持嵌套

无需学习额外模板语言。

## 组件系统

`{% %}` 短代码在 Markdown 渲染前被提取为占位符，避免被 Markdown 解析器转义。渲染后再替换回组件 HTML。

这意味着组件内容不会被 Markdown 干扰，可以安全使用任何 HTML。
