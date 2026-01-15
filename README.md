# HTML to Image Converter 📸

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A pure frontend tool to convert HTML code into high-quality images instantly. Paste your AI-generated HTML, preview it, and export as PNG or ZIP.

[🇨🇳 中文文档 (Chinese Documentation)](README.cn.md) | [🚀 Live Demo](https://webpage-to-photo.github.io/html-to-photo/)

---

## 🌟 Key Features

- **Pure Frontend**: Runs entirely in your browser using `html2canvas`. No server required.
- **Auto Pagination**: Automatically detects `<section class="page">` elements.
- **Batch Processing**: Convert multiple pages at once into high-res PNGs (2x scale).
- **ZIP Export**: One-click download for all generated images.
- **Modern UI**: Full-screen app layout, dark/light theme, and independent scrolling.

## 📖 Quick Start

1.  **Paste HTML**: Paste your code containing `<section class="page">` elements into the left panel.
2.  **Preview**: Click **Render Preview** to see the result instantly.
3.  **Export**: Click **Convert All** to download images individually or **Download ZIP** for a package.

## 📋 HTML Format Requirement

Your HTML must use the `.page` class to define page boundaries:

```html
<body>
    <section class="page">
        <!-- Page 1 Content -->
    </section>
    <section class="page">
        <!-- Page 2 Content -->
    </section>
</body>
```

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript, HTML5, CSS3
- **Libraries**: `html2canvas`, `JSZip`, `FileSaver.js`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
