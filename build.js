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

// ── Autospace (Pangu) — CJK ↔ half-width auto-spacing ───

const CJK = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\ufe30-\ufe4f';
const ANS = 'A-Za-z0-9';
const RE_CJK_ANS = new RegExp(`([${CJK}])([${ANS}])`, 'g');
const RE_ANS_CJK = new RegExp(`([${ANS}])([${CJK}])`, 'g');

function autospace(html) {
  // Split HTML into tags and text nodes, skip <pre>/<code> blocks
  const parts = html.split(/(<\/?[^>]+>)/);
  let inPre = 0;
  let inCode = 0;

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;

    // Track <pre> and <code> nesting
    if (p.startsWith('<')) {
      if (/^<pre[\s>]/i.test(p)) inPre++;
      else if (/^<\/pre>/i.test(p)) inPre = Math.max(0, inPre - 1);
      if (/^<code[\s>]/i.test(p)) inCode++;
      else if (/^<\/code>/i.test(p)) inCode = Math.max(0, inCode - 1);
      continue;
    }

    // Only process text nodes outside <pre>/<code>
    if (inPre > 0 || inCode > 0) continue;

    parts[i] = p
      .replace(RE_CJK_ANS, '$1 $2')
      .replace(RE_ANS_CJK, '$1 $2');
  }

  return parts.join('');
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

  // Callouts/Admonitions: :::note, :::tip, :::warning, :::caution
  html = html.replace(/<p>:::(note|tip|warning|caution|important)(?:\[([^\]]*)\])?<\/p>([\s\S]*?)<p>:::<\/p>/g, (_, type, customTitle, body) => {
    const icons = {
      note: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      tip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
      important: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      caution: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    };
    const titles = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };
    const title = customTitle || titles[type] || type;
    return `<div class="callout callout-${type}"><div class="callout-header">${icons[type] || ''}<span>${title}</span></div><div class="callout-body">${body.trim()}</div></div>`;
  });

  // GitHub-style callouts: > [!NOTE], > [!TIP], etc.
  html = html.replace(/<blockquote>\s*<p>\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]<\/p>([\s\S]*?)<\/blockquote>/gi, (_, type, body) => {
    const t = type.toLowerCase();
    const icons = {
      note: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      tip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
      important: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      caution: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
    };
    const titles = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };
    return `<div class="callout callout-${t}"><div class="callout-header">${icons[t] || ''}<span>${titles[t]}</span></div><div class="callout-body">${body.trim()}</div></div>`;
  });

  return html;
}

function renderMarkdown(src) {
  tocItems = [];

  // Extract callout blocks before markdown
  const calloutPlaceholders = {};
  let cidx = 0;
  src = src.replace(/^:::(note|tip|warning|caution|important)(?:\[([^\]]*)\])?\n([\s\S]*?)^:::\s*$/gm, (_, type, customTitle, body) => {
    const key = `<!--PAPER_CALLOUT_${cidx++}-->`;
    calloutPlaceholders[key] = { type, customTitle, body: body.trim() };
    return key;
  });

  // Also handle GitHub-style: > [!NOTE]\n> content
  src = src.replace(/^>\s*\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*\n((?:^>.*\n?)*)/gm, (_, type, body) => {
    const key = `<!--PAPER_CALLOUT_${cidx++}-->`;
    const cleanBody = body.replace(/^>\s?/gm, '').trim();
    calloutPlaceholders[key] = { type: type.toLowerCase(), customTitle: '', body: cleanBody };
    return key;
  });

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

  // Restore callout placeholders
  const calloutIcons = {
    note: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    tip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    important: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    caution: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
  };
  const calloutTitles = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };

  for (const [key, val] of Object.entries(calloutPlaceholders)) {
    const title = val.customTitle || calloutTitles[val.type] || val.type;
    const icon = calloutIcons[val.type] || '';
    const bodyHtml = marked(val.body, { renderer: new marked.Renderer() });
    const calloutHtml = `<div class="callout callout-${val.type}"><div class="callout-header">${icon}<span>${title}</span></div><div class="callout-body">${bodyHtml}</div></div>`;
    html = html.replace(new RegExp(`<p>\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</p>`, 'g'), calloutHtml);
    html = html.replace(key, calloutHtml);
  }

  // Restore component placeholders and process components
  for (const [key, val] of Object.entries(placeholders)) {
    html = html.replace(new RegExp(`<p>\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</p>`, 'g'), val);
    html = html.replace(key, val);
  }

  html = processComponents(html);
  html = autospace(html);
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
  // {{#each key}}...{{/each}} — handle nesting via balanced matching (FIRST)
  let prev;
  do {
    prev = template;
    const eachStart = template.indexOf('{{#each ');
    if (eachStart === -1) break;
    const keyMatch = template.slice(eachStart).match(/^\{\{#each (\w+)\}\}/);
    if (!keyMatch) break;
    const key = keyMatch[1];
    const bodyStart = eachStart + keyMatch[0].length;
    let depth = 1;
    let pos = bodyStart;
    while (depth > 0 && pos < template.length) {
      const nextOpen = template.indexOf('{{#each ', pos);
      const nextClose = template.indexOf('{{/each}}', pos);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 8;
      } else {
        depth--;
        if (depth === 0) {
          const body = template.slice(bodyStart, nextClose);
          const arr = data[key];
          let replacement = '';
          if (Array.isArray(arr)) {
            replacement = arr.map((item, i) => {
              const ctx = typeof item === 'object' ? { ...data, ...item, _index: i } : { ...data, _item: item, _index: i };
              return render(body, ctx);
            }).join('');
          }
          template = template.slice(0, eachStart) + replacement + template.slice(nextClose + 9);
        } else {
          pos = nextClose + 9;
        }
      }
    }
  } while (template !== prev);

  // {{#if key}}...{{/if}}
  do {
    prev = template;
    template = template.replace(/\{\{#if (\w+)\}\}((?:(?!\{\{#if )[\s\S])*?)\{\{\/if\}\}/g, (_, key, body) => {
      return data[key] ? body : '';
    });
  } while (template !== prev);

  // {{#unless key}}...{{/unless}}
  do {
    prev = template;
    template = template.replace(/\{\{#unless (\w+)\}\}((?:(?!\{\{#unless )[\s\S])*?)\{\{\/unless\}\}/g, (_, key, body) => {
      return data[key] ? '' : body;
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
      cover: fm.cover || '',
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

function getRelatedPosts(post, allPosts, max) {
  max = max || 3;
  if (post.tags.length === 0) return [];
  const scored = allPosts
    .filter(p => p.slug !== post.slug)
    .map(p => {
      const shared = post.tags.filter(t => p.tags.includes(t)).length;
      return { post: p, score: shared };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map(s => s.post);
}

function buildPostPages(posts) {
  ensureDir(path.join(DIST, 'posts'));
  const tpl = buildCommon();

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const prev = posts[i + 1] || null;
    const next = posts[i - 1] || null;
    const related = getRelatedPosts(post, posts, 3);

    const data = {
      ...tpl,
      ...post,
      pageTitle: `${post.title} - ${config.title}`,
      hasCover: post.cover ? 'true' : '',
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
      hasRelated: related.length > 0 ? 'true' : '',
      relatedPosts: related.map(r => ({
        relTitle: r.title,
        relUrl: r.url,
        relDate: r.date,
      })),
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

function buildLinks() {
  if (!config.links || config.links.length === 0) return;
  const tpl = buildCommon();
  const data = {
    ...tpl,
    pageTitle: `${t('links')} - ${config.title}`,
    linksTitle: t('links'),
    links: config.links,
  };
  const html = renderPage('links', data);
  fs.writeFileSync(path.join(DIST, 'links.html'), html);
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
  buildLinks();
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
