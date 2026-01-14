# HTML转图片工具 📸

一个基于 **html2canvas** 的纯前端HTML转图片在线工具，部署在GitHub Pages上。用户可以将AI生成的HTML代码粘贴到工具中，自动识别所有页面并一键转换为PNG图片。

---

## 🌟 功能特点

✅ **纯前端实现**：无需后端服务，完全基于浏览器运行  
✅ **自动识别分页**：自动检测HTML中的 `<section class="page">` 元素  
✅ **实时预览**：粘贴代码后即可预览渲染效果  
✅ **批量转换**：一键转换所有页面为高清PNG图片（2倍分辨率）  
✅ **ZIP打包下载**：支持将所有图片打包为ZIP文件下载  
✅ **现代化UI**：深色主题、流畅动画、响应式设计  

---

## 🚀 在线演示

**[https://webpage-to-photo.github.io/html-to-photo/](https://webpage-to-photo.github.io/html-to-photo/)**

---

## 📖 使用方法

### 3步完成转换：

1. **粘贴HTML代码**  
   将完整的HTML代码（包含 `<style>` 和 `<body>` 内容）粘贴到左侧输入框

2. **预览渲染效果**  
   点击"渲染预览"按钮，右侧将显示实时预览效果

3. **下载图片**  
   - 点击"转换所有页面"：逐张下载PNG图片  
   - 点击"下载为ZIP"：打包下载所有图片

---

## 📋 HTML格式要求

您的HTML代码必须包含 `<section class="page">` 元素，工具会自动识别每个 `.page` 作为独立页面进行转换。

### 示例格式：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>示例页面</title>
    <style>
        .page {
            width: 1080px;
            height: 1350px;
            background: #fff;
            /* 其他样式... */
        }
    </style>
</head>
<body>
    <section class="page">
        <!-- 第一页内容 -->
    </section>
    <section class="page">
        <!-- 第二页内容 -->
    </section>
</body>
</html>
```

---

## 🛠️ 技术栈

- **HTML5 + CSS3**：页面结构和样式  
- **Vanilla JavaScript**：核心逻辑（无框架依赖）  
- **html2canvas (v1.4.1)**：DOM转Canvas图片  
- **JSZip (v3.10.1)**：ZIP文件打包  
- **FileSaver.js (v2.0.5)**：文件下载  

---

## ⚠️ 常见问题（FAQ）

### 1. 为什么外部图片无法显示？

**原因**：跨域限制（CORS Policy）  
**解决方案**：
- 使用内联Base64图片（Data URI）
- 或将图片托管在支持CORS的CDN上

### 2. 为什么自定义字体没有加载？

**原因**：字体文件跨域或加载时间过长  
**解决方案**：
- 使用Google Fonts等公共字体服务
- 或内嵌字体文件（Base64编码）
- 确保字体文件URL支持CORS

### 3. 转换后的图片样式与预览不一致？

**原因**：html2canvas对某些CSS特性支持有限  
**解决方案**：
- 避免使用复杂的CSS3特效（如 `filter`、`backdrop-filter`）
- 使用标准的CSS属性
- 测试不同浏览器的渲染效果

### 4. 可以转换多大的HTML文件？

**限制**：取决于浏览器内存和性能  
**建议**：
- 单个页面不超过10MB
- 总页面数不超过50个
- 避免过多的高分辨率图片

---

## 🌐 部署指南（GitHub Pages）

### 步骤：

1. **创建GitHub仓库**  
   ```bash
   # 在项目目录中初始化Git
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到GitHub**  
   ```bash
   # 在GitHub上创建新仓库（名称：html-to-image-converter）
   git remote add origin https://github.com/YOUR_USERNAME/html-to-image-converter.git
   git branch -M main
   git push -u origin main
   ```

3. **启用GitHub Pages**  
   - 进入仓库 **Settings** → **Pages**
   - Source 选择 **Deploy from a branch**
   - Branch 选择 **main** / **/ (root)**
   - 点击 **Save**

4. **访问在线工具**  
   几分钟后，访问：`https://YOUR_USERNAME.github.io/html-to-image-converter/`

---

## 📄 许可证

MIT License - 自由使用和修改

---

## 🙏 致谢

感谢以下开源项目：
- [html2canvas](https://github.com/niklasvh/html2canvas)
- [JSZip](https://github.com/Stuk/jszip)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js)

---

## 📧 反馈与建议

如有问题或建议，欢迎提交 [GitHub Issue](https://github.com/YOUR_USERNAME/html-to-image-converter/issues)
