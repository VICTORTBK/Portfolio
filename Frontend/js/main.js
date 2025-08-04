// Main Application Controller
class PortfolioApp {
    constructor() {
        this.isLoaded = false;
        this.components = new Map();
        this.observers = new Map();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.showLoadingScreen();
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.onDOMReady();
            });
        } else {
            this.onDOMReady();
        }
    }

    /**
     * Handle DOM ready event
     */
    onDOMReady() {
        this.preloadAssets()
            .then(() => {
                this.initializeComponents();
                this.setupGlobalEventListeners();
                this.startAnimations();
                this.hideLoadingScreen();
                this.isLoaded = true;
            })
            .catch(error => {
                console.error('Failed to initialize application:', error);
                this.hideLoadingScreen();
            });
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="loading-logo">
                    <span class="brand-text">AV</span>
                </div>
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <p class="loading-text">Loading Portfolio...</p>
            </div>
        `;

        const styles = `
            #loading-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #2563eb, #06b6d4);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                transition: opacity 0.5s ease-out;
            }
            
            .loading-content {
                text-align: center;
                color: white;
            }
            
            .loading-logo {
                margin-bottom: 2rem;
            }
            
            .loading-logo .brand-text {
                font-size: 3rem;
                font-weight: bold;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                width: 5rem;
                height: 5rem;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            }
            
            .loading-spinner {
                position: relative;
                width: 3rem;
                height: 3rem;
                margin: 0 auto 1.5rem;
            }
            
            .spinner-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 2px solid transparent;
                border-top: 2px solid rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            .spinner-ring:nth-child(2) {
                animation-delay: 0.33s;
                border-top-color: rgba(255, 255, 255, 0.6);
            }
            
            .spinner-ring:nth-child(3) {
                animation-delay: 0.66s;
                border-top-color: rgba(255, 255, 255, 0.4);
            }
            
            .loading-text {
                font-size: 1rem;
                opacity: 0.9;
                font-weight: 500;
                margin: 0;
                animation: fadeInOut 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeInOut {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        document.body.appendChild(loadingScreen);
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.remove();
                // Remove the loading styles
                const loadingStyles = document.querySelector('style');
                if (loadingStyles && loadingStyles.textContent.includes('#loading-screen')) {
                    loadingStyles.remove();
                }
            }, 500);
        }
    }

    /**
     * Preload critical assets
     */
    async preloadAssets() {
        // Get all images from the page
        const images = Array.from(document.querySelectorAll('img')).map(img => img.src);
        
        // Add hero background and other critical images
        const criticalImages = [
            'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg',
            'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg',
            'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
            'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-147413.jpeg'
        ];

        const allImages = [...new Set([...images, ...criticalImages])].filter(Boolean);

        try {
            await utils.preloadImages(allImages);
        } catch (error) {
            console.warn('Some images failed to preload:', error);
        }
    }

    /**
     * Initialize all components
     */
    initializeComponents() {
        // Back to top button
        this.initializeBackToTop();
        
        // Smooth scrolling for anchor links
        this.initializeSmoothScrolling();
        
        // Intersection observers for animations
        this.initializeScrollAnimations();
        
        // Theme system (if needed in future)
        this.initializeThemeSystem();
        
        // Performance monitoring
        this.initializePerformanceMonitoring();
    }

    /**
     * Initialize back to top button
     */
    initializeBackToTop() {
        const backToTopButton = document.getElementById('backToTop');
        if (!backToTopButton) return;

        const toggleVisibility = utils.throttle(() => {
            const scrolled = window.pageYOffset > 300;
            backToTopButton.classList.toggle('visible', scrolled);
        }, 100);

        window.addEventListener('scroll', toggleVisibility);

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        this.components.set('backToTop', { button: backToTopButton, toggleVisibility });
    }

    /**
     * Initialize smooth scrolling
     */
    initializeSmoothScrolling() {
        // Enable smooth scrolling for browsers that don't support it natively
        if (!('scrollBehavior' in document.documentElement.style)) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    /**
     * Initialize scroll animations
     */
    initializeScrollAnimations() {
        // Generic scroll reveal observer
        const scrollRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements that need scroll reveal
        const revealElements = document.querySelectorAll(
            '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
        );
        
        revealElements.forEach(element => {
            scrollRevealObserver.observe(element);
        });

        this.observers.set('scrollReveal', scrollRevealObserver);
    }

    /**
     * Initialize theme system
     */
    initializeThemeSystem() {
        // Check for saved theme preference or default to light mode
        const savedTheme = utils.storage.get('theme', 'light');
        this.setTheme(savedTheme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!utils.storage.get('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        utils.storage.set('theme', theme);
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // Measure and log performance metrics
        window.addEventListener('load', () => {
            setTimeout(() => {
                if ('performance' in window) {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    
                    console.log('Portfolio Performance Metrics:', {
                        loadTime: `${loadTime}ms`,
                        domContentLoaded: `${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`,
                        firstPaint: this.getFirstPaint(),
                        largestContentfulPaint: this.getLargestContentfulPaint()
                    });
                }
            }, 0);
        });
    }

    /**
     * Get First Paint metric
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? `${Math.round(firstPaint.startTime)}ms` : 'N/A';
    }

    /**
     * Get Largest Contentful Paint metric
     */
    getLargestContentfulPaint() {
        return new Promise((resolve) => {
            if ('web-vitals' in window) {
                // If web-vitals library is available
                window.webVitals.getLCP(resolve);
            } else {
                // Fallback estimation
                setTimeout(() => resolve('N/A'), 0);
            }
        });
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Handle window resize
        window.addEventListener('resize', utils.debounce(() => {
            this.handleWindowResize();
        }, 150));

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // Handle click tracking (for analytics)
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });

        // Handle scroll performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Update viewport height custom property
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        
        // Trigger resize event for components
        this.components.forEach((component, name) => {
            if (component.handleResize) {
                component.handleResize();
            }
        });
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause animations, videos, etc.
            this.pauseAnimations();
        } else {
            // Page is visible - resume animations
            this.resumeAnimations();
        }
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeyboard(e) {
        // Escape key - close any open modals/menus
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
        
        // Ctrl/Cmd + K - focus search (if available)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.focusSearch();
        }
    }

    /**
     * Handle global clicks (for analytics)
     */
    handleGlobalClick(e) {
        const target = e.target.closest('a, button');
        if (target) {
            const action = target.tagName.toLowerCase();
            const label = target.textContent?.trim() || target.getAttribute('aria-label') || 'Unknown';
            
            // Log interaction (replace with actual analytics)
            console.log('User interaction:', { action, label, href: target.href });
        }
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollProgress = utils.getScrollProgress();
        
        // Update scroll progress indicator if it exists
        const progressIndicator = document.querySelector('.scroll-progress');
        if (progressIndicator) {
            progressIndicator.style.width = `${scrollProgress * 100}%`;
        }
        
        // Update scroll-dependent components
        this.components.forEach((component, name) => {
            if (component.handleScroll) {
                component.handleScroll(scrollProgress);
            }
        });
    }

    /**
     * Start animations
     */
    startAnimations() {
        // Start hero animations
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.classList.add('animate-fadeIn');
        }

        // Animate elements that should appear on load
        const immediateElements = document.querySelectorAll('.animate-on-load');
        immediateElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-fadeInUp');
            }, index * 100);
        });
    }

    /**
     * Pause animations
     */
    pauseAnimations() {
        document.documentElement.style.setProperty('--animation-play-state', 'paused');
        
        // Pause typing effect
        if (window.typingEffect) {
            window.typingEffect.pause();
        }
    }

    /**
     * Resume animations
     */
    resumeAnimations() {
        document.documentElement.style.setProperty('--animation-play-state', 'running');
        
        // Resume typing effect
        if (window.typingEffect) {
            window.typingEffect.resume();
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal, .project-modal');
        modals.forEach(modal => {
            const closeButton = modal.querySelector('.modal-close, .close');
            if (closeButton) {
                closeButton.click();
            }
        });
    }

    /**
     * Focus search
     */
    focusSearch() {
        const searchInput = document.querySelector('input[type="search"], .search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * Get application state
     */
    getState() {
        return {
            isLoaded: this.isLoaded,
            currentSection: window.navigationController?.getCurrentSection() || 'home',
            theme: document.documentElement.getAttribute('data-theme') || 'light',
            components: Array.from(this.components.keys()),
            observers: Array.from(this.observers.keys())
        };
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        // Disconnect all observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        // Cleanup components
        this.components.forEach((component, name) => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.components.clear();

        // Remove event listeners
        window.removeEventListener('resize', this.handleWindowResize);
        window.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('keydown', this.handleGlobalKeyboard);
        document.removeEventListener('click', this.handleGlobalClick);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.portfolioApp) {
        window.portfolioApp.destroy();
    }
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // In production, you might want to send this to an error tracking service
    // errorTrackingService.log(e.error);
});

// Global unhandled promise rejection handling
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    
    // Prevent the default browser behavior
    e.preventDefault();
});

// Expose utilities globally for debugging (remove in production)
if (process.env.NODE_ENV === 'development') {
    window.debug = {
        app: () => window.portfolioApp,
        state: () => window.portfolioApp?.getState(),
        utils: window.utils,
        navigation: () => window.navigationController,
        animation: () => window.animationController,
        projects: () => window.projectsController,
        contact: () => window.contactController
    };
}