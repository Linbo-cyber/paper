# 配置

所有配置在 `paper.config.js` 中。

## 基础配置

```js
module.exports = {
  // 站点信息
  title: 'My Blog',           // 站点标题
  description: '...',          // 站点描述（用于 SEO 和 RSS）
  url: 'https://example.com',  // 站点 URL（不含尾部斜杠）
  author: 'Your Name',         // 作者名
  language: 'zh-CN',           // 默认语言

  // GitHub Pages 项目页面需要设置 basePath
  // 例如仓库名为 blog，则设为 '/blog'
  // 用户页面（username.github.io）设为 ''
  basePath: '',

  // 每页文章数
  postsPerPage: 10,

  // 主题
  theme: 'default',
};
```

## 导航栏

```js
nav: [
  { key: 'posts', url: '/' },
  { key: 'archive', url: '/archive.html' },
  { key: 'tags', url: '/tags.html' },
  { key: 'about', url: '/about.html' },
],
```

`key` 对应 i18n 中的翻译键。

## 评论（utterances）

```js
comments: {
  enabled: true,
  repo: 'username/repo',      // GitHub 仓库
  issueTerm: 'pathname',       // Issue 匹配方式
  label: 'comment',            // Issue 标签
},
```

需要先在仓库安装 [utterances app](https://github.com/apps/utterances)。

## 多语言

```js
languages: ['zh-CN', 'en'],   // 支持的语言，第一个为默认

i18n: {
  'zh-CN': {
    name: '中文',
    posts: '文章',
    archive: '归档',
    tags: '标签',
    about: '关于',
    search: '搜索',
    toc: '目录',
    readingTime: '分钟阅读',
    // ...
  },
  en: {
    name: 'EN',
    posts: 'Posts',
    archive: 'Archive',
    // ...
  },
},
```

## RSS / Sitemap

```js
rss: true,       // 生成 feed.xml 和 atom.xml
sitemap: true,    // 生成 sitemap.xml 和 robots.txt
```

## 代码高亮

```js
codeTheme: 'tomorrow',  // Prism.js 主题
```

内置 Prism.js，支持常见语言，无需额外配置。

## 完整配置示例

```js
module.exports = {
  title: 'Paper Blog',
  description: '一个用 Paper 构建的极简博客',
  url: 'https://username.github.io',
  basePath: '',
  author: 'Your Name',
  language: 'zh-CN',
  languages: ['zh-CN', 'en'],
  postsPerPage: 10,
  theme: 'default',
  rss: true,
  sitemap: true,
  codeTheme: 'tomorrow',

  comments: {
    enabled: true,
    repo: 'username/repo',
    issueTerm: 'pathname',
    label: 'comment',
  },

  nav: [
    { key: 'posts', url: '/' },
    { key: 'archive', url: '/archive.html' },
    { key: 'tags', url: '/tags.html' },
    { key: 'about', url: '/about.html' },
  ],

  i18n: {
    'zh-CN': { /* ... */ },
    en: { /* ... */ },
  },
};
```

下一步：[写作 →](writing.md)
