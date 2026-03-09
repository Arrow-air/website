---
sidebar_custom_props:
  icon: doc
---

# Kitchen Sink

A preview of all documentation styles.

## Typography

### Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

### Body Text

This is a regular paragraph with **bold text**, *italic text*, and ***bold italic text***. Here's some `inline code` and a [link to somewhere](#).

This is a second paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

### Lists

Unordered list:
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered list:
1. First step
2. Second step
   1. Sub-step one
   2. Sub-step two
3. Third step

Task list:
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

---

## Code

Inline: Use `npm install` to install dependencies.

```javascript
// JavaScript code block
function greet(name) {
  console.log(`Hello, ${name}!`);
  return true;
}
```

```rust
// Rust code block
fn main() {
    println!("Hello, world!");
    let x: i32 = 42;
}
```

```bash
# Shell commands
npm run build
git commit -m "Update styles"
```

---

## Tables

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable the feature |
| `timeout` | number | `3000` | Timeout in milliseconds |
| `retries` | number | `3` | Number of retry attempts |
| `mode` | string | `"auto"` | Operating mode |

Right-aligned numbers:

| Component | Version | Downloads |
|:----------|:-------:| ---------:|
| React | 18.2.0 | 1,234,567 |
| Vue | 3.4.0 | 987,654 |
| Svelte | 4.2.0 | 456,789 |

---

## Blockquotes

> This is a simple blockquote. It can span multiple lines and contain **formatted text**.

> **Note:** This is a note-style blockquote with a bold prefix.

:::note
This is a Docusaurus admonition note.
:::

:::tip
This is a tip admonition.
:::

:::info
This is an info admonition.
:::

:::caution
This is a caution admonition.
:::

:::danger
This is a danger admonition.
:::

---

## Images

![Placeholder](https://placehold.co/600x200/f0f0f0/999?text=Sample+Image&font=source-sans-pro)

---

## Horizontal Rules

Above the line.

---

Below the line.

***

Another style.

---

## Details/Accordion

<details>
<summary>Click to expand</summary>

This is hidden content that appears when you expand the details element.

- It can contain lists
- And other **formatted** content
- Including `code`

</details>

---

## Definition List (HTML)

<dl>
  <dt>Term 1</dt>
  <dd>Definition for term 1</dd>
  <dt>Term 2</dt>
  <dd>Definition for term 2</dd>
</dl>

---

## Keyboard Shortcuts

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.

Press <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open command palette.

---

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

---

## Math (if enabled)

Inline math: $E = mc^2$

Block math:

$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$
