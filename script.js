// Global variables
let currentImageIndex = 0;
const galleryImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=1200&fit=crop'
];

// DOM Content Loaded - Optimized loading
document.addEventListener('DOMContentLoaded', function() {
    // Critical functions first
    initializeCountdown();
    initializeNavigation();
    initializeForms();
    
    // Delayed non-critical functions for better performance
    requestIdleCallback(() => {
        initializeScrollEffects();
        initializeOptimizedScrollAnimations();
        initializeLazyLoading();
        initializePerformanceMonitoring();
        createFloatingHearts();
        enhanceFloatingHearts();
        createFallingPetals();
        initializeMobileNav();
    });
});

// Countdown Timer
function initializeCountdown() {
    const weddingDate = new Date('2025-07-20T14:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('countdown').innerHTML = '<div class="countdown-finished">🎉 Đã đến ngày cưới! 🎉</div>';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Optimized scroll animations - Single observer for all elements
function initializeOptimizedScrollAnimations() {
    // Use single intersection observer for better performance
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
    };
    
    let animationQueue = [];
    let isProcessing = false;
    
    const processAnimationQueue = () => {
        if (isProcessing || animationQueue.length === 0) return;
        
        isProcessing = true;
        requestAnimationFrame(() => {
            const batch = animationQueue.splice(0, 5); // Process 5 at a time
            
            batch.forEach(({ element, delay }) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0) scale(1) rotateY(0deg)';
                    element.classList.add('is-visible');
                }, delay);
            });
            
            isProcessing = false;
            if (animationQueue.length > 0) {
                processAnimationQueue();
            }
        });
    };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = parseFloat(element.dataset.delay || 0) * 100;
                
                // Add to queue instead of immediate animation
                animationQueue.push({ element, delay });
                
                // Unobserve to prevent re-triggering
                observer.unobserve(element);
                
                // Process queue
                processAnimationQueue();
            }
        });
    }, observerOptions);
    
    // Set initial styles and observe all scroll-animate elements
    const scrollElements = document.querySelectorAll('.scroll-animate');
    scrollElements.forEach((el, index) => {
        // Set initial state with CSS transforms for smoother animations
        el.style.opacity = '0';
        el.style.willChange = 'transform, opacity';
        el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Set appropriate initial transform based on animation class
        if (el.classList.contains('slide-in-left')) {
            el.style.transform = 'translateX(-50px)';
        } else if (el.classList.contains('slide-in-right')) {
            el.style.transform = 'translateX(50px)';
        } else if (el.classList.contains('slide-in-down')) {
            el.style.transform = 'translateY(-50px)';
        } else if (el.classList.contains('zoom-in')) {
            el.style.transform = 'scale(0.8)';
        } else if (el.classList.contains('bounce-in')) {
            el.style.transform = 'scale(0.3) translateY(30px)';
        } else {
            el.style.transform = 'translateY(30px)';
        }
        
        // Store delay as data attribute
        const delayClass = [...el.classList].find(cls => cls.startsWith('delay-'));
        if (delayClass) {
            el.dataset.delay = delayClass.replace('delay-', '');
        }
        
        observer.observe(el);
    });
    
    // Cleanup when page is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            observer.disconnect();
        }
    });
}

// Scroll Effects
function initializeScrollEffects() {
    const navbar = document.querySelector('.navbar');
    let ticking = false;
    
    function updateScroll() {
        const scrolled = window.scrollY;
        
        // Navbar scroll effect
        if (scrolled > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Optimized parallax with will-change
        const hero = document.querySelector('.hero-slideshow');
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        
        // Floating hearts parallax
        const hearts = document.querySelectorAll('.floating-hearts i');
        if (hearts.length && scrolled < window.innerHeight * 2) {
            hearts.forEach((heart, index) => {
                const speed = 0.1 + (index * 0.02);
                heart.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }, { passive: true });
}

// Animate elements when they come into view
function animateOnScroll() {
    const elements = document.querySelectorAll('.timeline-item, .detail-card, .gallery-item');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('animate');
        }
    });
    
    // Special handling for timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        const itemTop = item.getBoundingClientRect().top;
        const itemVisible = 100;
        
        if (itemTop < window.innerHeight - itemVisible) {
            setTimeout(() => {
                item.classList.add('animate');
                
                // Animate children with stagger
                const icon = item.querySelector('.timeline-icon');
                const content = item.querySelector('.timeline-content');
                
                if (icon) {
                    setTimeout(() => {
                        icon.classList.add('is-visible');
                    }, 200);
                }
                
                if (content) {
                    setTimeout(() => {
                        content.classList.add('is-visible');
                    }, 400);
                }
            }, index * 200);
        }
    });
}

// Navigation
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 70; // Account for navbar height
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Initialize forms
function initializeForms() {
    const rsvpForm = document.getElementById('rsvpForm');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRSVPSubmission();
        });
    }
}

// Handle RSVP form submission
function handleRSVPSubmission() {
    const formData = new FormData(document.getElementById('rsvpForm'));
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = document.querySelector('.submit-button');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    submitBtn.disabled = true;
    
    // Send to PHP API
    fetch('api/submit_rsvp.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification(result.message, 'success');
            // Reset form
            document.getElementById('rsvpForm').reset();
        } else {
            showNotification(result.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Có lỗi xảy ra, vui lòng thử lại sau', 'error');
    })
    .finally(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}



// Gallery functions
function openModal(index) {
    currentImageIndex = index;
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    modal.style.display = 'flex';
    modalImage.src = galleryImages[index];
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleModalKeydown);
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Remove keyboard navigation
    document.removeEventListener('keydown', handleModalKeydown);
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    document.getElementById('modalImage').src = galleryImages[currentImageIndex];
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById('modalImage').src = galleryImages[currentImageIndex];
}

function handleModalKeydown(e) {
    switch(e.key) {
        case 'Escape':
            closeModal();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
}

// Map function
function openMap() {
    const mapUrl = 'https://www.google.com/maps/search/123+Nguyễn+Du,+Quận+1,+TP.HCM/@10.7769,106.7009,15z';
    window.open(mapUrl, '_blank');
}

// Wish Modal Functions
function openWishModal() {
    const modal = document.getElementById('wishModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add event listener for form submission
    const wishForm = document.getElementById('wishForm');
    wishForm.addEventListener('submit', handleWishSubmission);
}

function closeWishModal() {
    const modal = document.getElementById('wishModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('wishForm').reset();
}

function handleWishSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(document.getElementById('wishForm'));
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = document.querySelector('.wish-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    submitBtn.disabled = true;
    
    // Send to PHP API
    fetch('api/submit_wish.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showNotification(result.message, 'success');
            closeWishModal();
        } else {
            showNotification(result.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Có lỗi xảy ra, vui lòng thử lại sau', 'error');
    })
    .finally(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Gift Modal Functions
function openGiftModal() {
    const modal = document.getElementById('giftModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeGiftModal() {
    const modal = document.getElementById('giftModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Create floating hearts animation
function createFloatingHearts() {
    const heartsContainer = document.querySelector('.floating-hearts');
    if (!heartsContainer) return;
    
    const hearts = heartsContainer.querySelectorAll('i');
    
    hearts.forEach((heart, index) => {
        // Set random animation properties
        const animationDuration = Math.random() * 3 + 2; // 2-5 seconds
        const delay = index * 0.5; // Stagger the animations
        const drift = (Math.random() - 0.5) * 50; // Random horizontal drift
        
        heart.style.animationDuration = `${animationDuration}s`;
        heart.style.animationDelay = `${delay}s`;
        heart.style.setProperty('--drift', `${drift}px`);
        
        // Add floating animation class
        heart.classList.add('floating-heart');
    });
}

// Enhanced floating hearts with parallax
function enhanceFloatingHearts() {
    const hearts = document.querySelectorAll('.floating-hearts i');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        hearts.forEach((heart, index) => {
            const speed = 0.1 + (index * 0.05);
            const rotation = scrolled * 0.05;
            heart.style.transform = `translateY(${scrolled * speed}px) rotate(${rotation}deg)`;
        });
    });
}

// Copy bank account information
function copyBankInfo(type) {
    let bankInfo = '';
    let successMessage = '';
    
    if (type === 'bride') {
        bankInfo = '0355233332';
        successMessage = 'Đã sao chép thông tin tài khoản nhà gái!';
    } else if (type === 'groom') {
        bankInfo = '0964710413';
        successMessage = 'Đã sao chép thông tin tài khoản nhà trai!';
    } else {
        // Fallback for old function calls without parameter
        bankInfo = '0964710413';
        successMessage = 'Đã sao chép thông tin tài khoản!';
    }
    
    // Try to copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(bankInfo).then(function() {
            showNotification(successMessage, 'success');
        }).catch(function(err) {
            console.error('Could not copy text: ', err);
            fallbackCopyTextToClipboard(bankInfo, successMessage);
        });
    } else {
        fallbackCopyTextToClipboard(bankInfo, successMessage);
    }
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text, successMessage) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification(successMessage, 'success');
        } else {
            showNotification('Không thể sao chép. Vui lòng copy thủ công.', 'error');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showNotification('Không thể sao chép. Vui lòng copy thủ công.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Show notification function
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `copy-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4ecdc4' : '#ff6b6b'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const wishModal = document.getElementById('wishModal');
    const giftModal = document.getElementById('giftModal');
    
    if (e.target === wishModal) {
        closeWishModal();
    }
    
    if (e.target === giftModal) {
        closeGiftModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const wishModal = document.getElementById('wishModal');
        const giftModal = document.getElementById('giftModal');
        
        if (wishModal.style.display === 'flex') {
            closeWishModal();
        }
        
        if (giftModal.style.display === 'flex') {
            closeGiftModal();
        }
    }
});

// Floating actions - static display without animations
document.addEventListener('DOMContentLoaded', function() {
    const floatingActions = document.querySelectorAll('.floating-action');
    
    // Simply show all floating actions without animations
    floatingActions.forEach(action => {
        action.classList.add('show');
    });
});

// Floating action styles - static without animations
const floatingActionStyles = document.createElement('style');
floatingActionStyles.textContent = `
    /* Removed all floating action animations */
`;
document.head.appendChild(floatingActionStyles);

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
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
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        background: rgba(255,255,255,0.3);
    }
    
    @media (max-width: 768px) {
        .notification {
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize intersection observer for animations
function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add enhanced scroll effect for detailed elements
                entry.target.classList.add('is-visible');
                
                // Handle stagger animation for children
                const children = entry.target.querySelectorAll('.scroll-animate');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('is-visible');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe all elements with scroll-animate class
    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
    
    // Observe traditional elements for backward compatibility
    document.querySelectorAll('.timeline-item, .detail-card, .gallery-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add mobile navigation functionality
function initializeMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Initialize everything when DOM is ready (removed duplicate event listener)

// Handle window resize
window.addEventListener('resize', function() {
    // Recalculate positions if needed
    if (window.innerWidth > 768) {
        document.querySelector('.hamburger')?.classList.remove('active');
        document.querySelector('.nav-menu')?.classList.remove('active');
    }
});

// Add touch gestures for mobile gallery
let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
    if (touchEndX < touchStartX - 50) {
        nextImage();
    }
    if (touchEndX > touchStartX + 50) {
        prevImage();
    }
}

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (document.getElementById('imageModal').style.display === 'flex') {
        handleGesture();
    }
});

// Hero Slideshow
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');

function nextSlide() {
    if (slides.length === 0) return;
    
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// Auto-advance slideshow
setInterval(nextSlide, 5000);

// Scroll Animations Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe all scroll-animate elements
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.scroll-animate');
    animateElements.forEach(el => {
        scrollObserver.observe(el);
    });
});

// Advanced Scroll Effects
function initAdvancedScrollEffects() {
    const scrollElements = document.querySelectorAll('.scroll-animate');
    
    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= 
            (window.innerHeight || document.documentElement.clientHeight) / dividend
        );
    };
    
    const elementOutofView = (el) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop > (window.innerHeight || document.documentElement.clientHeight)
        );
    };
    
    const displayScrollElement = (element) => {
        element.classList.add('animate');
    };
    
    const hideScrollElement = (element) => {
        element.classList.remove('animate');
    };
    
    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            } else if (elementOutofView(el)) {
                hideScrollElement(el);
            }
        });
    };
    
    window.addEventListener('scroll', handleScrollAnimation);
}

// Optimized Falling Petals Animation
function createFallingPetals() {
    const petalContainers = document.querySelectorAll('.falling-petals');
    const maxPetals = 15; // Reduced from unlimited
    let petalCount = 0;
    
    petalContainers.forEach(container => {
        let containerPetals = 0;
        const maxPerContainer = Math.floor(maxPetals / petalContainers.length);
        
        // Reduced frequency for better performance
        const petalInterval = setInterval(() => {
            if (containerPetals >= maxPerContainer || document.hidden) return;
            
            if (Math.random() > 0.5) { // 50% chance instead of 70%
                createOptimizedPetal(container);
                containerPetals++;
            }
        }, 800); // Increased interval from 300ms
        
        // Initial petals
        for (let i = 0; i < 3; i++) { // Reduced from 5
            setTimeout(() => {
                if (containerPetals < maxPerContainer) {
                    createOptimizedPetal(container);
                    containerPetals++;
                }
            }, i * 400);
        }
        
        // Cleanup interval when container is removed
        const observer = new MutationObserver(() => {
            if (!document.contains(container)) {
                clearInterval(petalInterval);
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

function createOptimizedPetal(container) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    
    // Use CSS custom properties for better performance
    const startPosition = Math.random() * 100;
    const animationDuration = Math.random() * 2 + 3; // Reduced range: 3-5 seconds
    const size = Math.random() * 6 + 6; // Reduced size: 6-12px
    const drift = (Math.random() - 0.5) * 60;
    
    petal.style.cssText = `
        left: ${startPosition}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${animationDuration}s;
        --drift: ${drift}px;
        will-change: transform;
    `;
    
    container.appendChild(petal);
    
    // Auto-remove with cleanup
    const timeout = setTimeout(() => {
        if (petal.parentNode) {
            petal.remove();
        }
    }, animationDuration * 1000 + 500);
    
    // Cleanup on visibility change
    const visibilityHandler = () => {
        if (document.hidden) {
            clearTimeout(timeout);
            if (petal.parentNode) {
                petal.remove();
            }
        }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler, { once: true });
}

// Enhanced falling animation with drift
const style = document.createElement('style');
style.textContent = `
    @keyframes fallDown {
        0% {
            transform: translateY(-100vh) translateX(0) rotate(0deg);
            opacity: 1;
        }
        25% {
            transform: translateY(-75vh) translateX(var(--drift, 0px)) rotate(90deg);
        }
        50% {
            transform: translateY(-50vh) translateX(calc(var(--drift, 0px) * 0.5)) rotate(180deg);
        }
        75% {
            transform: translateY(-25vh) translateX(var(--drift, 0px)) rotate(270deg);
        }
        100% {
            transform: translateY(100vh) translateX(0) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }
}

// Add requestIdleCallback polyfill for older browsers
window.requestIdleCallback = window.requestIdleCallback || function(cb) {
    return setTimeout(cb, 1);
};

// Initialize performance monitoring
function initializePerformanceMonitoring() {
    // Cleanup unused animations
    const cleanupAnimations = () => {
        const elements = document.querySelectorAll('.scroll-animate.is-visible');
        elements.forEach(el => {
            el.style.willChange = 'auto';
        });
    };
    
    // Run cleanup after initial animations
    setTimeout(cleanupAnimations, 3000);
    
    // Pause animations when page is hidden
    document.addEventListener('visibilitychange', () => {
        const elements = document.querySelectorAll('.scroll-animate, .floating-hearts, .falling-petals');
        elements.forEach(el => {
            if (document.hidden) {
                el.style.animationPlayState = 'paused';
            } else {
                el.style.animationPlayState = 'running';
            }
        });
    });
}

// Initialize all effects on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeIntersectionObserver();
    initializeLazyLoading();
    initializePerformanceMonitoring();
});
