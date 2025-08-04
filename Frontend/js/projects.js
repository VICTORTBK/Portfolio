// Projects Controller
class ProjectsController {
    constructor() {
        this.projectsGrid = document.querySelector('.projects-grid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card');
        
        this.currentFilter = 'all';
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeProjects();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter button clicks
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.dataset.filter;
                this.filterProjects(filter);
                this.updateActiveFilter(button);
            });
        });

        // Project card interactions
        this.projectCards.forEach(card => {
            this.setupCardEventListeners(card);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.projects')) {
                this.handleKeyboardNavigation(e);
            }
        });
    }

    /**
     * Setup individual card event listeners
     */
    setupCardEventListeners(card) {
        const overlay = card.querySelector('.project-overlay');
        const actions = card.querySelectorAll('.btn-icon');
        
        // Mouse enter/leave for overlay
        card.addEventListener('mouseenter', () => {
            this.showProjectOverlay(card);
        });
        
        card.addEventListener('mouseleave', () => {
            this.hideProjectOverlay(card);
        });

        // Action button clicks
        actions.forEach(action => {
            action.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleProjectAction(action, card);
            });
        });

        // Card click for mobile
        card.addEventListener('click', (e) => {
            if (utils.isMobile()) {
                e.preventDefault();
                this.toggleProjectOverlay(card);
            }
        });

        // Focus/blur for accessibility
        card.addEventListener('focus', () => {
            this.showProjectOverlay(card);
        });
        
        card.addEventListener('blur', () => {
            this.hideProjectOverlay(card);
        });
    }

    /**
     * Initialize projects
     */
    initializeProjects() {
        // Add intersection observer for animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-fadeInUp');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.projectCards.forEach(card => {
            observer.observe(card);
        });

        // Preload project images
        this.preloadProjectImages();
    }

    /**
     * Filter projects
     */
    filterProjects(filter) {
        if (this.isAnimating || this.currentFilter === filter) return;
        
        this.isAnimating = true;
        this.currentFilter = filter;

        // Hide all cards first
        this.projectCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
            }, index * 50);
        });

        // Show filtered cards after hide animation
        setTimeout(() => {
            this.projectCards.forEach(card => {
                const category = card.dataset.category;
                const shouldShow = filter === 'all' || category === filter;
                
                card.style.display = shouldShow ? 'block' : 'none';
            });

            // Animate visible cards
            const visibleCards = Array.from(this.projectCards).filter(card => 
                card.style.display !== 'none'
            );

            visibleCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });

            this.isAnimating = false;
        }, this.projectCards.length * 50 + 100);
    }

    /**
     * Update active filter button
     */
    updateActiveFilter(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-pressed', 'false');
        });
        
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
    }

    /**
     * Show project overlay
     */
    showProjectOverlay(card) {
        const overlay = card.querySelector('.project-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        }
        
        card.classList.add('hovered');
    }

    /**
     * Hide project overlay
     */
    hideProjectOverlay(card) {
        const overlay = card.querySelector('.project-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
        }
        
        card.classList.remove('hovered');
    }

    /**
     * Toggle project overlay for mobile
     */
    toggleProjectOverlay(card) {
        const overlay = card.querySelector('.project-overlay');
        if (!overlay) return;
        
        const isVisible = overlay.style.opacity === '1';
        
        if (isVisible) {
            this.hideProjectOverlay(card);
        } else {
            // Hide other overlays first
            this.projectCards.forEach(otherCard => {
                if (otherCard !== card) {
                    this.hideProjectOverlay(otherCard);
                }
            });
            
            this.showProjectOverlay(card);
        }
    }

    /**
     * Handle project action clicks
     */
    handleProjectAction(action, card) {
        const actionType = this.getActionType(action);
        const projectData = this.getProjectData(card);
        
        switch (actionType) {
            case 'view':
                this.viewProjectDetails(projectData);
                break;
            case 'demo':
                this.openProjectDemo(projectData);
                break;
            case 'github':
                this.openProjectGithub(projectData);
                break;
            default:
                console.log('Unknown action type:', actionType);
        }
    }

    /**
     * Get action type from button
     */
    getActionType(button) {
        if (button.querySelector('.fa-eye')) return 'view';
        if (button.querySelector('.fa-external-link-alt')) return 'demo';
        if (button.querySelector('.fa-github')) return 'github';
        return 'unknown';
    }

    /**
     * Get project data from card
     */
    getProjectData(card) {
        const title = card.querySelector('.project-title')?.textContent || '';
        const description = card.querySelector('.project-description')?.textContent || '';
        const status = card.querySelector('.project-status')?.textContent || '';
        const tags = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent);
        const image = card.querySelector('.project-image img')?.src || '';
        const category = card.dataset.category || '';
        
        return {
            title,
            description,
            status,
            tags,
            image,
            category
        };
    }

    /**
     * View project details (modal or dedicated page)
     */
    viewProjectDetails(project) {
        // Create and show project modal
        this.createProjectModal(project);
    }

    /**
     * Open project demo
     */
    openProjectDemo(project) {
        // In a real implementation, you'd have actual URLs
        const demoUrl = this.getProjectDemoUrl(project.title);
        if (demoUrl) {
            window.open(demoUrl, '_blank', 'noopener,noreferrer');
        } else {
            this.showNotification('Demo not available yet', 'info');
        }
    }

    /**
     * Open project GitHub
     */
    openProjectGithub(project) {
        // In a real implementation, you'd have actual GitHub URLs
        const githubUrl = this.getProjectGithubUrl(project.title);
        if (githubUrl) {
            window.open(githubUrl, '_blank', 'noopener,noreferrer');
        } else {
            this.showNotification('Source code not public', 'info');
        }
    }

    /**
     * Create project modal
     */
    createProjectModal(project) {
        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close" aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-header">
                        <img src="${project.image}" alt="${project.title}" class="modal-image">
                        <div class="modal-info">
                            <h3 class="modal-title">${project.title}</h3>
                            <span class="modal-status ${project.status.toLowerCase()}">${project.status}</span>
                        </div>
                    </div>
                    <div class="modal-body">
                        <p class="modal-description">${project.description}</p>
                        <div class="modal-tags">
                            ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                        </div>
                        <div class="modal-features">
                            <h4>Key Features:</h4>
                            <ul>
                                ${this.getProjectFeatures(project.title).map(feature => 
                                    `<li>${feature}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="window.projectsController.openProjectDemo(${JSON.stringify(project).replace(/"/g, '&quot;')})">
                            <i class="fas fa-external-link-alt"></i>
                            View Demo
                        </button>
                        <button class="btn btn-outline" onclick="window.projectsController.openProjectGithub(${JSON.stringify(project).replace(/"/g, '&quot;')})">
                            <i class="fab fa-github"></i>
                            Source Code
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .project-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1050;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            .modal-content {
                position: relative;
                background: white;
                border-radius: 1rem;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease-out;
            }
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                z-index: 1;
                color: #666;
                transition: color 0.2s ease;
            }
            .modal-close:hover {
                color: #333;
            }
            .modal-header {
                position: relative;
                margin-bottom: 1.5rem;
            }
            .modal-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 1rem 1rem 0 0;
            }
            .modal-info {
                position: absolute;
                bottom: 1rem;
                left: 1.5rem;
                right: 1.5rem;
                background: rgba(255, 255, 255, 0.95);
                padding: 1rem;
                border-radius: 0.5rem;
                backdrop-filter: blur(10px);
            }
            .modal-title {
                margin: 0 0 0.5rem 0;
                font-size: 1.5rem;
                font-weight: 600;
            }
            .modal-status {
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: uppercase;
            }
            .modal-status.completed {
                background: #10b981;
                color: white;
            }
            .modal-body {
                padding: 0 1.5rem;
                margin-bottom: 2rem;
            }
            .modal-description {
                margin-bottom: 1.5rem;
                line-height: 1.6;
                color: #666;
            }
            .modal-tags {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-bottom: 1.5rem;
            }
            .modal-features h4 {
                margin-bottom: 0.75rem;
                color: #333;
            }
            .modal-features ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .modal-features li {
                padding: 0.25rem 0;
                color: #666;
                position: relative;
                padding-left: 1.5rem;
            }
            .modal-features li:before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
            }
            .modal-actions {
                padding: 1.5rem;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 1rem;
                justify-content: center;
                background: #f9fafb;
                border-radius: 0 0 1rem 1rem;
            }
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal events
        const closeModal = () => {
            modal.remove();
            style.remove();
            document.body.style.overflow = '';
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Get project features (mock data)
     */
    getProjectFeatures(title) {
        const features = {
            'E-commerce Platform': [
                'User authentication and authorization',
                'Product catalog with search and filters',
                'Shopping cart and checkout process',
                'Payment integration with Stripe',
                'Admin dashboard for inventory management',
                'Order tracking and history',
                'Responsive design for all devices'
            ],
            'Forex Analytics Dashboard': [
                'Real-time market data integration',
                'Advanced charting with technical indicators',
                'Risk management calculator',
                'Trading signals and alerts',
                'Portfolio performance tracking',
                'Historical data analysis',
                'Mobile-responsive interface'
            ],
            'Project Management Suite': [
                'Team collaboration tools',
                'Task assignment and tracking',
                'Project timeline visualization',
                'File sharing and version control',
                'Real-time notifications',
                'Time tracking and reporting',
                'Integration with popular tools'
            ],
            'Social Media Mobile App': [
                'Cross-platform compatibility',
                'Real-time messaging system',
                'Photo and video sharing',
                'Location-based features',
                'Push notifications',
                'User profile customization',
                'Social feed algorithm'
            ]
        };

        return features[title] || [
            'Modern and responsive design',
            'Clean and maintainable code',
            'Performance optimized',
            'User-friendly interface',
            'Cross-browser compatibility'
        ];
    }

    /**
     * Get project demo URL (mock)
     */
    getProjectDemoUrl(title) {
        // In a real implementation, these would be actual URLs
        const urls = {
            'E-commerce Platform': 'https://demo.ecommerce-app.com',
            'Project Management Suite': 'https://demo.project-manager.com'
        };
        return urls[title] || null;
    }

    /**
     * Get project GitHub URL (mock)
     */
    getProjectGithubUrl(title) {
        // In a real implementation, these would be actual GitHub URLs
        const urls = {
            'E-commerce Platform': 'https://github.com/johndoe/ecommerce-platform',
            'Forex Analytics Dashboard': 'https://github.com/johndoe/forex-dashboard'
        };
        return urls[title] || null;
    }

    /**
     * Preload project images
     */
    preloadProjectImages() {
        const images = Array.from(this.projectCards).map(card => {
            const img = card.querySelector('.project-image img');
            return img ? img.src : null;
        }).filter(Boolean);

        utils.preloadImages(images).catch(err => {
            console.warn('Some project images failed to preload:', err);
        });
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'info' ? '#3b82f6' : '#10b981'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        const focusedElement = document.activeElement;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const cards = Array.from(this.projectCards).filter(card => 
                card.style.display !== 'none'
            );
            const currentIndex = cards.indexOf(focusedElement);
            
            if (currentIndex !== -1) {
                e.preventDefault();
                const nextIndex = e.key === 'ArrowRight' 
                    ? (currentIndex + 1) % cards.length
                    : (currentIndex - 1 + cards.length) % cards.length;
                
                cards[nextIndex].focus();
            }
        }
    }
}

// Initialize projects controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const projectsController = new ProjectsController();
    window.projectsController = projectsController;
});