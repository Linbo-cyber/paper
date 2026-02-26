# 主题

## 主题结构

```
themes/default/
├── templates/          # HTML 模板
│   ├── layout.html     # 全局布局
│   ├── index.html      # 首页/列表
│   ├── post.html       # 文章详情
│   ├── archive.html    # 归档
│   ├── tags.html       # 标签
│   ├── page.html       # 独立页面
│   └── 404.html        # 404 页面
└── assets/             # 静态资源
    ├── style.css       # 主样式
    ├── components.css  # 组件样式
    ├── components.js   # 组件脚本
    ├── search.js       # 搜索功能
    ├── lang.js         # 语言切换
    ├── prism.js        # 代码高亮
    └── prism.css       # 代码高亮样式
```

## 模板语法

Paper 使用简单的 mustache 风格模板引擎：

### 变量

```html
{{title}}       <!-- 转义输出 -->
{{{content}}}   <!-- 原始 HTML（不转义） -->
```

### 条件

```html
{{#if hasToc}}
  <nav class="toc">...</nav>
{{/if}}

{{#unless hasPrev}}
  <span class="disabled">没有上一篇</span>
{{/unless}}
```

### 循环

```html
{{#each posts}}
  <article>
    <h2><a href="{{url}}">{{title}}</a></h2>
    <time>{{date}}</time>
  </article>
{{/each}}
```

支持嵌套。

## 创建自定义主题

```bash
# 复制默认主题
cp -r themes/default themes/my-theme

# 修改 paper.config.js
# theme: 'my-theme'
```

## 可用模板变量

### 全局变量

| 变量 | 说明 |
|------|------|
| `siteTitle` | 站点标题 |
| `siteDescription` | 站点描述 |
| `siteUrl` | 站点 URL |
| `basePath` | 基础路径 |
| `author` | 作者名 |
| `language` | 当前语言 |
| `navItems` | 导航项（`label`, `url`） |
| `poweredBy` | "Powered by Paper" |
| `commentsEnabled` | 评论是否启用 |

### 文章变量

| 变量 | 说明 |
|------|------|
| `title` | 文章标题 |
| `date` | 发布日期 |
| `html` | 文章 HTML |
| `tocHtml` | 目录 HTML |
| `readingTimeText` | 阅读时间 |
| `cover` | 封面图 URL |
| `hasCover` | 是否有封面 |
| `hasToc` | 是否有目录 |
| `hasTags` | 是否有标签 |
| `tagList` | 标签列表（`tag`, `tagUrl`） |
| `hasPrev` / `hasNext` | 上/下一篇 |
| `prevTitle` / `nextTitle` | 上/下一篇标题 |
| `prevUrl` / `nextUrl` | 上/下一篇 URL |
| `hasRelated` | 是否有相关文章 |
| `relatedPosts` | 相关文章（`relTitle`, `relUrl`, `relDate`） |

## 深色模式

默认主题支持三种模式：自动 / 亮色 / 暗色。

通过 `<html data-theme="auto|light|dark">` 控制，用户选择保存在 localStorage。

CSS 变量定义在 `style.css` 顶部，修改颜色只需调整变量值。

下一步：[部署 →](deployment.md)
