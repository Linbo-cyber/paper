# 部署

## GitHub Pages（推荐）

Paper 内置 GitHub Actions 工作流，推送即部署。

### 步骤

1. 在 GitHub 创建仓库
2. 推送代码：
   ```bash
   git remote add origin https://github.com/username/repo.git
   git push -u origin main
   ```
3. 进入仓库 Settings → Pages
4. Source 选择 **GitHub Actions**
5. 完成。每次推送 main 分支自动构建部署

### 项目页面 vs 用户页面

| 类型 | 仓库名 | URL | basePath |
|------|--------|-----|----------|
| 用户页面 | `username.github.io` | `https://username.github.io` | `''` |
| 项目页面 | `blog` | `https://username.github.io/blog` | `'/blog'` |

项目页面需要在 `paper.config.js` 中设置 `basePath`：

```js
basePath: '/blog',  // 仓库名，带前导斜杠，无尾部斜杠
```

## 其他平台

Paper 构建输出纯静态文件到 `dist/`，可以部署到任何静态托管：

### Netlify

```bash
npm run build
# 部署 dist/ 目录
```

或创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

### Vercel

```bash
npm run build
# 部署 dist/ 目录
```

### Cloudflare Pages

构建命令：`npm run build`
输出目录：`dist`

### 自托管

```bash
npm run build
# 将 dist/ 内容复制到 Web 服务器
# 例如 Nginx:
# server { root /var/www/blog; }
```

## 自定义域名

1. 在 `dist/` 下创建 `CNAME` 文件（或在构建后复制）
2. 在 DNS 添加 CNAME 记录指向 `username.github.io`
3. GitHub Settings → Pages → Custom domain 填入域名

下一步：[进阶 →](advanced.md)
