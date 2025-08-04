// Contact Form Controller
class ContactController {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitButton = null;
        this.originalButtonText = '';
        
        this.validationRules = {
            firstName: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s]*$/
            },
            lastName: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s]*$/
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            subject: {
                required: true
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000
            }
        };
        
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.originalButtonText = this.submitButton?.innerHTML || '';
        
        this.setupEventListeners();
        this.setupRealTimeValidation();
        this.initializeFormFields();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Input field events
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter' && this.isFormFocused()) {
                this.handleFormSubmit();
            }
        });
    }

    /**
     * Setup real-time validation
     */
    setupRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Add validation on input for immediate feedback
            input.addEventListener('input', utils.debounce(() => {
                if (input.value.length > 0) {
                    this.validateField(input, false); // Don't show errors while typing
                }
            }, 300));
        });
    }

    /**
     * Initialize form fields
     */
    initializeFormFields() {
        // Character counter for message field
        const messageField = this.form.querySelector('#message');
        if (messageField) {
            this.addCharacterCounter(messageField);
        }

        // Auto-resize textarea
        const textareas = this.form.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            this.setupAutoResize(textarea);
        });

        // Load saved form data
        this.loadSavedFormData();
    }

    /**
     * Handle form submission
     */
    async handleFormSubmit() {
        if (!this.validateForm()) {
            this.showNotification('Please correct the errors below', 'error');
            return;
        }

        const formData = this.getFormData();
        
        this.setSubmitting(true);
        
        try {
            await this.submitForm(formData);
            this.handleSubmissionSuccess();
        } catch (error) {
            this.handleSubmissionError(error);
        } finally {
            this.setSubmitting(false);
        }
    }

    /**
     * Validate entire form
     */
    validateForm() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (!this.validateField(input, true)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Validate individual field
     */
    validateField(field, showError = true) {
        const fieldName = field.name;
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;

        const value = field.value.trim();
        let errorMessage = '';

        // Required validation
        if (rules.required && !value) {
            errorMessage = `${this.getFieldLabel(field)} is required`;
        }
        // Pattern validation
        else if (rules.pattern && value && !rules.pattern.test(value)) {
            errorMessage = `Please enter a valid ${this.getFieldLabel(field).toLowerCase()}`;
        }
        // Min length validation
        else if (rules.minLength && value.length < rules.minLength) {
            errorMessage = `${this.getFieldLabel(field)} must be at least ${rules.minLength} characters`;
        }
        // Max length validation
        else if (rules.maxLength && value.length > rules.maxLength) {
            errorMessage = `${this.getFieldLabel(field)} must not exceed ${rules.maxLength} characters`;
        }

        if (errorMessage && showError) {
            this.showFieldError(field, errorMessage);
            return false;
        } else {
            this.clearFieldError(field);
            return true;
        }
    }

    /**
     * Show field error
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease-out;
        `;
        
        field.parentNode.appendChild(errorElement);
        
        // Scroll to first error if not visible
        if (!utils.isElementInViewport(field)) {
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Clear field error
     */
    clearFieldError(field) {
        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Get field label
     */
    getFieldLabel(field) {
        const label = field.parentNode.querySelector('label');
        return label ? label.textContent : field.name;
    }

    /**
     * Get form data
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        return data;
    }

    /**
     * Submit form (mock implementation)
     */
    async submitForm(formData) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ success: true, message: 'Message sent successfully!' });
                } else {
                    reject(new Error('Failed to send message. Please try again.'));
                }
            }, 2000);
        });
    }

    /**
     * Handle successful submission
     */
    handleSubmissionSuccess() {
        this.showNotification('Thank you! Your message has been sent successfully.', 'success');
        this.resetForm();
        this.clearSavedFormData();
    }

    /**
     * Handle submission error
     */
    handleSubmissionError(error) {
        console.error('Form submission error:', error);
        this.showNotification(error.message || 'Something went wrong. Please try again.', 'error');
    }

    /**
     * Set submitting state
     */
    setSubmitting(isSubmitting) {
        if (!this.submitButton) return;
        
        if (isSubmitting) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = `
                <div class="loading-spinner"></div>
                Sending...
            `;
            this.submitButton.classList.add('loading');
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = this.originalButtonText;
            this.submitButton.classList.remove('loading');
        }
    }

    /**
     * Reset form
     */
    resetForm() {
        this.form.reset();
        
        // Clear all errors
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });

        // Reset textareas height
        const textareas = this.form.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.style.height = 'auto';
        });

        // Update character counter
        const messageField = this.form.querySelector('#message');
        if (messageField) {
            this.updateCharacterCounter(messageField);
        }
    }

    /**
     * Add character counter
     */
    addCharacterCounter(field) {
        const maxLength = this.validationRules[field.name]?.maxLength || 1000;
        
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            text-align: right;
            font-size: 0.875rem;
            color: #6b7280;
            margin-top: 0.25rem;
        `;
        
        field.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const remaining = maxLength - field.value.length;
            counter.textContent = `${field.value.length}/${maxLength}`;
            counter.style.color = remaining < 50 ? '#dc2626' : '#6b7280';
        };
        
        field.addEventListener('input', updateCounter);
        updateCounter();
        
        this.updateCharacterCounter = updateCounter;
    }

    /**
     * Setup auto-resize for textarea
     */
    setupAutoResize(textarea) {
        const resize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        };
        
        textarea.addEventListener('input', resize);
        textarea.addEventListener('focus', resize);
        
        // Initial resize
        setTimeout(resize, 0);
    }

    /**
     * Save form data to localStorage
     */
    saveFormData() {
        const formData = this.getFormData();
        utils.storage.set('contactForm', formData);
    }

    /**
     * Load saved form data
     */
    loadSavedFormData() {
        const savedData = utils.storage.get('contactForm');
        if (!savedData) return;
        
        Object.keys(savedData).forEach(key => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field && savedData[key]) {
                field.value = savedData[key];
            }
        });
    }

    /**
     * Clear saved form data
     */
    clearSavedFormData() {
        utils.storage.remove('contactForm');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button class="notification-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto dismiss
        const autoDismiss = setTimeout(() => {
            this.dismissNotification(notification);
        }, 5000);
        
        // Manual dismiss
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            clearTimeout(autoDismiss);
            this.dismissNotification(notification);
        });
    }

    /**
     * Get notification color
     */
    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#dc2626',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    /**
     * Dismiss notification
     */
    dismissNotification(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    /**
     * Check if form is focused
     */
    isFormFocused() {
        return this.form.contains(document.activeElement);
    }

    /**
     * Copy contact information
     */
    async copyContactInfo(type) {
        const contactInfo = {
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567'
        };
        
        const text = contactInfo[type];
        if (text) {
            const success = await utils.copyToClipboard(text);
            if (success) {
                this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`, 'success');
            } else {
                this.showNotification('Failed to copy to clipboard', 'error');
            }
        }
    }
}

// Initialize contact controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactController = new ContactController();
    window.contactController = contactController;
    
    // Add click handlers for copy functionality
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(card => {
        card.addEventListener('click', () => {
            const email = card.querySelector('p')?.textContent;
            if (email && email.includes('@')) {
                contactController.copyContactInfo('email');
            } else if (email && email.includes('(')) {
                contactController.copyContactInfo('phone');
            }
        });
    });
});

// Add necessary styles for notifications and form validation
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            font-family: inherit;
            font-size: 0.875rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0.25rem;
            margin: -0.25rem;
            border-radius: 0.25rem;
            transition: background-color 0.2s ease;
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
            border-color: #dc2626;
        }
        
        .loading-spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid transparent;
            border-top: 2px solid currentColor;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 0.5rem;
        }
        
        .btn.loading {
            pointer-events: none;
            opacity: 0.8;
        }
        
        .character-counter {
            transition: color 0.2s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-0.5rem); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .field-error {
            animation: fadeIn 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
});