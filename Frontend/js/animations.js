// Animation Controller
class AnimationController {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.setupScrollReveal();
        this.setupStaggerAnimations();
        this.setupParallaxEffects();
        this.setupHoverEffects();
    }

    /**
     * Setup scroll reveal animations
     */
    setupScrollReveal() {
        const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale');
        
        if (revealElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    entry.target.classList.add('revealed');
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            observer.observe(element);
        });

        this.observers.set('scrollReveal', observer);
    }

    /**
     * Setup stagger animations
     */
    setupStaggerAnimations() {
        const staggerContainers = document.querySelectorAll('[data-stagger]');
        
        staggerContainers.forEach(container => {
            const items = container.querySelectorAll('.stagger-item');
            const delay = parseInt(container.dataset.stagger) || 100;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                        items.forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('animate');
                            }, index * delay);
                        });
                        this.animatedElements.add(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            observer.observe(container);
        });
    }

    /**
     * Setup parallax effects
     */
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;

        const handleParallax = utils.throttle(() => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.parallax) || 0.5;
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + scrolled;
                const elementHeight = rect.height;
                
                // Only apply parallax if element is in viewport
                if (scrolled + window.innerHeight > elementTop && scrolled < elementTop + elementHeight) {
                    const yPos = -(scrolled - elementTop) * speed;
                    element.style.transform = `translate3d(0, ${yPos}px, 0)`;
                }
            });
        }, 16);

        window.addEventListener('scroll', handleParallax);
    }

    /**
     * Setup hover effects
     */
    setupHoverEffects() {
        // Magnetic effect for buttons
        const magneticElements = document.querySelectorAll('.magnetic');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0, 0)';
            });
        });

        // Tilt effect for cards
        const tiltElements = document.querySelectorAll('.tilt-effect');
        
        tiltElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / centerY * -5;
                const rotateY = (x - centerX) / centerX * 5;
                
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            });
        });
    }

    /**
     * Animate skill bars
     */
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    const width = entry.target.dataset.width || 0;
                    entry.target.style.width = `${width}%`;
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        skillBars.forEach(bar => {
            observer.observe(bar);
        });
    }

    /**
     * Animate counters
     */
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    const target = parseInt(entry.target.dataset.target) || 0;
                    utils.animateNumber(entry.target, target, 2000);
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    /**
     * Create floating particles
     */
    createFloatingParticles(container, count = 20) {
        if (!container) return;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position and animation delay
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
            
            container.appendChild(particle);
        }
    }

    /**
     * Typewriter effect
     */
    typeWriter(element, texts, speed = 100, deleteSpeed = 50, pause = 2000) {
        if (!element || !texts.length) return;
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const type = () => {
            const currentText = texts[textIndex];
            
            if (!isDeleting) {
                element.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                
                if (charIndex === currentText.length) {
                    setTimeout(() => {
                        isDeleting = true;
                        type();
                    }, pause);
                    return;
                }
            } else {
                element.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                
                if (charIndex === 0) {
                    isDeleting = false;
                    textIndex = (textIndex + 1) % texts.length;
                }
            }
            
            const currentSpeed = isDeleting ? deleteSpeed : speed;
            setTimeout(type, currentSpeed);
        };
        
        type();
    }

    /**
     * Ripple effect
     */
    createRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Smooth reveal text
     */
    revealText(element, delay = 50) {
        if (!element) return;
        
        const text = element.textContent;
        element.textContent = '';
        element.style.visibility = 'visible';
        
        const chars = text.split('');
        chars.forEach((char, index) => {
            setTimeout(() => {
                element.textContent += char;
            }, index * delay);
        });
    }

    /**
     * Progress bar animation
     */
    animateProgressBar(bar, percentage, duration = 1500) {
        if (!bar) return;
        
        let progress = 0;
        const increment = percentage / (duration / 16);
        
        const animate = () => {
            progress += increment;
            bar.style.width = Math.min(progress, percentage) + '%';
            
            if (progress < percentage) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    /**
     * Cleanup observers
     */
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
        this.animatedElements.clear();
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animationController = new AnimationController();
    
    // Initialize specific animations
    animationController.animateSkillBars();
    animationController.animateCounters();
    
    // Create particles in hero section
    const heroParticles = document.querySelector('.hero-particles');
    if (heroParticles) {
        animationController.createFloatingParticles(heroParticles, 15);
    }
    
    // Add ripple effect to buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn-ripple')) {
            animationController.createRipple(e.target.closest('.btn-ripple'), e);
        }
    });
    
    // Store reference globally for potential cleanup
    window.animationController = animationController;
});

// Handle reduced motion preference
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-base', 'none');
    document.documentElement.style.setProperty('--transition-fast', 'none');
    document.documentElement.style.setProperty('--transition-slow', 'none');
}