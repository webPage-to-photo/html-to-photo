// ==================== 全局变量 ====================
let renderedPages = [];
let convertedImages = [];

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

// ==================== 1. HTML渲染模块 ====================
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
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style="color: #ef4444;">未找到任何 .page 元素！</p>
                    <p style="color: #999; font-size: 14px; margin-top: 8px;">请确保HTML中包含 &lt;section class="page"&gt;</p>
                </div>
            `;
            pageCount.textContent = '未找到页面';
            btnConvert.disabled = true;
            btnZip.disabled = true;
            return;
        }

        // 将所有页面元素添加到预览区
        pages.forEach((page, index) => {
            const clonedPage = page.cloneNode(true);
            clonedPage.setAttribute('data-page-index', index);
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

        // 显示成功提示
        showNotification(`✅ 成功渲染 ${renderedPages.length} 个页面`, 'success');
    } catch (error) {
        console.error('渲染错误:', error);
        previewArea.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p style="color: #ef4444;">渲染失败！</p>
                <p style="color: #999; font-size: 14px; margin-top: 8px;">${error.message}</p>
            </div>
        `;
        showNotification(`❌ 渲染失败: ${error.message}`, 'error');
    }
}

// ==================== 2. 页面检测模块 ====================
function detectPages(container) {
    const pages = container.querySelectorAll('.page');
    return Array.from(pages);
}

// ==================== 3. HTML转图片模块 ====================
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

// ==================== 4. 批量转换模块 ====================
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

        showNotification(`✅ 成功转换 ${totalPages} 个页面`, 'success');
        return convertedImages;
    } catch (error) {
        console.error('批量转换失败:', error);
        progressContainer.style.display = 'none';
        showNotification(`❌ 转换失败: ${error.message}`, 'error');
        return [];
    }
}

// ==================== 5. 下载模块 ====================
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

// ==================== 6. 事件绑定 ====================
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
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // 添加动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== 初始化 ====================
console.log('✅ HTML转图片工具已加载');
console.log('📌 支持的HTML格式: 包含 <section class="page"> 元素');
