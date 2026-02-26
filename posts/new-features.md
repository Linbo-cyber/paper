---
title: 新功能演示
date: 2026-02-26
tags: [Paper, 组件, 测试]
description: 演示 Paper v1.1 的新功能 — 主题切换、代码复制、提示框、封面图、相关文章。
cover: https://images.unsplash.com/photo-1517842645767-c639042777db?w=900&h=300&fit=crop
---

## 提示框 / Callout

支持 `:::note` `:::tip` `:::warning` `:::caution` `:::important` 五种样式：

:::note
这是一条普通提示。用于补充说明信息。
:::

:::tip
这是一条建议。帮助用户更好地使用功能。
:::

:::important
这是重要信息。用户必须了解的关键内容。
:::

:::warning
这是一条警告。提醒用户注意潜在风险。
:::

:::caution
这是一条危险提示。操作可能导致不可逆后果。
:::

也支持 GitHub 风格的语法：

> [!TIP]
> 你可以用 GitHub 风格的语法来写提示框。

## 代码复制按钮

鼠标悬停在代码块上，右上角会出现复制按钮：

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return { success: true };
}

greet('Paper');
```

```bash
# 克隆 Paper
git clone https://github.com/Linbo-cyber/paper.git
cd paper && npm install && npm run build
```

## 封面图

这篇文章设置了 `cover` 字段，标题下方会显示封面大图。

在 frontmatter 中添加：

```yaml
cover: https://example.com/image.jpg
```

## 主题切换

点击导航栏右侧的太阳/月亮图标，可以手动切换深色/浅色模式。选择会保存到 localStorage。

## 阅读进度条

页面顶部有一条细线，随滚动显示阅读进度。

## 回到顶部

滚动超过一定距离后，右下角会出现回到顶部按钮。

## 相关文章

文章底部会根据标签匹配推荐相关文章。
