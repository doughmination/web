// app.js - Unified JavaScript for all site functionality

// Define Turnstile callback immediately when script loads (before DOM is ready)
window.onTurnstileCallback = function(token) {
    console.log('Turnstile verified!', token);
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.disabled = false;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Determine current page based on URL or page identifier
    const currentPage = getCurrentPage();
    
    // Initialize appropriate functionality based on page
    switch(currentPage) {
        case 'index':
            initFileExplorer();
            break;
        case 'admin':
            initAdminPanel();
            break;
        case 'login':
            initLoginForm();
            break;
    }
    
    // Initialize common functionality
    initCommonFeatures();
});

// Utility function to determine current page
function getCurrentPage() {
    const path = window.location.pathname;
    const body = document.body;
    
    if (body.classList.contains('admin-page')) return 'admin';
    if (body.classList.contains('login-page')) return 'login';
    if (path.includes('/yuri/admin') && !body.classList.contains('login-page')) return 'admin';
    if (path.includes('/yuri/admin')) return 'login';
    return 'index';
}

// Common features used across all pages
function initCommonFeatures() {
    // Handle navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            // Add any common navigation handling here
        });
    });
}

// File Explorer functionality (from script.js)
function initFileExplorer() {
    const fileContainer = document.getElementById("file-container");
    const loading = document.getElementById("loading");
    let currentFolder = "";
    let isInitialLoad = true;
    const imageCache = new Map();

    function isImage(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        const extension = filename.split('.').pop().toLowerCase();
        return imageExtensions.includes(extension);
    }

    function getFileUrl(folder, filename) {
        const basePath = folder ? `/cdn/${folder}/${filename}` : `/cdn/${filename}`;
        return basePath.replace(/\/+/g, '/');
    }

    function normalizePath(path) {
        return path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
    }

    function preloadImage(src) {
        return new Promise((resolve, reject) => {
            if (imageCache.has(src)) {
                resolve(imageCache.get(src));
                return;
            }

            const img = new Image();
            img.onload = () => {
                imageCache.set(src, img);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to preload image: ${src}`);
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    }

    async function preloadImages(files, folder) {
        const imagePromises = files
            .filter(file => !file.is_dir && isImage(file.name))
            .map(file => {
                const imageUrl = getFileUrl(folder, file.name);
                return preloadImage(imageUrl).catch(err => {
                    console.warn(`Skipping failed image: ${file.name}`, err);
                    return null;
                });
            });

        const results = await Promise.allSettled(imagePromises);
        const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
        console.log(`Preloaded ${successCount} images out of ${imagePromises.length}`);
    }

    function animateContent(container, direction = 'in') {
        const cards = container.querySelectorAll('.card, p');
        cards.forEach((card, index) => {
            if (direction === 'in') {
                card.classList.add('swipe-in');
                card.style.animationDelay = `${index * 0.05}s`;
            } else {
                card.classList.add('swipe-out');
                card.style.animationDelay = `${index * 0.02}s`;
            }
        });
    }

    function clearAnimations(container) {
        const cards = container.querySelectorAll('.card, p');
        cards.forEach(card => {
            card.classList.remove('swipe-in', 'swipe-out');
            card.style.animationDelay = '';
        });
    }

    async function loadFolder(folder = "", isGoingBack = false) {
        const loading = document.getElementById("loading");
        const container = document.getElementById("file-container");
        
        folder = normalizePath(folder);
        currentFolder = folder;

        if (isInitialLoad && loading) {
            loading.style.display = "flex";
        }

        if (!isInitialLoad) {
            if (isGoingBack) {
                animateContent(container, 'out');
            }
            await new Promise(resolve => setTimeout(resolve, isGoingBack ? 300 : 0));
        }

        try {
            const response = await fetch(`/api/list?folder=${encodeURIComponent(folder)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const files = data.items || [];

            if (files.length > 0) {
                preloadImages(files, folder).catch(err => {
                    console.warn("Error preloading images:", err);
                });
            }

            container.innerHTML = "";
            clearAnimations(container);

            if (folder) {
                const backButton = document.createElement("div");
                backButton.className = "card back";
                backButton.innerHTML = `
                    <div class="folder-icon">⬅️</div>
                    <div class="file-name">
                        <img src="https://raw.githubusercontent.com/doughmination/Doughmination/main/icon.png" class="heart-icon">
                        <span>Back</span>
                    </div>
                `;
                backButton.addEventListener("click", () => {
                    const pathParts = folder.split('/').filter(part => part.length > 0);
                    pathParts.pop();
                    const parentFolder = pathParts.join('/');
                    loadFolder(parentFolder, true);
                    const newUrl = parentFolder ? `/${parentFolder}` : '/';
                    history.pushState(null, '', newUrl);
                });
                container.appendChild(backButton);
            }

            if (files.length === 0) {
                const noFiles = document.createElement("p");
                noFiles.textContent = "No files found";
                container.appendChild(noFiles);
            } else {
                files.forEach(file => {
                    const item = document.createElement("div");
                    item.className = "card";

                    let iconHtml = '';
                    
                    if (file.is_dir) {
                        iconHtml = '<div class="folder-icon">📁</div>';
                    } else if (isImage(file.name)) {
                        const imageUrl = getFileUrl(folder, file.name);
                        const cachedImage = imageCache.get(imageUrl);
                        
                        if (cachedImage) {
                            iconHtml = `<img src="${imageUrl}" alt="${file.name}" class="image-preview">`;
                        } else {
                            iconHtml = `<div class="image-placeholder">🖼️</div>`;
                            
                            preloadImage(imageUrl).then(() => {
                                const cards = container.querySelectorAll('.card');
                                cards.forEach(card => {
                                    const span = card.querySelector('span');
                                    if (span && span.textContent === file.name) {
                                        const placeholder = card.querySelector('.image-placeholder');
                                        if (placeholder) {
                                            placeholder.outerHTML = `<img src="${imageUrl}" alt="${file.name}" class="image-preview">`;
                                        }
                                    }
                                });
                            }).catch(err => {
                                console.warn(`Failed to load image ${file.name}:`, err);
                            });
                        }
                    } else {
                        iconHtml = '<div class="file-icon">📄</div>';
                    }

                    item.innerHTML = `
                        ${iconHtml}
                        <div class="file-name">
                            <img src="https://raw.githubusercontent.com/doughmination/Doughmination/main/icon.png" class="heart-icon">
                            <span>${file.name}</span>
                        </div>
                    `;

                    item.addEventListener("click", () => {
                        if (file.is_dir) {
                            const newFolder = folder ? `${folder}/${file.name}` : file.name;
                            const normalizedNewFolder = normalizePath(newFolder);
                            loadFolder(normalizedNewFolder, false);
                            history.pushState(null, '', `/${normalizedNewFolder}`);
                        } else {
                            const fileUrl = getFileUrl(folder, file.name);
                            window.open(fileUrl, '_blank');
                        }
                    });
                    
                    container.appendChild(item);
                });
            }

            if (!isInitialLoad) {
                animateContent(container, 'in');
            }

        } catch (err) {
            console.error("Error loading folder:", err);
            container.innerHTML = `<p>Error loading files: ${err.message}</p>`;
        } finally {
            if (isInitialLoad && loading) {
                loading.style.display = "none";
                isInitialLoad = false;
            }
        }
    }

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
        const path = location.pathname.slice(1);
        loadFolder(path, true);
    });

    // Load initial folder
    const initialPath = location.pathname.slice(1);
    loadFolder(initialPath);
}

// Admin Panel functionality
function initAdminPanel() {
    const destinationSelect = document.getElementById('destination');
    const newFolderGroup = document.getElementById('newFolderGroup');
    const resultDiv = document.getElementById('result');
    
    if (!destinationSelect || !newFolderGroup || !resultDiv) {
        console.warn('Admin panel elements not found');
        return;
    }

    // Load existing folders
    async function loadFolders() {
        try {
            const response = await fetch('/api/folders');
            
            if (response.status === 401) {
                window.location.href = '/yuri/admin';
                return;
            }
            
            const data = await response.json();
            
            while (destinationSelect.children.length > 2) {
                destinationSelect.removeChild(destinationSelect.lastChild);
            }
            
            data.folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder;
                option.textContent = `📁 ${folder}`;
                destinationSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Failed to load folders:', err);
            showResult('Failed to load folders. Please refresh the page.', 'error');
        }
    }
    
    // Handle destination change
    destinationSelect.addEventListener('change', function() {
        if (this.value === '__new__') {
            newFolderGroup.style.display = 'block';
        } else {
            newFolderGroup.style.display = 'none';
        }
    });
    
    // Handle form submission
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const destination = destinationSelect.value;
            
            if (destination === '__new__') {
                const newFolder = document.getElementById('newFolder').value.trim();
                if (!newFolder) {
                    showResult('Please enter a folder name', 'error');
                    return;
                }
                formData.set('destination', newFolder);
            } else {
                formData.set('destination', destination);
            }
            
            try {
                resultDiv.innerHTML = '<p style="color: #ff6fff;">Uploading...</p>';
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                // Handle common HTTP errors BEFORE trying to parse JSON
                if (response.status === 401) {
                    showResult('Session expired or not authenticated. Redirecting to login...', 'error');
                    setTimeout(() => {
                        window.location.href = '/yuri/admin';
                    }, 1500);
                    return;
                }
                
                if (response.status === 413) {
                    showResult('File too large! Maximum upload size is 100MB. Check your nginx configuration if you need to upload larger files.', 'error');
                    return;
                }
                
                if (response.status === 403) {
                    showResult('Permission denied. You do not have access to upload files.', 'error');
                    return;
                }
                
                if (response.status === 404) {
                    showResult('Upload endpoint not found. Please check your server configuration.', 'error');
                    return;
                }
                
                if (response.status === 500) {
                    showResult('Server error occurred during upload. Please check server logs or try again.', 'error');
                    return;
                }
                
                // For any other non-2xx status codes
                if (!response.ok) {
                    const text = await response.text();
                    showResult(`Upload failed (${response.status}): ${text.substring(0, 200)}`, 'error');
                    return;
                }
                
                // Get the response text first to check what we're dealing with
                const responseText = await response.text();
                
                // Check if response starts with '<' (likely HTML error page)
                if (responseText.trim().startsWith('<')) {
                    showResult(`Upload failed (${response.status}): Server returned HTML instead of JSON. This usually means a proxy or web server error. Response: ${responseText.substring(0, 200)}`, 'error');
                    return;
                }
                
                // Try to parse JSON response only for successful responses
                let result;
                const contentType = response.headers.get('content-type');
                
                // Check if content type is JSON
                if (contentType && contentType.includes('application/json')) {
                    try {
                        result = JSON.parse(responseText);
                    } catch (e) {
                        showResult(`Upload completed but failed to parse server response: ${e.message}. Response: ${responseText.substring(0, 200)}`, 'error');
                        return;
                    }
                } else {
                    // Non-JSON response even on success
                    showResult(`Upload completed but server returned unexpected response format. Content-Type: ${contentType}. Response: ${responseText.substring(0, 200)}`, 'error');
                    return;
                }
                
                // If we made it here, we have a successful response with JSON
                showResult(`Successfully uploaded: ${result.filename}<br>
                           Size: ${(result.size / 1024).toFixed(1)} KB<br>
                           Location: <a href="/cdn/${result.path}" target="_blank" style="color: #ff6fff;">/${result.path}</a>`, 'success');
                
                loadFolders();
                this.reset();
                newFolderGroup.style.display = 'none';
            } catch (err) {
                showResult(`Upload failed: ${err.message}`, 'error');
            }
        });
    }
    
    function showResult(message, type) {
        resultDiv.innerHTML = `<div class="${type}">${message}</div>`;
    }
    
    loadFolders();
}

// Login form functionality
function initLoginForm() {
    const submitButton = document.getElementById('submitButton');
    const turnstileDiv = document.querySelector('.cf-turnstile');
    
    // If no Turnstile is configured, enable the button immediately
    if (!turnstileDiv && submitButton) {
        submitButton.disabled = false;
    }
}