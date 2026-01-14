// ==================== 全局变量 ====================
let renderedPages = [];
let convertedImages = [];
let currentZoom = 0.5; // 默认缩放 50%

// ==================== DOM元素引用 ====================
const htmlInput = document.getElementById('html-input');
const previewArea = document.getElementById('preview-area'); // 这里的previewArea实际是 .zoom-wrapper
const pageCount = document.getElementById('page-count');
const btnRender = document.getElementById('btn-render');
const btnConvert = document.getElementById('btn-convert');
const btnZip = document.getElementById('btn-zip');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// 新增 DOM 元素
const themeToggle = document.getElementById('theme-toggle');
const zoomControls = document.getElementById('zoom-controls');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnZoomReset = document.getElementById('btn-zoom-reset');
const zoomLevelText = document.getElementById('zoom-level');
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');

// ==================== 1. 主题切换模块 ====================
function initTheme() {
    // 检查本地存储的主题
    const savedTheme = localStorage.getItem('theme');

    // 默认使用深色模式
    if (savedTheme === 'light') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

function setTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
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
    // 限制缩放范围 10% - 200%
    if (currentZoom < 0.1) currentZoom = 0.1;
    if (currentZoom > 2.0) currentZoom = 2.0;

    // 应用缩放
    if (previewArea) {
        previewArea.style.transform = `scale(${currentZoom})`;
    }

    // 更新文本显示
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
    currentZoom = 0.45; // 默认适合查看的大小
    updateZoom();
}

// 绑定缩放事件
if (btnZoomIn) btnZoomIn.addEventListener('click', zoomIn);
if (btnZoomOut) btnZoomOut.addEventListener('click', zoomOut);
if (btnZoomReset) btnZoomReset.addEventListener('click', resetZoom);

// ==================== 3. HTML渲染模块 ====================
function renderHTML(htmlCode) {
    try {
        // 清空预览区
        previewArea.innerHTML = '';

        // 创建临时容器来解析HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = htmlCode;

        // 查找所有.page元素
        const pages = tempContainer.querySelectorAll('.page');

        if (pages.length === 0) {
            previewArea.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style="color: #ef4444; margin-top: 12px;">未找到任何 .page 元素！</p>
                    <p style="color: var(--text-hint); font-size: 13px; margin-top: 4px;">请确保HTML中包含 &lt;section class="page"&gt;</p>
                </div>
            `;
            pageCount.textContent = '未找到页面';
            btnConvert.disabled = true;
            btnZip.disabled = true;
            zoomControls.style.display = 'none';
            return;
        }

        // 将所有页面元素添加到预览区
        pages.forEach((page, index) => {
            const clonedPage = page.cloneNode(true);
            clonedPage.setAttribute('data-page-index', index);
            // 确保页面之间有间距
            clonedPage.style.marginBottom = '20px';
            previewArea.appendChild(clonedPage);
        });

        // 将<style>标签也复制过来
        const styles = tempContainer.querySelectorAll('style');
        styles.forEach(style => {
            const clonedStyle = style.cloneNode(true);
            previewArea.appendChild(clonedStyle);
        });

        // 更新状态
        renderedPages = Array.from(previewArea.querySelectorAll('.page'));
        pageCount.textContent = `找到 ${renderedPages.length} 个页面`;
        btnConvert.disabled = false;
        btnZip.disabled = false;

        // 显示缩放控制
        if (zoomControls) zoomControls.style.display = 'flex';
        resetZoom(); // 渲染后重置缩放

        // 显示成功提示
        showNotification(`✅ 成功渲染 ${renderedPages.length} 个页面`, 'success');
    } catch (error) {
        console.error('渲染错误:', error);
        previewArea.innerHTML = `
            <div class="empty-state">
                <p style="color: #ef4444;">渲染失败！</p>
                <p style="color: var(--text-hint); font-size: 13px;">${error.message}</p>
            </div>
        `;
        showNotification(`❌ 渲染失败: ${error.message}`, 'error');
    }
}

// ==================== 4. 页面检测模块 ====================
function detectPages(container) {
    const pages = container.querySelectorAll('.page');
    return Array.from(pages);
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
                // 确保克隆文档中的样式正确应用
                const clonedPage = clonedDoc.querySelector(`[data-page-index="${pageIndex}"]`);
                if (clonedPage) {
                    clonedPage.style.display = 'flex';
                    // 移除缩放影响，确保生成的图片是原尺寸
                    clonedPage.style.transform = 'none';
                    clonedPage.style.margin = '0';
                }
            }
        });

        // 将canvas转为Blob
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
        showNotification('❌ 请先渲染HTML代码', 'error');
        return [];
    }

    try {
        // 显示进度条
        progressContainer.style.display = 'flex';
        convertedImages = [];

        const totalPages = renderedPages.length;

        for (let i = 0; i < totalPages; i++) {
            // 更新进度
            const progress = Math.round(((i + 1) / totalPages) * 100);
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `转换中... ${progress}% (${i + 1}/${totalPages})`;

            // 转换当前页面
            const image = await convertPageToImage(renderedPages[i], i);
            convertedImages.push(image);

            // 添加小延迟确保UI更新
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 隐藏进度条
        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';

        if (convertedImages.length > 0) {
            showNotification(`✅ 成功转换 ${totalPages} 个页面`, 'success');
        }
        return convertedImages;
    } catch (error) {
        console.error('批量转换失败:', error);
        progressContainer.style.display = 'none';
        showNotification(`❌ 转换失败: ${error.message}`, 'error');
        return [];
    }
}

// ==================== 7. 下载模块 ====================
function downloadSingleImage(blob, filename) {
    saveAs(blob, filename);
}

async function downloadAsZip(images) {
    if (images.length === 0) {
        showNotification('❌ 没有可下载的图片', 'error');
        return;
    }

    try {
        showNotification('📦 正在打包ZIP...', 'info');

        const zip = new JSZip();

        // 添加所有图片到ZIP
        images.forEach(({ blob, filename }) => {
            zip.file(filename, blob);
        });

        // 生成ZIP文件
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        // 下载ZIP
        saveAs(zipBlob, `html-pages-${Date.now()}.zip`);
        showNotification(`✅ 成功下载 ${images.length} 张图片`, 'success');
    } catch (error) {
        console.error('打包ZIP失败:', error);
        showNotification(`❌ 打包失败: ${error.message}`, 'error');
    }
}

// ==================== 8. 事件绑定 ====================
btnRender.addEventListener('click', () => {
    const htmlCode = htmlInput.value.trim();

    if (!htmlCode) {
        showNotification('❌ 请先粘贴HTML代码', 'error');
        return;
    }

    renderHTML(htmlCode);
});

btnConvert.addEventListener('click', async () => {
    btnConvert.disabled = true;
    btnZip.disabled = true;

    const images = await convertAllPages();

    if (images.length > 0) {
        // 自动下载所有图片
        for (const { blob, filename } of images) {
            downloadSingleImage(blob, filename);
            await new Promise(resolve => setTimeout(resolve, 300)); // 延迟避免浏览器拦截
        }
    }

    btnConvert.disabled = false;
    btnZip.disabled = false;
});

btnZip.addEventListener('click', async () => {
    btnConvert.disabled = true;
    btnZip.disabled = true;

    let images = convertedImages;

    // 如果还没转换过，先转换
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
    // 移除旧的通知
    const oldNotification = document.querySelector('.notification-toast');
    if (oldNotification) {
        document.body.removeChild(oldNotification);
    }

    // 创建通知元素
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

    // 添加动画样式
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

    // 3秒后自动移除
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
console.log('✅ HTML转图片工具已加载');
console.log('📌 支持的HTML格式: 包含 <section class="page"> 元素');
