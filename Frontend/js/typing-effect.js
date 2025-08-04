// Typing Effect Controller
class TypingEffect {
    constructor(element, texts, options = {}) {
        this.element = element;
        this.texts = Array.isArray(texts) ? texts : [texts];
        this.options = {
            typeSpeed: 100,
            deleteSpeed: 50,
            pauseTime: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            ...options
        };
        
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.timeoutId = null;
        
        this.init();
    }

    init() {
        if (!this.element || this.texts.length === 0) return;
        
        this.element.textContent = '';
        this.start();
    }

    start() {
        this.type();
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    reset() {
        this.stop();
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.element.textContent = '';
    }

    type() {
        if (this.isPaused) return;

        const currentText = this.texts[this.currentTextIndex];
        let displayText = '';
        let nextDelay = this.options.typeSpeed;

        if (!this.isDeleting) {
            // Typing mode
            displayText = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;

            if (this.currentCharIndex === currentText.length) {
                // Finished typing current text
                nextDelay = this.options.pauseTime;
                this.isDeleting = true;
            }
        } else {
            // Deleting mode
            displayText = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
            nextDelay = this.options.deleteSpeed;

            if (this.currentCharIndex === 0) {
                // Finished deleting
                this.isDeleting = false;
                this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
                
                if (!this.options.loop && this.currentTextIndex === 0) {
                    // Stop if not looping and reached the end
                    this.element.textContent = displayText;
                    return;
                }
                
                nextDelay = this.options.typeSpeed;
            }
        }

        this.element.textContent = displayText;
        
        this.timeoutId = setTimeout(() => {
            this.type();
        }, nextDelay);
    }

    pause() {
        this.isPaused = true;
        this.stop();
    }

    resume() {
        this.isPaused = false;
        this.start();
    }

    changeTexts(newTexts) {
        this.texts = Array.isArray(newTexts) ? newTexts : [newTexts];
        this.reset();
        this.start();
    }

    getCurrentText() {
        return this.texts[this.currentTextIndex];
    }

    destroy() {
        this.stop();
        this.element.textContent = '';
    }
}

// Multi-line typing effect
class MultiLineTypingEffect {
    constructor(container, lines, options = {}) {
        this.container = container;
        this.lines = lines;
        this.options = {
            typeSpeed: 80,
            lineDelay: 500,
            showCursor: true,
            cursorChar: '|',
            ...options
        };
        
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.timeoutId = null;
        this.elements = [];
        
        this.init();
    }

    init() {
        if (!this.container || this.lines.length === 0) return;
        
        this.container.innerHTML = '';
        
        // Create elements for each line
        this.lines.forEach((line, index) => {
            const element = document.createElement('div');
            element.className = 'typing-line';
            element.style.minHeight = '1.5em';
            this.container.appendChild(element);
            this.elements.push(element);
        });
        
        this.start();
    }

    start() {
        this.typeLine();
    }

    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    typeLine() {
        if (this.currentLineIndex >= this.lines.length) {
            // Finished typing all lines
            return;
        }

        const currentLine = this.lines[this.currentLineIndex];
        const currentElement = this.elements[this.currentLineIndex];
        
        if (this.currentCharIndex < currentLine.length) {
            // Continue typing current line
            const displayText = currentLine.substring(0, this.currentCharIndex + 1);
            currentElement.textContent = displayText;
            
            if (this.options.showCursor && this.currentLineIndex === this.lines.length - 1) {
                currentElement.textContent += this.options.cursorChar;
            }
            
            this.currentCharIndex++;
            
            this.timeoutId = setTimeout(() => {
                this.typeLine();
            }, this.options.typeSpeed);
        } else {
            // Finished current line, move to next
            currentElement.textContent = currentLine; // Remove cursor
            this.currentLineIndex++;
            this.currentCharIndex = 0;
            
            this.timeoutId = setTimeout(() => {
                this.typeLine();
            }, this.options.lineDelay);
        }
    }

    reset() {
        this.stop();
        this.currentLineIndex = 0;
        this.currentCharIndex = 0;
        this.elements.forEach(element => {
            element.textContent = '';
        });
    }

    destroy() {
        this.stop();
        this.container.innerHTML = '';
    }
}

// Animated text reveal effect
class TextRevealEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            animationType: 'fadeInUp', // fadeInUp, slideInLeft, etc.
            duration: 800,
            delay: 0,
            stagger: 50,
            ...options
        };
        
        this.originalText = element.textContent;
        this.words = this.originalText.split(' ');
        
        this.init();
    }

    init() {
        if (!this.element || !this.originalText) return;
        
        this.createWordElements();
        this.animate();
    }

    createWordElements() {
        this.element.innerHTML = '';
        
        this.words.forEach((word, index) => {
            const wordElement = document.createElement('span');
            wordElement.className = 'reveal-word';
            wordElement.textContent = word;
            wordElement.style.opacity = '0';
            wordElement.style.transform = this.getInitialTransform();
            wordElement.style.display = 'inline-block';
            wordElement.style.transition = `all ${this.options.duration}ms ease`;
            
            this.element.appendChild(wordElement);
            
            // Add space after word (except last)
            if (index < this.words.length - 1) {
                this.element.appendChild(document.createTextNode(' '));
            }
        });
    }

    getInitialTransform() {
        switch (this.options.animationType) {
            case 'fadeInUp':
                return 'translateY(20px)';
            case 'fadeInDown':
                return 'translateY(-20px)';
            case 'slideInLeft':
                return 'translateX(-20px)';
            case 'slideInRight':
                return 'translateX(20px)';
            case 'scaleIn':
                return 'scale(0.8)';
            default:
                return 'translateY(20px)';
        }
    }

    animate() {
        const wordElements = this.element.querySelectorAll('.reveal-word');
        
        wordElements.forEach((wordElement, index) => {
            setTimeout(() => {
                wordElement.style.opacity = '1';
                wordElement.style.transform = 'translateY(0) translateX(0) scale(1)';
            }, this.options.delay + (index * this.options.stagger));
        });
    }

    reset() {
        const wordElements = this.element.querySelectorAll('.reveal-word');
        wordElements.forEach(wordElement => {
            wordElement.style.opacity = '0';
            wordElement.style.transform = this.getInitialTransform();
        });
    }

    replay() {
        this.reset();
        setTimeout(() => {
            this.animate();
        }, 100);
    }
}

// Initialize typing effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Main hero typing effect
    const typingElement = document.getElementById('typingText');
    if (typingElement) {
        const texts = [
            'Software Engineer',
            'Full-Stack Developer',
            'Forex Trader',
            'Problem Solver',
            'Code Enthusiast'
        ];
        
        const typingEffect = new TypingEffect(typingElement, texts, {
            typeSpeed: 120,
            deleteSpeed: 60,
            pauseTime: 2500,
            loop: true
        });
        
        window.typingEffect = typingEffect;
    }

    // Initialize text reveal effects for section titles
    const revealElements = document.querySelectorAll('.text-reveal');
    revealElements.forEach(element => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    new TextRevealEffect(entry.target, {
                        animationType: 'fadeInUp',
                        duration: 600,
                        stagger: 100
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        observer.observe(element);
    });

    // Pause typing effect when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (window.typingEffect) {
            if (document.hidden) {
                window.typingEffect.pause();
            } else {
                window.typingEffect.resume();
            }
        }
    });
});