# 组件

在 Markdown 中使用 `{% %}` 语法插入组件。

## 音乐播放器

```markdown
{% player src="https://example.com/song.mp3" title="歌曲名" artist="歌手" cover="封面URL" loop="true" autoplay="false" volume="true" loopBtn="true" %}
```

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| `src` | ✓ | — | 音频文件 URL |
| `title` | | — | 歌曲标题 |
| `artist` | | — | 歌手/作者 |
| `cover` | | — | 封面图 URL |
| `loop` | | `false` | 初始循环状态 |
| `autoplay` | | `false` | 自动播放 |
| `volume` | | `true` | 显示音量控制 |
| `loopBtn` | | `true` | 显示循环按钮 |

## 卡片

### 带内容

```markdown
{% card icon="📝" title="标题" subtitle="副标题" text="描述" align="center" %}
卡片底部内容，支持 HTML
{% endcard %}
```

### 无内容

```markdown
{% card icon="📝" title="标题" text="描述" %}
```

| 参数 | 说明 |
|------|------|
| `icon` | 图标（emoji 或 HTML） |
| `title` | 标题 |
| `subtitle` | 副标题 |
| `text` | 描述文字 |
| `align` | 对齐：`center`（默认）、`left`、`right` |
| `style` | 自定义 CSS |

## 按钮

```markdown
{% btn label="点击我" href="https://example.com" style="primary" size="lg" %}
```

| 参数 | 说明 |
|------|------|
| `label` | 按钮文字 |
| `href` | 链接（有则渲染为 `<a>`，无则 `<button>`） |
| `style` | `primary` 或 `accent` |
| `size` | `sm` 或 `lg` |

## 计数器

```markdown
{% counter key="like-post-1" label="点赞" icon="👍" %}
```

| 参数 | 说明 |
|------|------|
| `key` | 唯一标识（用于 localStorage） |
| `label` | 按钮文字 |
| `icon` | 图标 |

基于 localStorage 持久化，每人限点一次。

下一步：[主题 →](theming.md)
