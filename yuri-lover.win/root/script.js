document.addEventListener("DOMContentLoaded", () => {
    const fileContainer = document.getElementById("file-container");
    const loading = document.getElementById("loading");
    let currentFolder = "";
    let isInitialLoad = true;
    const imageCache = new Map(); // Cache for preloaded images

    // Function to check if a file is an image
    function isImage(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        const extension = filename.split('.').pop().toLowerCase();
        return imageExtensions.includes(extension);
    }

    // Function to get the full URL for a file
    function getFileUrl(folder, filename) {
        const basePath = folder ? `/cdn/${folder}/${filename}` : `/cdn/${filename}`;
        return basePath.replace(/\/+/g, '/'); // Remove double slashes
    }

    // Function to normalize folder paths
    function normalizePath(path) {
        return path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
    }

    // Function to preload an image
    function preloadImage(src) {
        return new Promise((resolve, reject) => {
            // Check if already cached
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

    // Function to preload all images in current folder
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

        // Wait for all images to load (or fail)
        const results = await Promise.allSettled(imagePromises);
        const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
        console.log(`Preloaded ${successCount} images out of ${imagePromises.length}`);
    }

    // Function to animate content
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

    // Function to clear animations
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
        
        // Normalize the folder path
        folder = normalizePath(folder);
        currentFolder = folder;

        // Show loading screen only on initial load
        if (isInitialLoad && loading) {
            loading.style.display = "flex";
        }

        // If not initial load, animate out current content
        if (!isInitialLoad) {
            if (isGoingBack) {
                animateContent(container, 'out');
            }
            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, isGoingBack ? 300 : 0));
        }

        try {
            const response = await fetch(`/api/list?folder=${encodeURIComponent(folder)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            // Use 'items' instead of 'files' to match server response
            const files = data.items || [];

            // Preload images in background
            if (files.length > 0) {
                preloadImages(files, folder).catch(err => {
                    console.warn("Error preloading images:", err);
                });
            }

            // Clear container and animations
            container.innerHTML = "";
            clearAnimations(container);

            // Add back button if not in root folder
            if (folder) {
                const backButton = document.createElement("div");
                backButton.className = "card back";
                backButton.innerHTML = `
                    <div class="folder-icon">⬅️</div>
                    <div class="file-name">
                        <img src="https://www.yuri-lover.win/cdn/animated-emojis/cl_heart.gif" class="heart-icon">
                        <span>Back</span>
                    </div>
                `;
                backButton.addEventListener("click", () => {
                    const pathParts = folder.split('/').filter(part => part.length > 0);
                    pathParts.pop(); // Remove last part
                    const parentFolder = pathParts.join('/');
                    loadFolder(parentFolder, true); // true indicates going back
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
                        // Folder
                        iconHtml = '<div class="folder-icon">📁</div>';
                    } else if (isImage(file.name)) {
                        // Image file - use cached image if available, otherwise show loading placeholder
                        const imageUrl = getFileUrl(folder, file.name);
                        const cachedImage = imageCache.get(imageUrl);
                        
                        if (cachedImage) {
                            iconHtml = `<img src="${imageUrl}" alt="${file.name}" class="image-preview">`;
                        } else {
                            // Show a placeholder while image loads
                            iconHtml = `<div class="image-placeholder">🖼️</div>`;
                            
                            // Try to load the image and replace placeholder when ready
                            preloadImage(imageUrl).then(() => {
                                // Find the card and update the image
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
                        // Regular file
                        iconHtml = '<div class="file-icon">📄</div>';
                    }

                    item.innerHTML = `
                        ${iconHtml}
                        <div class="file-name">
                            <img src="https://www.yuri-lover.win/cdn/animated-emojis/cl_heart.gif" class="heart-icon">
                            <span>${file.name}</span>
                        </div>
                    `;

                    // Add click handler
                    item.addEventListener("click", () => {
                        if (file.is_dir) {
                            // Navigate to folder
                            const newFolder = folder ? `${folder}/${file.name}` : file.name;
                            const normalizedNewFolder = normalizePath(newFolder);
                            loadFolder(normalizedNewFolder, false); // false indicates going forward
                            history.pushState(null, '', `/${normalizedNewFolder}`);
                        } else {
                            // Open file
                            const fileUrl = getFileUrl(folder, file.name);
                            window.open(fileUrl, '_blank');
                        }
                    });
                    
                    container.appendChild(item);
                });
            }

            // Animate in new content (except on initial load)
            if (!isInitialLoad) {
                animateContent(container, 'in');
            }

        } catch (err) {
            console.error("Error loading folder:", err);
            container.innerHTML = `<p>Error loading files: ${err.message}</p>`;
        } finally {
            // Hide loading screen only after initial load
            if (isInitialLoad && loading) {
                loading.style.display = "none";
                isInitialLoad = false;
            }
        }
    }

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
        const path = location.pathname.slice(1);
        loadFolder(path, true); // Treat browser navigation as going back
    });

    // Load root folder on page load
    const initialPath = location.pathname.slice(1);
    loadFolder(initialPath);
});