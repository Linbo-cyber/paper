#!/usr/bin/env node
'use strict';

/**
 * migrate-hux — 从 Hux Blog (Jekyll) 一键迁移到 Paper
 *
 * 用法:
 *   node migrate-hux.js <hux-blog-dir> [--out <output-dir>]
 *
 * 功能:
 *   1. 读取 _config.yml → 生成 paper.config.js
 *   2. 迁移 _posts/ 下所有文章（转换 frontmatter 格式）
 *   3. 迁移 img/ 到 static/
 *   4. 迁移 about 页面
 *   5. 输出迁移报告
 */

const fs = require('fs');
const path = require('path');

// ── Minimal YAML parser (enough for Jekyll _config.yml) ──

function parseYamlSimple(text) {
  const result = {};
  let currentKey = null;
  let currentArray = null;

  for (const line of text.split('\n')) {
    // Skip comments and empty
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;

    // Array item under a key
    const arrMatch = line.match(/^\s+-\s+(.*)/);
    if (arrMatch && currentArray) {
      currentArray.push(arrMatch[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    // Key: value
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const key = kvMatch[1];
      let val = kvMatch[2].trim();

      // Strip inline YAML comments (but not inside quotes)
      if (!val.startsWith('"') && !val.startsWith("'")) {
        val = val.replace(/\s+#.*$/, '');
      } else {
        // Quoted value: extract content between quotes
        const qm = val.match(/^(["'])(.*)\1\s*(#.*)?$/);
        if (qm) val = qm[2];
      }

      if (val === '' || val === '[]') {
        // Could be start of array or empty
        currentKey = key;
        currentArray = [];
        result[key] = currentArray;
      } else {
        currentKey = key;
        currentArray = null;
        // Clean quotes
        result[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }

  return result;
}

// ── Parse Jekyll frontmatter ──

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  const fmLines = match[1].split('\n');
  let currentKey = null;
  let currentArr = null;

  for (const line of fmLines) {
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;

    const arrItem = line.match(/^\s+-\s+(.*)/);
    if (arrItem && currentArr) {
      currentArr.push(arrItem[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }

    const kv = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kv) {
      const key = kv[1];
      let val = kv[2].trim();

      if (val === '' || val.startsWith('[') === false && val === '') {
        currentKey = key;
        currentArr = [];
        meta[key] = currentArr;
      } else if (val.startsWith('[') && val.endsWith(']')) {
        // Inline array: [tag1, tag2]
        meta[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        currentKey = key;
        currentArr = null;
      } else {
        val = val.replace(/^["']|["']$/g, '').replace(/\\"/g, '"');
        meta[key] = val;
        currentKey = key;
        currentArr = null;
      }
    }
  }

  return { meta, body: match[2] };
}

// ── Convert a Hux post to Paper format ──

function convertPost(filename, content, imgMap) {
  const { meta, body } = parseFrontmatter(content);

  // Build Paper frontmatter
  const paperMeta = {};
  paperMeta.title = meta.title || filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.(md|markdown)$/, '');
  paperMeta.date = meta.date ? meta.date.split(' ')[0] : filename.slice(0, 10);

  if (meta.tags) {
    paperMeta.tags = Array.isArray(meta.tags) ? meta.tags : [meta.tags];
  } else {
    paperMeta.tags = [];
  }

  if (meta.subtitle) {
    paperMeta.description = meta.subtitle;
  }

  if (meta['header-img'] && meta['header-style'] !== 'text') {
    // Convert header-img to cover
    const img = meta['header-img'];
    paperMeta.cover = img.startsWith('http') ? img : '/' + img.replace(/^\//, '');
  }

  if (meta.lang) {
    paperMeta.lang = meta.lang;
  }

  // Build frontmatter string
  let fm = '---\n';
  fm += `title: "${paperMeta.title.replace(/"/g, '\\"')}"\n`;
  fm += `date: ${paperMeta.date}\n`;
  fm += `tags: [${paperMeta.tags.join(', ')}]\n`;
  if (paperMeta.description) fm += `description: "${paperMeta.description.replace(/"/g, '\\"')}"\n`;
  if (paperMeta.cover) fm += `cover: ${paperMeta.cover}\n`;
  if (paperMeta.lang) fm += `lang: ${paperMeta.lang}\n`;
  fm += '---\n';

  // Process body: fix image paths
  let processedBody = body;

  // Fix relative image paths: ![](img/xxx) → ![](/img/xxx)
  processedBody = processedBody.replace(/!\[([^\]]*)\]\((?!http)(?!\/)img\//g, '![$1](/img/');

  // Fix {{ site.baseurl }} references
  processedBody = processedBody.replace(/\{\{\s*site\.baseurl\s*\}\}/g, '');

  return fm + '\n' + processedBody;
}

// ── Generate paper.config.js from _config.yml ──

function generateConfig(jekyllConfig) {
  const c = jekyllConfig;

  return `module.exports = {
  // 站点信息（从 Hux Blog 迁移）
  title: '${(c.title || 'My Blog').replace(/'/g, "\\'")}',
  description: '${(c.description || '').replace(/'/g, "\\'")}',
  url: '${c.url || 'https://example.github.io'}',
  basePath: '${c.baseurl || ''}',
  author: '${(c.sidebar && c['sidebar-about-description']) ? c.title.split(' ')[0] : 'Author'}',
  language: 'zh-CN',

  languages: ['zh-CN', 'en'],

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

  postsPerPage: ${c.paginate || 10},
  theme: 'default',

  comments: {
    enabled: ${c.disqus_username ? 'true' : 'false'},
    repo: '', // 改为你的 GitHub 仓库，如 'username/repo'
    issueTerm: 'pathname',
    label: 'comment',
  },

  nav: [
    { key: 'posts', url: '/' },
    { key: 'archive', url: '/archive.html' },
    { key: 'tags', url: '/tags.html' },
    { key: 'about', url: '/about.html' },
  ],

  rss: true,
  sitemap: true,
  codeTheme: 'tomorrow',
};
`;
}

// ── Copy directory recursively ──

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
      count++;
    }
  }
  return count;
}

// ── Main ──

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
  migrate-hux — 从 Hux Blog 一键迁移到 Paper

  用法:
    node migrate-hux.js <hux-blog-dir> [--out <output-dir>]

  示例:
    node migrate-hux.js ./my-hux-blog
    node migrate-hux.js ./my-hux-blog --out ./my-paper-blog

  迁移内容:
    ✓ _config.yml → paper.config.js
    ✓ _posts/*.md → posts/*.md（frontmatter 转换）
    ✓ img/ → themes/default/assets/img/
    ✓ about 页面
`);
    process.exit(0);
  }

  const srcDir = path.resolve(args[0]);
  const outIdx = args.indexOf('--out');
  const outDir = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.resolve('paper-migrated');

  if (!fs.existsSync(srcDir)) {
    console.error(`✗ 源目录不存在: ${srcDir}`);
    process.exit(1);
  }

  // Check it's a Hux/Jekyll blog
  const configPath = path.join(srcDir, '_config.yml');
  const postsDir = path.join(srcDir, '_posts');

  if (!fs.existsSync(configPath)) {
    console.error('✗ 找不到 _config.yml，确认这是 Jekyll 博客目录');
    process.exit(1);
  }

  console.log('\n  🔄 开始迁移 Hux Blog → Paper\n');

  // Parse config
  const jekyllConfig = parseYamlSimple(fs.readFileSync(configPath, 'utf-8'));
  console.log(`  📋 站点: ${jekyllConfig.title || '(untitled)'}`);

  // Create output
  fs.mkdirSync(path.join(outDir, 'posts'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'pages'), { recursive: true });

  // Generate paper.config.js
  const configContent = generateConfig(jekyllConfig);
  fs.writeFileSync(path.join(outDir, 'paper.config.js'), configContent);
  console.log('  ✓ paper.config.js');

  // Migrate posts
  let postCount = 0;
  let skipped = 0;

  if (fs.existsSync(postsDir)) {
    // Recursively find all posts (Hux uses subdirectories)
    function findPosts(dir) {
      let files = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files = files.concat(findPosts(full));
        } else if (/\.(md|markdown)$/.test(entry.name)) {
          files.push(full);
        }
      }
      return files;
    }

    const postFiles = findPosts(postsDir);

    for (const postPath of postFiles) {
      try {
        const filename = path.basename(postPath);
        const content = fs.readFileSync(postPath, 'utf-8');
        const converted = convertPost(filename, content, {});

        // Output filename: strip date prefix for cleaner URLs, keep .md
        const slug = filename
          .replace(/^\d{4}-\d{2}-\d{2}-/, '')
          .replace(/\.markdown$/, '.md');

        fs.writeFileSync(path.join(outDir, 'posts', slug), converted);
        postCount++;
      } catch (e) {
        console.log(`  ⚠ 跳过: ${path.basename(postPath)} (${e.message})`);
        skipped++;
      }
    }
    console.log(`  ✓ ${postCount} 篇文章已迁移${skipped ? ` (${skipped} 篇跳过)` : ''}`);
  }

  // Migrate images
  const imgDir = path.join(srcDir, 'img');
  if (fs.existsSync(imgDir)) {
    const imgCount = copyDirSync(imgDir, path.join(outDir, 'img'));
    console.log(`  ✓ ${imgCount} 个图片文件`);
  }

  // Migrate about page
  const aboutIncludes = path.join(srcDir, '_includes', 'about');
  if (fs.existsSync(aboutIncludes)) {
    // Try zh.md first, then en.md
    const zhAbout = path.join(aboutIncludes, 'zh.md');
    const enAbout = path.join(aboutIncludes, 'en.md');
    let aboutContent = '';

    if (fs.existsSync(zhAbout)) {
      aboutContent = fs.readFileSync(zhAbout, 'utf-8');
    } else if (fs.existsSync(enAbout)) {
      aboutContent = fs.readFileSync(enAbout, 'utf-8');
    }

    if (aboutContent) {
      const aboutMd = `---\ntitle: 关于\n---\n\n${aboutContent}`;
      fs.writeFileSync(path.join(outDir, 'pages', 'about.md'), aboutMd);
      console.log('  ✓ 关于页面');
    }
  }

  // Summary
  console.log(`
  ✅ 迁移完成！输出目录: ${outDir}

  下一步:
    1. 将 Paper 框架文件复制到该目录（或用 paper init 创建后覆盖 posts/）
    2. 编辑 paper.config.js 完善配置
    3. npm install && npm run build
    4. 检查 dist/ 输出

  注意:
    - Disqus 评论需手动切换为 utterances（编辑 paper.config.js）
    - header-img 已转为 cover 字段
    - 图片路径已自动修正
    - 建议检查每篇文章的 frontmatter 是否正确
`);
}

main();
