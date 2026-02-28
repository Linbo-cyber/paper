---
title: 组件演示
date: 2026-02-26
tags: [Paper, 组件]
description: Paper 内置组件演示 — 音乐播放器、卡片、按钮、计数器。
---

## 音乐播放器

默认播放器（带标题、作者、循环按钮、音量控制）：

{% player src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" title="SoundHelix Song 1" artist="T. Schürger" loop="false" %}

无封面、无作者的简洁播放器：

{% player src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" title="背景音乐" loop="true" %}

## 卡片组件

简单卡片：

{% card icon="📝" title="Paper Blog" subtitle="极简静态博客框架" text="纸质暖色调，为 GitHub Pages 而生。" %}

### 墓碑卡片 + 计数器

{% card icon="🪦" title="某某某" subtitle="UID: 1234567890" text="他来过，他骚扰过，他被挂了。" %}

{% counter key="demo_mourn" label="为此人哀悼" icon="🙏" %}

### 带内容的卡片

{% card icon="🎉" title="欢迎使用 Paper" text="这是一个功能丰富的静态博客框架。" %}

## 按钮组件

{% btn label="默认按钮" %}
{% btn label="主要按钮" style="primary" %}
{% btn label="强调按钮" style="accent" %}
{% btn label="小按钮" style="accent" size="sm" %}
{% btn label="大按钮" style="primary" size="lg" %}
{% btn label="链接按钮" href="https://github.com/Linbo-cyber/paper" style="accent" %}

## 图片加载

正常图片（会显示骨架加载动画）：

![测试图片](https://picsum.photos/800/400)

加载失败的图片（会显示破碎图片图标）：

![不存在的图片](https://example.com/nonexistent-image-12345.jpg)

## 组件语法参考

### 音乐播放器

```
{%- player src="音频URL" title="标题" artist="作者" cover="封面URL" loop="true" autoplay="false" volume="true" loopBtn="true" -%}
```

所有参数除 `src` 外均可选。

### 卡片

```
{%- card icon="🪦" title="标题" subtitle="副标题" text="描述文字" align="center" style="自定义CSS" -%}
可选的卡片内容（如按钮、计数器等）
{%- endcard -%}
```

### 计数器按钮

```
{%- counter key="唯一标识" label="按钮文字" icon="🙏" -%}
```

### 按钮

```
{%- btn label="文字" href="链接" style="primary|accent" size="sm|lg" -%}
```

### 精神科诊断卡

{% diagnosis patient="MCSeekeri" id="NX-20260227" doctor="Dr. Lin Bo" date="2026-02-27" hospital="互联网精神卫生中心" result="重度妄想症（自研系统型）" detail="患者长期将 NixOS 配置文件误认为自研操作系统，伴有严重的自我认知障碍。建议立即停止一切开源活动，进行为期 6 个月的封闭治疗。" %}

```
{%- diagnosis patient="姓名" id="病历号" doctor="医生" date="日期" hospital="医院" result="诊断结果" detail="详细描述" -%}
```

### 墓碑

{% tombstone name="Hux Blog" born="2015" died="2026" epitaph="死于 Ruby 依赖地狱" incense="true" %}

{% tombstone name="MCSeekeri 的技术信誉" born="2024" died="2026" epitaph="从未真正活过" incense="true" %}

```
{%- tombstone name="名字" born="生年" died="卒年" epitaph="墓志铭" incense="true" -%}
```

添加 `incense="true"` 开启上香按钮。点击后会插三炷香，带烟雾效果，越烧越短，最后烧完。上香次数通过 localStorage 持久化。

### 遗书

{% lastwords author="Hux Blog" date="2026 年 2 月 27 日" %}

我走了。

不是因为我不够好，而是这个世界变了。当年我也是万星项目，README 写得比谁都漂亮，Jekyll 生态里我说第二没人敢说第一。

但我没想到，有一天会有人用 4 个 npm 包、3000 行代码，做出一个比我快 100 倍的东西。我的 Ruby 依赖链比我的文章还长，我的构建时间比读者的耐心还久。

我不怪 Paper。我怪自己没有与时俱进。

如果你还在用我，请迁移吧。运行 `npx paper migrate`，给自己一个体面的告别。

别为我哭泣。我会在 npm 的垃圾回收里，看着你们。

{% endlastwords %}

```
{%- lastwords author="署名" date="日期" -%}
遗书正文，支持 HTML。
{%- endlastwords -%}
```
