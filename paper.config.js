module.exports = {
  // Site info
  title: 'My Blog',
  description: 'A minimal blog built with Paper',
  url: 'https://example.github.io',
  author: 'Your Name',
  language: 'zh-CN',

  // Supported languages for i18n (first is default)
  languages: ['zh-CN', 'en'],

  // i18n strings
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
      prev: '上一篇',
      next: '下一篇',
      noResults: '没有找到结果',
      poweredBy: '由 Paper 驱动',
      home: '首页',
      allPosts: '所有文章',
      taggedWith: '标签：',
      page: '页',
      rss: '订阅',
    },
    en: {
      name: 'EN',
      posts: 'Posts',
      archive: 'Archive',
      tags: 'Tags',
      about: 'About',
      search: 'Search',
      toc: 'Table of Contents',
      readingTime: 'min read',
      prev: 'Previous',
      next: 'Next',
      noResults: 'No results found',
      poweredBy: 'Powered by Paper',
      home: 'Home',
      allPosts: 'All Posts',
      taggedWith: 'Tagged: ',
      page: 'Page',
      rss: 'RSS',
    },
  },

  // Posts per page
  postsPerPage: 10,

  // Theme
  theme: 'default',

  // Comments (utterances)
  comments: {
    enabled: true,
    repo: 'your-username/your-repo',
    issueTerm: 'pathname',
    label: 'comment',
  },

  // Navigation links
  nav: [
    { key: 'posts', url: '/' },
    { key: 'archive', url: '/archive.html' },
    { key: 'tags', url: '/tags.html' },
    { key: 'about', url: '/about.html' },
  ],

  // RSS
  rss: true,

  // Sitemap
  sitemap: true,

  // Code highlighting theme (prism)
  codeTheme: 'tomorrow',
};
