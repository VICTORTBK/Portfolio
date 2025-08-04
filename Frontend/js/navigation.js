// Navigation Controller
class NavigationController {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = ['#home', '#about', '#skills', '#projects', '#forex', '#contact'];
        
        this.isMenuOpen = false;
        this.currentSection = 'home';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollSpy();
        this.setupSmoothScrolling();
        this.handleInitialLoad();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                this.navigateToSection(target);
                this.closeMobileMenu();
            });
        });

        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle scroll for navbar styling
        window.addEventListener('scroll', utils.throttle(() => {
            this.handleScroll();
        }, 16));

        // Handle window resize
        window.addEventListener('resize', utils.debounce(() => {
            this.handleResize();
        }, 150));

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    /**
     * Setup scroll spy functionality
     */
    setupScrollSpy() {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.updateActiveNavLink(sectionId);
                    this.currentSection = sectionId;
                }
            });
        }, observerOptions);

        // Observe all sections
        this.sections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                observer.observe(section);
            }
        });
    }

    /**
     * Setup smooth scrolling
     */
    setupSmoothScrolling() {
        // Add smooth scrolling behavior to all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                if (target !== '#') {
                    this.navigateToSection(target);
                }
            });
        });
    }

    /**
     * Handle initial page load
     */
    handleInitialLoad() {
        // Check for hash in URL
        const hash = window.location.hash;
        if (hash && this.sections.includes(hash)) {
            setTimeout(() => {
                this.navigateToSection(hash, false);
            }, 100);
        } else {
            this.updateActiveNavLink('home');
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.navToggle) {
            this.navToggle.classList.toggle('active', this.isMenuOpen);
        }
        
        if (this.navMenu) {
            this.navMenu.classList.toggle('active', this.isMenuOpen);
        }

        // Prevent body scroll when menu is open
        if (this.isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Update ARIA attributes
        if (this.navToggle) {
            this.navToggle.setAttribute('aria-expanded', this.isMenuOpen);
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.isMenuOpen) return;
        
        this.isMenuOpen = false;
        
        if (this.navToggle) {
            this.navToggle.classList.remove('active');
            this.navToggle.setAttribute('aria-expanded', 'false');
        }
        
        if (this.navMenu) {
            this.navMenu.classList.remove('active');
        }

        document.body.style.overflow = '';
    }

    /**
     * Navigate to section
     */
    navigateToSection(target, updateUrl = true) {
        const section = document.querySelector(target);
        if (!section) return;

        const navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
        const offset = navbarHeight + 20;

        utils.smoothScrollTo(section, offset, 800);

        // Update URL without triggering scroll
        if (updateUrl && history.pushState) {
            history.pushState(null, null, target);
        }

        // Update active nav link
        const sectionId = target.replace('#', '');
        this.updateActiveNavLink(sectionId);
    }

    /**
     * Update active navigation link
     */
    updateActiveNavLink(sectionId) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === `#${sectionId}`;
            
            link.classList.toggle('active', isActive);
            
            // Update ARIA attributes
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrolled = window.pageYOffset > 50;
        
        if (this.navbar) {
            this.navbar.classList.toggle('scrolled', scrolled);
        }

        // Update current section for other components
        this.currentSection = utils.getCurrentSection(this.sections);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        // Close menu on Escape
        if (e.key === 'Escape' && this.isMenuOpen) {
            this.closeMobileMenu();
            this.navToggle?.focus();
        }

        // Navigate with arrow keys when menu is focused
        if (this.isMenuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            const focusableElements = this.navMenu.querySelectorAll('.nav-link');
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            
            let nextIndex;
            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex + 1 >= focusableElements.length ? 0 : currentIndex + 1;
            } else {
                nextIndex = currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1;
            }
            
            focusableElements[nextIndex]?.focus();
        }
    }

    /**
     * Get current section
     */
    getCurrentSection() {
        return this.currentSection;
    }

    /**
     * Navigate to next section
     */
    goToNextSection() {
        const currentIndex = this.sections.findIndex(section => 
            section.replace('#', '') === this.currentSection
        );
        const nextIndex = (currentIndex + 1) % this.sections.length;
        this.navigateToSection(this.sections[nextIndex]);
    }

    /**
     * Navigate to previous section
     */
    goToPreviousSection() {
        const currentIndex = this.sections.findIndex(section => 
            section.replace('#', '') === this.currentSection
        );
        const prevIndex = currentIndex - 1 < 0 ? this.sections.length - 1 : currentIndex - 1;
        this.navigateToSection(this.sections[prevIndex]);
    }

    /**
     * Destroy navigation controller
     */
    destroy() {
        // Remove event listeners
        this.navToggle?.removeEventListener('click', this.toggleMobileMenu);
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyboardNavigation);
        
        // Reset mobile menu state
        this.closeMobileMenu();
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navigationController = new NavigationController();
    window.navigationController = navigationController;
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const hash = window.location.hash;
    if (hash && window.navigationController) {
        window.navigationController.navigateToSection(hash, false);
    }
});