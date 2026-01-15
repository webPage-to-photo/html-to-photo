// ==================== 国际化配置 (i18n) ====================
const translations = {
    'zh': {
        'app_title': 'HTML转图片工具',
        'lang_btn': 'EN',
        'section_input_title': '1. 粘贴HTML代码',
        'section_input_hint': '需包含 <section class="page">',
        'section_preview_title': '2. 预览效果',
        'status_waiting': '等待渲染...',
        'status_found_pages': '找到 {n} 个页面',
        'status_no_pages': '未找到页面',
        'preview_empty_hint': '点击"渲染预览"查看效果',
        'error_no_pages_title': '未找到任何 .page 元素！',
        'error_no_pages_hint': '请确保HTML中包含 <section class="page">',
        'error_render_failed': '渲染失败！',
        'btn_render': '渲染预览',
        'btn_convert': '转换所有页面',
        'btn_download_zip': '下载为ZIP',
        'status_converting': '转换中... {n}% ({current}/{total})',
        'notify_render_success': '✅ 成功渲染 {n} 个页面',
        'notify_render_error': '❌ 渲染失败: {msg}',
        'notify_input_empty': '❌ 请先粘贴HTML代码',
        'notify_convert_success': '✅ 成功转换 {n} 个页面',
        'notify_convert_fail': '❌ 转换失败: {msg}',
        'notify_zip_start': '📦 正在打包ZIP...',
        'notify_zip_success': '✅ 成功下载 {n} 张图片',
        'notify_zip_fail': '❌ 打包失败: {msg}',
        'notify_no_images': '❌ 没有可下载的图片',
        'placeholder_html': '将完整的HTML代码粘贴到这里...\n\n示例格式：\n<!DOCTYPE html>\n<html>\n<head>...</head>\n<body>\n  <section class="page">...</section>\n  <section class="page">...</section>\n</body>\n</html>'
    },
    'en': {
        'app_title': 'HTML to Image Tool',
        'lang_btn': '中',
        'section_input_title': '1. Paste HTML Code',
        'section_input_hint': 'Must include <section class="page">',
        'section_preview_title': '2. Preview',
        'status_waiting': 'Waiting for input...',
        'status_found_pages': 'Found {n} pages',
        'status_no_pages': 'No pages found',
        'preview_empty_hint': 'Click "Render Preview" to see result',
        'error_no_pages_title': 'No .page elements found!',
        'error_no_pages_hint': 'Please ensure HTML has <section class="page">',
        'error_render_failed': 'Render Failed!',
        'btn_render': 'Render Preview',
        'btn_convert': 'Convert All Pages',
        'btn_download_zip': 'Download ZIP',
        'status_converting': 'Converting... {n}% ({current}/{total})',
        'notify_render_success': '✅ Successfully rendered {n} pages',
        'notify_render_error': '❌ Render failed: {msg}',
        'notify_input_empty': '❌ Please paste HTML code first',
        'notify_convert_success': '✅ Successfully converted {n} pages',
        'notify_convert_fail': '❌ Conversion failed: {msg}',
        'notify_zip_start': '📦 Zipping images...',
        'notify_zip_success': '✅ Downloaded {n} images',
        'notify_zip_fail': '❌ Zip failed: {msg}',
        'notify_no_images': '❌ No images to download',
        'placeholder_html': 'Paste your complete HTML code here...\n\nExample Format:\n<!DOCTYPE html>\n<html>\n<head>...</head>\n<body>\n  <section class="page">...</section>\n  <section class="page">...</section>\n</body>\n</html>'
    }
};

let currentLang = 'zh';

// ==================== 全局变量 ====================
let renderedPages = [];
let convertedImages = [];
let currentZoom = 0.5;

// ==================== DOM元素引用 ====================
const htmlInput = document.getElementById('html-input');
const previewArea = document.getElementById('preview-area');
const pageCount = document.getElementById('page-count');
const btnRender = document.getElementById('btn-render');
const btnConvert = document.getElementById('btn-convert');
const btnZip = document.getElementById('btn-zip');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

const langToggle = document.getElementById('lang-toggle');
const themeToggle = document.getElementById('theme-toggle');
const zoomControls = document.getElementById('zoom-controls');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnZoomReset = document.getElementById('btn-zoom-reset');
const zoomLevelText = document.getElementById('zoom-level');
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');

// ==================== helper: 获取翻译文本 ====================
function t(key, params = {}) {
    let text = translations[currentLang][key] || key;
    // 替换参数 {n}, {msg} 等
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
}

// ==================== 0. 国际化切换模块 ====================
function initLanguage() {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        currentLang = savedLang;
    } else {
        // 自动检测浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.toLowerCase().startsWith('zh')) {
            currentLang = 'zh';
        } else {
            currentLang = 'en';
        }
    }
    applyLanguage();
}

function applyLanguage() {
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';

    // 更新所有静态文本 [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // 更新 Placeholder
    if (htmlInput) {
        htmlInput.placeholder = t('placeholder_html');
    }

    // 更新语言按钮文本
    if (langToggle) {
        langToggle.textContent = t('lang_btn');
    }

    // 保存偏好
    localStorage.setItem('lang', currentLang);
}

if (langToggle) {
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        applyLanguage();
    });
}

// ==================== 1. 主题切换模块 ====================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (iconSun) iconSun.style.display = 'block';
        if (iconMoon) iconMoon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (iconSun) iconSun.style.display = 'none';
        if (iconMoon) iconMoon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = !document.documentElement.hasAttribute('data-theme');
        setTheme(isDark ? 'light' : 'dark');
    });
}

// ==================== 2. 缩放控制模块 ====================
function updateZoom() {
    if (currentZoom < 0.1) currentZoom = 0.1;
    if (currentZoom > 2.0) currentZoom = 2.0;

    if (previewArea) {
        previewArea.style.transform = `scale(${currentZoom})`;
    }

    if (zoomLevelText) {
        zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
    }
}

function zoomIn() {
    currentZoom += 0.1;
    updateZoom();
}

function zoomOut() {
    currentZoom -= 0.1;
    updateZoom();
}

function resetZoom() {
    currentZoom = 0.45;
    updateZoom();
}

if (btnZoomIn) btnZoomIn.addEventListener('click', zoomIn);
if (btnZoomOut) btnZoomOut.addEventListener('click', zoomOut);
if (btnZoomReset) btnZoomReset.addEventListener('click', resetZoom);

// ==================== 3. HTML渲染模块 ====================
function renderHTML(htmlCode) {
    try {
        previewArea.innerHTML = '';

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = htmlCode;

        const pages = tempContainer.querySelectorAll('.page');

        if (pages.length === 0) {
            previewArea.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style="color: #ef4444; margin-top: 12px;">${t('error_no_pages_title')}</p>
                    <p style="color: var(--text-hint); font-size: 13px; margin-top: 4px;">${t('error_no_pages_hint')}</p>
                </div>
            `;
            pageCount.textContent = t('status_no_pages');
            btnConvert.disabled = true;
            btnZip.disabled = true;
            zoomControls.style.display = 'none';
            return;
        }

        pages.forEach((page, index) => {
            const clonedPage = page.cloneNode(true);
            clonedPage.setAttribute('data-page-index', index);
            clonedPage.style.marginBottom = '20px';
            previewArea.appendChild(clonedPage);
        });

        const styles = tempContainer.querySelectorAll('style');
        styles.forEach(style => {
            const clonedStyle = style.cloneNode(true);
            previewArea.appendChild(clonedStyle);
        });

        renderedPages = Array.from(previewArea.querySelectorAll('.page'));
        pageCount.textContent = t('status_found_pages', { n: renderedPages.length });
        btnConvert.disabled = false;
        btnZip.disabled = false;

        if (zoomControls) zoomControls.style.display = 'flex';
        resetZoom();

        showNotification(t('notify_render_success', { n: renderedPages.length }), 'success');
    } catch (error) {
        console.error('渲染错误:', error);
        previewArea.innerHTML = `
            <div class="empty-state">
                <p style="color: #ef4444;">${t('error_render_failed')}</p>
                <p style="color: var(--text-hint); font-size: 13px;">${error.message}</p>
            </div>
        `;
        showNotification(t('notify_render_error', { msg: error.message }), 'error');
    }
}

// ==================== 5. HTML转图片模块 ====================
async function convertPageToImage(pageElement, pageIndex) {
    try {
        const canvas = await html2canvas(pageElement, {
            width: 1080,
            height: 1350,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#F5F5F7',
            logging: false,
            onclone: (clonedDoc) => {
                const clonedPage = clonedDoc.querySelector(`[data-page-index="${pageIndex}"]`);
                if (clonedPage) {
                    clonedPage.style.display = 'flex';
                    clonedPage.style.transform = 'none';
                    clonedPage.style.margin = '0';
                }
            }
        });

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob) {
                    resolve({
                        blob: blob,
                        filename: `page_${String(pageIndex + 1).padStart(2, '0')}.png`
                    });
                } else {
                    reject(new Error('无法生成图片'));
                }
            }, 'image/png');
        });
    } catch (error) {
        console.error(`转换页面 ${pageIndex + 1} 失败:`, error);
        throw error;
    }
}

// ==================== 6. 批量转换模块 ====================
async function convertAllPages() {
    if (renderedPages.length === 0) {
        showNotification(t('notify_input_empty'), 'error');
        return [];
    }

    try {
        progressContainer.style.display = 'flex';
        convertedImages = [];

        const totalPages = renderedPages.length;

        for (let i = 0; i < totalPages; i++) {
            const progress = Math.round(((i + 1) / totalPages) * 100);
            progressFill.style.width = `${progress}%`;
            progressText.textContent = t('status_converting', { n: progress, current: i + 1, total: totalPages });

            const image = await convertPageToImage(renderedPages[i], i);
            convertedImages.push(image);

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';

        if (convertedImages.length > 0) {
            showNotification(t('notify_convert_success', { n: totalPages }), 'success');
        }
        return convertedImages;
    } catch (error) {
        console.error('批量转换失败:', error);
        progressContainer.style.display = 'none';
        showNotification(t('notify_convert_fail', { msg: error.message }), 'error');
        return [];
    }
}

// ==================== 7. 下载模块 ====================
function downloadSingleImage(blob, filename) {
    saveAs(blob, filename);
}

async function downloadAsZip(images) {
    if (images.length === 0) {
        showNotification(t('notify_no_images'), 'error');
        return;
    }

    try {
        showNotification(t('notify_zip_start'), 'info');

        const zip = new JSZip();
        images.forEach(({ blob, filename }) => {
            zip.file(filename, blob);
        });

        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        saveAs(zipBlob, `html-pages-${Date.now()}.zip`);
        showNotification(t('notify_zip_success', { n: images.length }), 'success');
    } catch (error) {
        showNotification(t('notify_zip_fail', { msg: error.message }), 'error');
    }
}

// ==================== 8. 事件绑定 ====================
btnRender.addEventListener('click', () => {
    const htmlCode = htmlInput.value.trim();
    if (!htmlCode) {
        showNotification(t('notify_input_empty'), 'error');
        return;
    }
    renderHTML(htmlCode);
});

btnConvert.addEventListener('click', async () => {
    btnConvert.disabled = true;
    btnZip.disabled = true;

    const images = await convertAllPages();

    if (images.length > 0) {
        for (const { blob, filename } of images) {
            downloadSingleImage(blob, filename);
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    btnConvert.disabled = false;
    btnZip.disabled = false;
});

btnZip.addEventListener('click', async () => {
    btnConvert.disabled = true;
    btnZip.disabled = true;

    let images = convertedImages;
    if (images.length === 0) {
        images = await convertAllPages();
    }

    if (images.length > 0) {
        await downloadAsZip(images);
    }

    btnConvert.disabled = false;
    btnZip.disabled = false;
});

// ==================== 辅助函数：通知提示 ====================
function showNotification(message, type = 'info') {
    const oldNotification = document.querySelector('.notification-toast');
    if (oldNotification) {
        document.body.removeChild(oldNotification);
    }

    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 12px 20px;
        background: ${type === 'success' ? 'var(--accent-green)' : type === 'error' ? '#ef4444' : 'var(--accent-blue)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    notification.innerHTML = message;

    // ... animation styles (kept same as before) ...
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ==================== 初始化 ====================
initTheme();
initLanguage(); // 初始化语言
console.log('✅ HTML转图片工具已加载');
console.log('📌 Support: <section class="page">');
