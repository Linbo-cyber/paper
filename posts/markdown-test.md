---
title: Markdown 渲染测试
date: 2026-02-25
tags: [测试, Markdown]
description: 测试 Paper 的 Markdown 渲染能力，包括代码块、表格、引用、列表等。
---

## 文本样式

这是一段普通文本。**粗体**、*斜体*、~~删除线~~、`行内代码`。

[这是一个链接](https://github.com)

## 引用

> 好的工具应该像空气一样——你不会注意到它，但离开它你会窒息。

> 嵌套引用：
> > 第二层引用

## 列表

无序列表：
- 第一项
- 第二项
  - 嵌套项
  - 另一个嵌套项
- 第三项

有序列表：
1. 步骤一
2. 步骤二
3. 步骤三

## 代码

行内代码：`const x = 42;`

代码块：

```go
package main

import "fmt"

func main() {
    ch := make(chan string, 1)
    go func() {
        ch <- "hello from goroutine"
    }()
    fmt.Println(<-ch)
}
```

```rust
fn main() {
    let numbers: Vec<i32> = (1..=10)
        .filter(|x| x % 2 == 0)
        .collect();
    println!("{:?}", numbers);
}
```

## 表格

| 框架 | 语言 | 特点 |
|------|------|------|
| Paper | Node.js | 极简、纸质风 |
| Hugo | Go | 速度快 |
| Hexo | Node.js | 插件丰富 |
| Jekyll | Ruby | GitHub 原生支持 |

## 图片

图片语法：`![alt](url)`

## 分割线

---

## 任务列表

- [x] 完成基础框架
- [x] 添加代码高亮
- [x] 添加搜索功能
- [ ] 添加更多主题

## 数学公式

Paper 目前不内置数学公式支持，但你可以通过在模板中引入 KaTeX 来实现。

## 脚注

这是一段带脚注的文本[^1]。

[^1]: 这是脚注内容。
