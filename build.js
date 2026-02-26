#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { Feed } = require('feed');

const config = require(path.resolve('paper.config.js'));
const B = config.basePath || '';  // e.g. '/paper' — no trailing slash
const DIST = path.resolve('dist');
const POSTS_DIR = path.resolve('posts');
const PAGES_DIR = path.resolve('pages');
const THEME_DIR = path.resolve('themes', config.theme);
const TEMPLATES_DIR = path.join(THEME_DIR, 'templates');
const ASSETS_DIR = path.join(THEME_DIR, 'assets');

// ── Helpers ──────────────────────────────────────────────

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES_DIR, name + '.html'), 'utf-8');
}

function t(key, lang) {
  lang = lang || config.language;
  return (config.i18n[lang] && config.i18n[lang][key]) || key;
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
}

function readingTime(text, lang) {
  const wpm = /[\u4e00-\u9fff]/.test(text) ? 400 : 200;
  const words = text.replace(/<[^>]*>/g, '').length;
  return Math.max(1, Math.ceil(words / wpm));
}

function formatDate(d) {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Markdown Setup ───────────────────────────────────────

marked.setOptions({
  gfm: true,
  breaks: false,
  headerIds: true,
});

// Custom renderer for heading IDs and TOC extraction
let tocItems = [];

const renderer = new marked.Renderer();
renderer.heading = function ({ text, depth, raw }) {
  const id = slugify(raw || text);
  tocItems.push({ id, text, depth });
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

function processComponents(html) {
  // Music player: {% player src="..." title="..." artist="..." cover="..." loop="true" autoplay="false" volume="true" loopBtn="true" %}
  html = html.replace(/\{%\s*player\s+([\s\S]*?)%\}/g, (_, attrs) => {
    const get = (k, def) => { const m = attrs.match(new RegExp(k + '="([^"]*)"')); return m ? m[1] : def || ''; };
    const dataAttrs = ['src', 'title', 'artist', 'cover', 'loop', 'autoplay', 'volume', 'loopBtn']
      .map(k => { const v = get(k); return v ? `data-${k.toLowerCase()}="${v}"` : ''; })
      .filter(Boolean).join(' ');
    return `<div class="paper-player" ${dataAttrs}></div>`;
  });

  // Card: {% card icon="🪦" title="..." subtitle="..." text="..." align="center" style="..." %}...{% endcard %}
  html = html.replace(/\{%\s*card\s+([\s\S]*?)%\}([\s\S]*?)\{%\s*endcard\s*%\}/g, (_, attrs, body) => {
    const get = (k) => { const m = attrs.match(new RegExp(k + '="([^"]*)"')); return m ? m[1] : ''; };
    const icon = get('icon');
    const title = get('title');
    const subtitle = get('subtitle');
    const text = get('text');
    const align = get('align');
    const style = get('style');
    const cls = align === 'left' ? ' card-left' : align === 'right' ? ' card-right' : '';
    let out = `<div class="paper-card${cls}"${style ? ` style="${style}"` : ''}>`;
    if (icon) out += `<div class="card-icon">${icon}</div>`;
    if (title) out += `<p class="card-title">${title}</p>`;
    if (subtitle) out += `<p class="card-subtitle">${subtitle}</p>`;
    if (text) out += `<p class="card-text">${text}</p>`;
    if (body.trim()) out += `<hr class="card-divider" /><div class="card-footer">${body.trim()}</div>`;
    out += '</div>';
    return out;
  });

  // Standalone card (no body): {% card icon="🪦" title="..." subtitle="..." text="..." %}
  html = html.replace(/\{%\s*card\s+([\s\S]*?)%\}/g, (_, attrs) => {
    const get = (k) => { const m = attrs.match(new RegExp(k + '="([^"]*)"')); return m ? m[1] : ''; };
    const icon = get('icon');
    const title = get('title');
    const subtitle = get('subtitle');
    const text = get('text');
    const align = get('align');
    const style = get('style');
    const cls = align === 'left' ? ' card-left' : align === 'right' ? ' card-right' : '';
    let out = `<div class="paper-card${cls}"${style ? ` style="${style}"` : ''}>`;
    if (icon) out += `<div class="card-icon">${icon}</div>`;
    if (title) out += `<p class="card-title">${title}</p>`;
    if (subtitle) out += `<p class="card-subtitle">${subtitle}</p>`;
    if (text) out += `<p class="card-text">${text}</p>`;
    out += '</div>';
    return out;
  });

  // Counter button: {% counter key="..." label="..." icon="🙏" %}
  html = html.replace(/\{%\s*counter\s+([\s\S]*?)%\}/g, (_, attrs) => {
    const get = (k, def) => { const m = attrs.match(new RegExp(k + '="([^"]*)"')); return m ? m[1] : def || ''; };
    const key = get('key', 'paper_counter');
    const label = get('label', 'Click');
    const icon = get('icon');
    return `<div class="paper-counter-btn" data-key="${key}" data-label="${label}" data-icon="${icon}"></div>`;
  });

  // Button: {% btn label="..." href="..." style="primary|accent" size="sm|lg" %}
  html = html.replace(/\{%\s*btn\s+([\s\S]*?)%\}/g, (_, attrs) => {
    const get = (k) => { const m = attrs.match(new RegExp(k + '="([^"]*)"')); return m ? m[1] : ''; };
    const label = get('label') || 'Button';
    const href = get('href');
    const style = get('style');
    const size = get('size');
    const cls = ['paper-btn', style ? `btn-${style}` : '', size ? `btn-${size}` : ''].filter(Boolean).join(' ');
    if (href) return `<a class="${cls}" href="${href}">${label}</a>`;
    return `<button class="${cls}">${label}</button>`;
  });

  return html;
}

function renderMarkdown(src) {
  tocItems = [];
  // Extract components before markdown to avoid quote escaping
  const placeholders = {};
  let idx = 0;
  src = src.replace(/\{%[\s\S]*?%\}/g, (match) => {
    const key = `<!--PAPER_COMPONENT_${idx++}-->`;
    placeholders[key] = match;
    return key;
  });
  // Also handle {% card %}...{% endcard %} blocks
  src = src.replace(/<!--PAPER_COMPONENT_(\d+)-->([\s\S]*?)<!--PAPER_COMPONENT_(\d+)-->/g, (full, startIdx, body, endIdx) => {
    const startKey = `<!--PAPER_COMPONENT_${startIdx}-->`;
    const endKey = `<!--PAPER_COMPONENT_${endIdx}-->`;
    const startTag = placeholders[startKey] || '';
    const endTag = placeholders[endKey] || '';
    if (startTag.includes('card') && endTag.includes('endcard')) {
      const combinedKey = `<!--PAPER_BLOCK_${startIdx}-->`;
      placeholders[combinedKey] = startTag + body + endTag;
      delete placeholders[startKey];
      delete placeholders[endKey];
      return combinedKey;
    }
    return full;
  });

  let html = marked(src, { renderer });

  // Restore placeholders and process components
  for (const [key, val] of Object.entries(placeholders)) {
    html = html.replace(new RegExp(`<p>\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</p>`, 'g'), val);
    html = html.replace(key, val);
  }

  html = processComponents(html);
  return { html, toc: [...tocItems] };
}

function buildTocHtml(toc, lang) {
  if (toc.length < 2) return '';
  let html = `<nav class="toc"><details open><summary>${t('toc', lang)}</summary><ul>`;
  for (const item of toc) {
    const indent = item.depth - 2;
    html += `<li style="margin-left:${indent * 16}px"><a href="#${item.id}">${item.text}</a></li>`;
  }
  html += '</ul></details></nav>';
  return html;
}

// ── Template Engine (simple mustache-like) ───────────────

function render(template, data) {
  // Process blocks from inside out to handle nesting
  let prev;
  do {
    prev = template;
    // {{#if key}}...{{/if}} (innermost first)
    template = template.replace(/\{\{#if (\w+)\}\}((?:(?!\{\{#if )[\s\S])*?)\{\{\/if\}\}/g, (_, key, body) => {
      return data[key] ? body : '';
    });
  } while (template !== prev);

  do {
    prev = template;
    // {{#unless key}}...{{/unless}}
    template = template.replace(/\{\{#unless (\w+)\}\}((?:(?!\{\{#unless )[\s\S])*?)\{\{\/unless\}\}/g, (_, key, body) => {
      return data[key] ? '' : body;
    });
  } while (template !== prev);

  do {
    prev = template;
    // {{#each key}}...{{/each}}
    template = template.replace(/\{\{#each (\w+)\}\}((?:(?!\{\{#each )[\s\S])*?)\{\{\/each\}\}/g, (_, key, body) => {
      const arr = data[key];
      if (!Array.isArray(arr)) return '';
      return arr.map((item, i) => {
        const ctx = typeof item === 'object' ? { ...data, ...item, _index: i } : { ...data, _item: item, _index: i };
        return render(body, ctx);
      }).join('');
    });
  } while (template !== prev);

  // {{{raw}}} (unescaped)
  template = template.replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => {
    return data[key] != null ? String(data[key]) : '';
  });
  // {{key}} (escaped)
  template = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] != null ? escapeHtml(String(data[key])) : '';
  });
  return template;
}

function renderPage(templateName, data) {
  const layout = readTemplate('layout');
  const content = readTemplate(templateName);
  const inner = render(content, data);
  return render(layout, { ...data, content: inner });
}

// ── Parse Posts ──────────────────────────────────────────

function parsePosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data: fm, content } = matter(raw);
    if (fm.draft) continue;

    const slug = file.replace(/\.md$/, '');
    const { html, toc } = renderMarkdown(content);
    const lang = fm.lang || config.language;
    const minutes = readingTime(content, lang);

    posts.push({
      slug,
      title: fm.title || slug,
      date: fm.date ? formatDate(fm.date) : '1970-01-01',
      dateRaw: fm.date ? new Date(fm.date) : new Date(0),
      tags: fm.tags || [],
      lang,
      description: fm.description || '',
      html,
      toc,
      tocHtml: buildTocHtml(toc, lang),
      readingTime: minutes,
      readingTimeText: `${minutes} ${t('readingTime', lang)}`,
      url: `${B}/posts/${slug}.html`,
    });
  }

  posts.sort((a, b) => b.dateRaw - a.dateRaw);
  return posts;
}

// ── Parse Pages ─────────────────────────────────────────

function parsePages() {
  if (!fs.existsSync(PAGES_DIR)) return [];
  const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.md'));
  const pages = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8');
    const { data: fm, content } = matter(raw);
    const slug = file.replace(/\.md$/, '');
    const { html, toc } = renderMarkdown(content);
    const lang = fm.lang || config.language;

    pages.push({
      slug,
      title: fm.title || slug,
      lang,
      html,
      toc,
      tocHtml: buildTocHtml(toc, lang),
      url: `${B}/${slug}.html`,
    });
  }
  return pages;
}

// ── Build Functions ─────────────────────────────────────

function buildCommon(lang) {
  lang = lang || config.language;
  const navItems = config.nav.map(n => ({
    label: t(n.key, lang),
    url: B + n.url,
  }));
  return {
    siteTitle: config.title,
    siteDescription: config.description,
    siteUrl: config.url,
    basePath: B,
    author: config.author,
    language: lang,
    navItems,
    commentsEnabled: config.comments.enabled ? 'true' : '',
    commentsRepo: config.comments.repo,
    commentsIssueTerm: config.comments.issueTerm,
    commentsLabel: config.comments.label,
    poweredBy: t('poweredBy', lang),
    searchPlaceholder: t('search', lang),
    rssEnabled: config.rss ? 'true' : '',
    rssLabel: t('rss', lang),
    langSwitcher: config.languages.length > 1 ? 'true' : '',
    languages: config.languages.map(l => ({
      code: l,
      label: (config.i18n[l] && config.i18n[l].name) || l,
    })),
  };
}

function buildPostPages(posts) {
  ensureDir(path.join(DIST, 'posts'));
  const tpl = buildCommon();

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const prev = posts[i + 1] || null;
    const next = posts[i - 1] || null;

    const data = {
      ...tpl,
      ...post,
      pageTitle: `${post.title} - ${config.title}`,
      hasToc: post.toc.length >= 2 ? 'true' : '',
      hasTags: post.tags.length > 0 ? 'true' : '',
      tagList: post.tags.map(tag => ({
        tag,
        tagUrl: `${B}/tags.html#${slugify(tag)}`,
      })),
      hasPrev: prev ? 'true' : '',
      hasNext: next ? 'true' : '',
      prevTitle: prev ? prev.title : '',
      prevUrl: prev ? prev.url : '',
      nextTitle: next ? next.title : '',
      nextUrl: next ? next.url : '',
    };

    const html = renderPage('post', data);
    fs.writeFileSync(path.join(DIST, 'posts', post.slug + '.html'), html);
  }
}

function buildIndex(posts) {
  const perPage = config.postsPerPage;
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));

  for (let page = 1; page <= totalPages; page++) {
    const start = (page - 1) * perPage;
    const pagePosts = posts.slice(start, start + perPage);
    const tpl = buildCommon();

    const data = {
      ...tpl,
      pageTitle: page === 1 ? config.title : `${t('page')} ${page} - ${config.title}`,
      posts: pagePosts.map(p => ({
        ...p,
        hasTags: p.tags.length > 0 ? 'true' : '',
        tagList: p.tags.map(tag => ({
          tag,
          tagUrl: `${B}/tags.html#${slugify(tag)}`,
        })),
      })),
      hasPagination: totalPages > 1 ? 'true' : '',
      currentPage: page,
      totalPages,
      hasPrevPage: page > 1 ? 'true' : '',
      hasNextPage: page < totalPages ? 'true' : '',
      prevPageUrl: page === 2 ? `${B}/index.html` : `${B}/page/${page - 1}.html`,
      nextPageUrl: `${B}/page/${page}.html`,
    };

    const html = renderPage('index', data);
    if (page === 1) {
      fs.writeFileSync(path.join(DIST, 'index.html'), html);
    } else {
      ensureDir(path.join(DIST, 'page'));
      fs.writeFileSync(path.join(DIST, 'page', page + '.html'), html);
    }
  }
}

function buildArchive(posts) {
  const tpl = buildCommon();
  const byYear = {};
  for (const p of posts) {
    const year = p.date.slice(0, 4);
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(p);
  }
  const years = Object.keys(byYear).sort((a, b) => b - a).map(year => ({
    year,
    posts: byYear[year],
  }));

  const data = {
    ...tpl,
    pageTitle: `${t('archive')} - ${config.title}`,
    archiveTitle: t('archive'),
    years,
  };
  const html = renderPage('archive', data);
  fs.writeFileSync(path.join(DIST, 'archive.html'), html);
}

function buildTags(posts) {
  const tpl = buildCommon();
  const tagMap = {};
  for (const p of posts) {
    for (const tag of p.tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(p);
    }
  }
  const tags = Object.keys(tagMap).sort().map(tag => ({
    tag,
    tagId: slugify(tag),
    count: tagMap[tag].length,
    posts: tagMap[tag],
  }));

  const data = {
    ...tpl,
    pageTitle: `${t('tags')} - ${config.title}`,
    tagsTitle: t('tags'),
    tags,
  };
  const html = renderPage('tags', data);
  fs.writeFileSync(path.join(DIST, 'tags.html'), html);
}

function buildCustomPages(pages) {
  const tpl = buildCommon();
  for (const page of pages) {
    const data = {
      ...tpl,
      ...page,
      pageTitle: `${page.title} - ${config.title}`,
      hasToc: page.toc.length >= 2 ? 'true' : '',
    };
    const html = renderPage('page', data);
    fs.writeFileSync(path.join(DIST, page.slug + '.html'), html);
  }
}

function buildSearchIndex(posts) {
  const index = posts.map(p => ({
    t: p.title,
    u: p.url,
    d: p.date,
    s: p.description || p.html.replace(/<[^>]*>/g, '').slice(0, 200),
    tags: p.tags,
  }));
  ensureDir(DIST);
  fs.writeFileSync(path.join(DIST, 'search-index.json'), JSON.stringify(index));
}

function buildRSS(posts) {
  if (!config.rss) return;
  const siteBase = config.url + B;
  const feed = new Feed({
    title: config.title,
    description: config.description,
    id: siteBase,
    link: siteBase,
    language: config.language,
    author: { name: config.author },
  });

  for (const post of posts.slice(0, 20)) {
    feed.addItem({
      title: post.title,
      id: config.url + post.url,
      link: config.url + post.url,
      description: post.description,
      content: post.html,
      date: post.dateRaw,
    });
  }

  fs.writeFileSync(path.join(DIST, 'feed.xml'), feed.rss2());
  fs.writeFileSync(path.join(DIST, 'atom.xml'), feed.atom1());
}

function buildSitemap(posts, pages) {
  if (!config.sitemap) return;
  const base = config.url + B;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const addUrl = (loc, date, priority) => {
    xml += `  <url><loc>${base}${loc}</loc>`;
    if (date) xml += `<lastmod>${date}</lastmod>`;
    xml += `<priority>${priority}</priority></url>\n`;
  };

  addUrl('/', posts[0] ? posts[0].date : formatDate(new Date()), '1.0');
  addUrl('/archive.html', null, '0.5');
  addUrl('/tags.html', null, '0.5');

  for (const p of posts) addUrl('/posts/' + p.slug + '.html', p.date, '0.8');
  for (const p of pages) addUrl('/' + p.slug + '.html', null, '0.6');

  xml += '</urlset>';
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml);

  fs.writeFileSync(path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
}

function build404() {
  const tpl = buildCommon();
  const data = {
    ...tpl,
    pageTitle: `404 - ${config.title}`,
  };
  const html = renderPage('404', data);
  fs.writeFileSync(path.join(DIST, '404.html'), html);
}

function copyAssets() {
  const destAssets = path.join(DIST, 'assets');
  ensureDir(destAssets);
  if (!fs.existsSync(ASSETS_DIR)) return;

  function copyDir(src, dest) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  copyDir(ASSETS_DIR, destAssets);

  // Copy favicon if exists
  const favicon = path.resolve('favicon.svg');
  if (fs.existsSync(favicon)) {
    fs.copyFileSync(favicon, path.join(DIST, 'favicon.svg'));
  }
}

// ── Main ────────────────────────────────────────────────

function buildAll() {
  const start = Date.now();
  console.log('Building...');

  // Clean
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
  ensureDir(DIST);

  const posts = parsePosts();
  const pages = parsePages();

  buildPostPages(posts);
  buildIndex(posts);
  buildArchive(posts);
  buildTags(posts);
  buildCustomPages(pages);
  buildSearchIndex(posts);
  buildRSS(posts);
  buildSitemap(posts, pages);
  build404();
  copyAssets();

  console.log(`Done in ${Date.now() - start}ms — ${posts.length} posts, ${pages.length} pages`);
}

// Watch mode
if (process.argv.includes('--watch')) {
  buildAll();
  try {
    const chokidar = require('chokidar');
    const watcher = chokidar.watch([POSTS_DIR, PAGES_DIR, THEME_DIR, 'paper.config.js'], {
      ignoreInitial: true,
    });
    watcher.on('all', (event, filePath) => {
      console.log(`\n[${event}] ${filePath}`);
      try { buildAll(); } catch (e) { console.error(e.message); }
    });
    console.log('Watching for changes...');
  } catch (e) {
    console.log('Install chokidar for watch mode: npm i chokidar');
  }
} else {
  buildAll();
}
