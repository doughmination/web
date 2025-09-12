// ==================== LOADING SCREEN & SCROLL ANIMATIONS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Reset any lingering transition effects from back button navigation
    resetTransitionState();

    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');

    // Hide loading screen after 4 seconds
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        mainContent.classList.remove('hidden');

        // Remove loading screen from DOM after fade animation
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }, 4000);
});

// Intersection Observer for scroll animations with fade out
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Element is coming into view - fade in
            entry.target.classList.add('visible');
        } else {
            // Element is going out of view - fade out
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in-element');
    fadeElements.forEach(element => {
        // Keep header always visible once it appears
        if (element.tagName === 'HEADER') {
            const headerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // Stop observing once visible
                        headerObserver.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            headerObserver.observe(element);
        } else {
            observer.observe(element);
        }
    });

    // Add smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            // Check if it's an external link (starts with http/https) or internal anchor
            if (targetId.startsWith('http') || targetId.startsWith('//')) {
                // Let external links work normally
                return;
            }

            // Only prevent default for internal anchor links
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Enhanced transition functionality for syster and system buttons
    setupTransitionButtons();
});

function setupTransitionButtons() {

    // Github button transition (deeper twilight variant)
    const butterflyButton = document.querySelector('.butterfly-button a');
    if (butterflyButton) {
        butterflyButton.addEventListener('click', (e) => {
            e.preventDefault();
            const url = butterflyButton.dataset.url;

            // System colors (darker, more mysterious)
            const butterflyColors = {
                '--cyan-dark': '#1a0f2e',
                '--cyan-medium': '#2f1b4a',
                '--cyan-light': '#5b4b75',
                '--lavender-purple': '#7b6cb6',
                '--diamond-pink': '#d8c7da',
                '--diamond-cream': '#f0e8dc',
                '--accent-glow': '#8388ee'
            };

            performTransition(url, butterflyColors, 'Connecting to network...', '🦋');
        });
    }
}

function performTransition(url, colorScheme, loadingText, emoji = '✦') {
    // Create transition overlay with HARDCODED starting cyan colors
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'transition-overlay';

    // Set initial hardcoded cyan colors AND transition property
    transitionOverlay.style.background = 'linear-gradient(135deg, #003f5c 0%, #2f6690 100%)';
    transitionOverlay.style.transition = 'opacity 0.6s ease, background 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    // Create loading content
    const transitionContent = document.createElement('div');
    transitionContent.className = 'transition-content';
    transitionContent.innerHTML = `
        <div class="spinning-emoji">${emoji}</div>
        <div class="transition-diamonds">
            <span class="diamond">✦</span>
            <span class="diamond">✧</span>
            <span class="diamond">⋆</span>
            <span class="diamond">✦</span>
            <span class="diamond">✧</span>
        </div>
        <p class="transition-text">${loadingText}</p>
    `;

    transitionOverlay.appendChild(transitionContent);
    document.body.appendChild(transitionOverlay);

    // Add the transition overlay styles dynamically
    if (!document.getElementById('transition-styles')) {
        const transitionStyles = document.createElement('style');
        transitionStyles.id = 'transition-styles';
        transitionStyles.textContent = `
            .transition-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                cusor: none;
                pointer-events: none;
            }
            
            .transition-overlay.fade-in {
                opacity: 1;
                cusor: none;
                pointer-events: none;
            }
            
            .transition-content {
                text-align: center;
                color: var(--text-light);
            }
            
            .spinning-emoji {
                font-size: 4rem;
                margin-bottom: 20px;
                animation: spin-emoji 1.5s linear infinite;
                text-shadow: 0 0 25px var(--accent-glow), 0 0 50px var(--accent-glow);
                filter: drop-shadow(0 0 10px var(--accent-glow));
            }
            
            @keyframes spin-emoji {
                from { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.1); }
                to { transform: rotate(360deg) scale(1); }
            }
            
            .transition-diamonds {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .transition-diamonds .diamond {
                font-size: 1.8rem;
                color: var(--accent-glow);
                animation: transition-bounce 1.4s ease-in-out infinite both;
                text-shadow: 0 0 15px var(--accent-glow);
            }
            
            .transition-diamonds .diamond:nth-child(1) { animation-delay: -0.32s; }
            .transition-diamonds .diamond:nth-child(2) { animation-delay: -0.16s; }
            .transition-diamonds .diamond:nth-child(3) { animation-delay: 0s; }
            .transition-diamonds .diamond:nth-child(4) { animation-delay: 0.16s; }
            .transition-diamonds .diamond:nth-child(5) { animation-delay: 0.32s; }
            
            @keyframes transition-bounce {
                0%, 80%, 100% {
                    transform: scale(0.8) translateY(0);
                    opacity: 0.7;
                }
                40% {
                    transform: scale(1.2) translateY(-15px);
                    opacity: 1;
                }
            }
            
            .transition-text {
                font-size: 1.2rem;
                color: var(--text-light);
                margin-top: 20px;
                animation: transition-pulse 2s ease-in-out infinite;
            }
            
            @keyframes transition-pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(transitionStyles);
    }

    // Start the transition sequence
    setTimeout(() => {
        // Fade in the overlay
        transitionOverlay.classList.add('fade-in');

        // Start color transition after overlay is visible
        setTimeout(() => {
            // Transition the overlay background to target colors
            const targetGradient = `linear-gradient(135deg, ${colorScheme['--cyan-dark']} 0%, ${colorScheme['--cyan-medium']} 100%)`;
            transitionOverlay.style.background = targetGradient;

            // Also change the page colors behind it
            changeColors(colorScheme);
        }, 400);

        // Navigate after everything is complete
        setTimeout(() => {
            window.location.href = url;
        }, 2800);
    }, 50);
}

function changeColors(colorScheme) {
    const root = document.documentElement;

    // Create longer, smoother color transition animations
    root.style.transition = 'all 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    document.body.style.transition = 'background 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    // Apply new color scheme with smooth transition
    Object.entries(colorScheme).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });

    // Update the background gradient with smooth transition
    document.body.style.background = `linear-gradient(135deg, ${colorScheme['--cyan-dark']} 0%, ${colorScheme['--cyan-medium']} 100%)`;

    // Clean up transition styles after animation completes
    setTimeout(() => {
        root.style.transition = '';
        document.body.style.transition = '';
    }, 1800);
}

function resetTransitionState() {
    // Remove any existing transition overlays
    const existingOverlays = document.querySelectorAll('.transition-overlay');
    existingOverlays.forEach(overlay => overlay.remove());

    // Remove transition styles
    const transitionStyles = document.getElementById('transition-styles');
    if (transitionStyles) {
        transitionStyles.remove();
    }

    // Reset CSS custom properties to original twilight values
    const root = document.documentElement;
    const originalColors = {
        '--twilight-dark': '#2a1b3d',
        '--twilight-medium': '#44318d',
        '--twilight-light': '#6b5b95',
        '--butterfly-purple': '#9b7cb6',
        '--sugar-pink': '#f8d7da',
        '--sugar-cream': '#fff8dc',
        '--text-light': '#f5f5f5',
        '--text-muted': '#d1c7d8',
        '--accent-glow': '#a388ee'
    };

    Object.entries(originalColors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });

    // Reset body background to original twilight gradient
    document.body.style.background = 'linear-gradient(135deg, var(--twilight-dark) 0%, var(--twilight-medium) 100%)';
}

// Also reset on page show event (handles back button better)
window.addEventListener('pageshow', (event) => {
    // If page is loaded from cache (back button), reset transition state
    if (event.persisted) {
        resetTransitionState();
    }
});

// ==================== FULL EASTER EGGS ====================

let typedKeys = [];
let konamiKeys = [];
let gayKeys = [];
const doughnutTrigger = 'doughnut';
const gayTrigger = 'gay';
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// -------------------- Hint --------------------
function showHint(message) {
    const existingHint = document.getElementById('easter-egg-hint');
    if (existingHint) existingHint.remove();

    const hint = document.createElement('div');
    hint.id = 'easter-egg-hint';
    hint.innerText = message;
    Object.assign(hint.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.7)',
        color: 'var(--text-light)',
        fontSize: '16px',
        borderRadius: '6px',
        zIndex: 10000,
        textShadow: '0 0 10px var(--accent-glow)',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    document.body.appendChild(hint);
    requestAnimationFrame(() => hint.style.opacity = '1');
    setTimeout(() => {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 500);
    }, 1500);
}

// -------------------- Doughnut Game --------------------
function launchDoughnutGame() {
    if (document.getElementById('doughnut-game')) return;

    const gameContainer = document.createElement('div');
    gameContainer.id = 'doughnut-game';
    Object.assign(gameContainer.style, {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 9999, background: 'rgba(0,0,0,0.7)', overflow: 'hidden'
    });
    document.body.appendChild(gameContainer);

    const scoreEl = document.createElement('div');
    Object.assign(scoreEl.style, {
        position: 'fixed', top: '10px', left: '10px', color: 'var(--text-light)',
        fontSize: '24px', zIndex: 10000, textShadow: '0 0 15px var(--accent-glow)'
    });
    scoreEl.innerText = 'Score: 0';
    document.body.appendChild(scoreEl);

    let score = 0;
    const doughnuts = [];

    function spawnDoughnut() {
        const d = document.createElement('div');
        d.innerText = '🍩';
        Object.assign(d.style, {
            position: 'absolute',
            left: Math.random() * window.innerWidth + 'px',
            top: '-50px',
            fontSize: `${30 + Math.random() * 20}px`,
            cursor: 'url("logos/pointer.png"), auto',
            color: 'var(--text-light)',
            textShadow: '0 0 10px var(--accent-glow), 0 0 25px var(--accent-glow)'
        });
        gameContainer.appendChild(d);

        d.addEventListener('click', () => {
            d.remove();
            score++;
            scoreEl.innerText = `Score: ${score}`;
        });

        doughnuts.push({ el: d, speed: 2 + Math.random() * 3, sway: Math.random() * 1.5, direction: Math.random() < 0.5 ? -1 : 1 });
    }

    function updateDoughnuts() {
        for (let i = doughnuts.length - 1; i >= 0; i--) {
            const d = doughnuts[i];
            let top = parseFloat(d.el.style.top);
            let left = parseFloat(d.el.style.left);
            d.el.style.top = top + d.speed + 'px';
            d.el.style.left = left + d.sway * d.direction + 'px';
            if (Math.random() < 0.01) d.direction *= -1;
            if (top > window.innerHeight) {
                d.el.remove();
                doughnuts.splice(i, 1);
            }
        }
    }

    function loop() {
        if (Math.random() < 0.03) spawnDoughnut();
        updateDoughnuts();
        requestAnimationFrame(loop);
    }

    loop();

    window.addEventListener('keydown', function escListener(e) {
        if (e.key === 'Escape') {
            gameContainer.remove();
            scoreEl.remove();
            window.removeEventListener('keydown', escListener);
        }
    });
}

// -------------------- Butterfly Rain --------------------
function launchButterflies() {
    const numButterflies = 30;
    for (let i = 0; i < numButterflies; i++) {
        const b = document.createElement('div');
        b.innerText = '🦋';
        Object.assign(b.style, {
            position: 'fixed',
            top: '-50px',
            left: Math.random() * window.innerWidth + 'px',
            fontSize: `${20 + Math.random() * 30}px`,
            zIndex: 9999,
            pointerEvents: 'none',
            color: 'var(--text-light)',
            textShadow: '0 0 10px var(--accent-glow), 0 0 25px var(--accent-glow)',
            filter: 'drop-shadow(0 0 10px var(--accent-glow))',
            transform: `rotate(${Math.random() * 360}deg)`
        });
        document.body.appendChild(b);

        let startX = parseFloat(b.style.left);
        let y = -50;
        const speed = 2 + Math.random() * 2;
        const swayAmplitude = 20 + Math.random() * 30;
        const swayFrequency = 0.02 + Math.random() * 0.02;
        let rotation = Math.random() * 360;

        function animate(time = 0) {
            y += speed;
            const sway = Math.sin(time * swayFrequency) * swayAmplitude;
            b.style.top = y + 'px';
            b.style.left = startX + sway + 'px';
            rotation += Math.random() * 2 - 1;
            b.style.transform = `rotate(${rotation}deg)`;
            if (y < window.innerHeight + 50) {
                requestAnimationFrame(() => animate(time + 1));
            } else {
                b.remove();
            }
        }

        animate();
    }
}

// -------------------- Gay Video Easter Egg --------------------
const gayVideo = document.createElement('video');
gayVideo.src = 'https://www.yuri-lover.win/videos/gay.mp4'; //use cdn for performance
gayVideo.preload = 'auto'; // Preload video data
gayVideo.loop = true;       // Loop when playing
gayVideo.style.display = 'none'; // Hidden initially
gayVideo.muted = true;      // Ensure no accidental audio while hidden
gayVideo.type = 'video/mp4'; // Specify video type for better browser hints
document.body.appendChild(gayVideo);

function launchGayVideo() {
    gayVideo.currentTime = 0;       // Start from beginning
    gayVideo.style.display = 'block';
    
    // Ensure it covers entire viewport
    Object.assign(gayVideo.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 9999
    });
    
    gayVideo.muted = false;         // Unmute
    gayVideo.play();

    window.addEventListener('keydown', function escListener(e) {
        if (e.key === 'Escape') {
            gayVideo.pause();
            gayVideo.style.display = 'none';
            window.removeEventListener('keydown', escListener);
        }
    });
}


// -------------------- Key Listeners --------------------
window.addEventListener('keydown', (e) => {
    // Prevent arrow up/down scrolling for Konami sequence
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();

    typedKeys.push(e.key.toLowerCase());
    konamiKeys.push(e.key);
    gayKeys.push(e.key.toLowerCase());

    // Show hint only when a partial trigger has been typed
    if (typedKeys.join('').includes(doughnutTrigger)) showHint('Press [+] to confirm!');
    if (konamiKeys.length > 0) showHint('Press [+] to confirm!');
    if (gayKeys.join('').includes(gayTrigger)) showHint('Press [+] to confirm!');

    // Confirm doughnut
    if (typedKeys.join('').includes(doughnutTrigger) && e.key === '+') {
        launchDoughnutGame();
        typedKeys = [];
    }

    // Confirm Konami
    if (konamiKeys.slice(-konamiCode.length - 1).join(',') === [...konamiCode, '+'].join(',')) {
        launchButterflies();
        konamiKeys = [];
    }

    // Confirm gay video
    if (gayKeys.join('').includes(gayTrigger) && e.key === '+') {
        launchGayVideo();
        gayKeys = [];
    }
});


// ==================== BACK TO TOP BUTTON ====================
const backToTop = document.getElementById('back-to-top');

// Show arrow after scrolling 300px
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// Smooth scroll to top
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
