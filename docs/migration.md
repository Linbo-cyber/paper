# 从 Hux Blog 迁移

一条命令从 Hux Blog (Jekyll) 迁移到 Paper。

## 使用

```bash
# 方式一：直接指定 Hux Blog 目录
npx paper migrate ./my-hux-blog

# 方式二：指定输出目录
npx paper migrate ./my-hux-blog --out ./my-paper-blog
```

## 迁移内容

| 来源 | 目标 | 说明 |
|------|------|------|
| `_config.yml` | `paper.config.js` | 站点标题、描述、URL 等 |
| `_posts/*.md` | `posts/*.md` | frontmatter 格式转换 |
| `img/` | `img/` | 图片文件原样复制 |
| `_includes/about/` | `pages/about.md` | 关于页面 |

## Frontmatter 转换

| Hux Blog (Jekyll) | Paper |
|---|---|
| `layout: post` | （不需要） |
| `subtitle` | `description` |
| `header-img` | `cover` |
| `header-style: text` | （不生成 cover） |
| `author` | （使用全局配置） |
| `catalog: true` | （自动生成 TOC） |
| `tags` | `tags`（格式统一为数组） |
| `lang` | `lang` |

## 迁移后步骤

1. 将 Paper 框架文件复制到迁移目录：

```bash
# 用 paper init 创建一个新项目
npx paper init temp-paper

# 复制框架文件（不覆盖已迁移的 posts 和 config）
cp temp-paper/build.js ./my-paper-blog/
cp -r temp-paper/themes ./my-paper-blog/
cp -r temp-paper/.github ./my-paper-blog/
cp temp-paper/favicon.svg ./my-paper-blog/
cp temp-paper/package.json ./my-paper-blog/

rm -rf temp-paper
```

2. 安装依赖并构建：

```bash
cd my-paper-blog
npm install
npm run build
```

3. 检查并调整：
   - 编辑 `paper.config.js` 完善配置
   - 评论系统从 Disqus 切换为 utterances
   - 检查文章的图片路径是否正确
   - 预览 `dist/` 确认效果

## 注意事项

- Hux Blog 的 Disqus 评论无法直接迁移，需要配置 utterances
- `header-img` 会转为 `cover` 字段，仅在文章详情页显示
- Jekyll 的 Liquid 模板语法（如 `{{ site.baseurl }}`）会被自动清理
- 子目录下的文章（如 `_posts/read_sf_lf/`）会被扁平化到 `posts/`
