/* ==========================================================================
   Jeyar Brightech Solar Systems JavaScript
   Contains: Theme switching, mobile menu drawer, stat counters,
   interactive solar savings calculator, accordion toggle,
   fade-in reveals, and toast message notification system.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- Theme Toggle System --- */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme') || 
                       (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    
    // Apply theme
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        showToast(`Switched to ${newTheme.toUpperCase()} mode!`, 'success');
    });

    function updateThemeIcon(theme) {
        const icon = themeToggleBtn.querySelector('i');
        if (theme === 'light') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }


    /* --- Sticky Header Scrolling --- */
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    /* --- Mobile Navigation Drawer --- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking nav links or scroll
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Update active link state manually on click
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });


    /* --- Stat Counters Animation --- */
    const stats = document.querySelectorAll('.stat-number');
    const statsObserverOptions = {
        threshold: 0.5,
        rootMargin: "0px 0px -50px 0px"
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-target'), 10);
                animateCounter(target, endValue);
                observer.unobserve(target); // Only animate once
            }
        });
    }, statsObserverOptions);

    stats.forEach(stat => statsObserver.observe(stat));

    function animateCounter(element, targetValue) {
        let startValue = 0;
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function updateCount(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease-out quad formula
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.floor(easeProgress * targetValue);
            
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = targetValue;
            }
        }

        requestAnimationFrame(updateCount);
    }


    /* --- Interactive Solar Calculator --- */
    const monthlyBillInput = document.getElementById('monthly-bill');
    const billDisplay = document.getElementById('bill-display');
    const exposureSelect = document.getElementById('solar-exposure');
    
    // Result elements
    const systemSizeEl = document.getElementById('res-system-size');
    const savingsEl = document.getElementById('res-monthly-savings');
    const spaceEl = document.getElementById('res-roof-space');
    const paybackEl = document.getElementById('res-payback');
    const treesEl = document.getElementById('res-trees');
    const co2El = document.getElementById('res-co2');

    // Dynamic package recommendation DOM nodes
    const recPackageName = document.getElementById('rec-package-name');
    const recPackageDesc = document.getElementById('rec-package-desc');
    const recPackageYield = document.getElementById('rec-package-yield');
    const recPackageWarranty = document.getElementById('rec-package-warranty');

    // Handle inputs changes
    if (monthlyBillInput) {
        monthlyBillInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value, 10);
            billDisplay.textContent = `₹${value.toLocaleString('en-IN')}`;
            calculateSolarPotential();
        });
    }

    if (exposureSelect) {
        exposureSelect.addEventListener('change', calculateSolarPotential);
    }

    // Initial run
    calculateSolarPotential();

    function calculateSolarPotential() {
        if (!monthlyBillInput || !exposureSelect) return;

        const monthlyBill = parseInt(monthlyBillInput.value, 10);
        const exposureMultiplier = parseFloat(exposureSelect.value);
        
        const unitRate = 7.5;
        const estUnitsConsumed = monthlyBill / unitRate;
        
        // System size in kW needed to offset ~90% of electricity bill (or max offset)
        let neededSystemSize = (estUnitsConsumed / 120) * 0.9;
        
        // Shade adjustment: less exposure means we need a slightly bigger system to meet the same demand
        neededSystemSize = neededSystemSize / exposureMultiplier;
        
        // Floor/ceiling bounds
        neededSystemSize = Math.max(1, Math.min(100, neededSystemSize));
        // Round to 1 decimal place
        neededSystemSize = Math.round(neededSystemSize * 10) / 10;

        // Estimated Monthly Savings: residential offsets up to 90%
        const offsetPercent = 0.90;
        let monthlySavings = monthlyBill * offsetPercent * exposureMultiplier;
        monthlySavings = Math.min(monthlyBill, Math.round(monthlySavings));

        // Required Roof Space: Monocrystalline panels require ~100 sq ft per kW
        const roofSpaceNeeded = Math.round(neededSystemSize * 100);

        // Payback Period (ROI): System cost / Annual savings
        const costPerKw = 60000;
        const totalSystemCost = neededSystemSize * costPerKw;
        const annualSavings = monthlySavings * 12;
        
        let paybackPeriod = totalSystemCost / annualSavings;
        paybackPeriod = Math.max(3.0, Math.min(10.0, paybackPeriod)); // bounds
        paybackPeriod = Math.round(paybackPeriod * 10) / 10; // 1 decimal place

        // Render values to UI
        if (systemSizeEl) systemSizeEl.textContent = `${neededSystemSize.toFixed(1)} kWp`;
        if (savingsEl) savingsEl.textContent = `₹${monthlySavings.toLocaleString('en-IN')}`;
        if (spaceEl) spaceEl.textContent = `${roofSpaceNeeded} sq. ft.`;
        if (paybackEl) paybackEl.textContent = `${paybackPeriod.toFixed(1)} Years`;

        // Dynamic package update logic
        if (recPackageName && recPackageDesc && recPackageYield && recPackageWarranty) {
            if (neededSystemSize <= 3.4) {
                recPackageName.textContent = '3 kW Solar Plant';
                recPackageDesc.textContent = 'Perfect for small to medium households. Ideal for offsetting power bills of standard appliances, lighting, fans, and a single air conditioner.';
                recPackageYield.textContent = '12–15 Units';
                recPackageWarranty.textContent = '30 Years';
            } else if (neededSystemSize <= 5.9) {
                recPackageName.textContent = '5 kW Solar Plant';
                recPackageDesc.textContent = 'Our most popular option for average Indian families. Easily offsets consumption from multiple ACs, refrigerators, and water pumps.';
                recPackageYield.textContent = '20–25 Units';
                recPackageWarranty.textContent = '30 Years';
            } else if (neededSystemSize <= 8.9) {
                recPackageName.textContent = '8 kW Solar Plant';
                recPackageDesc.textContent = 'Designed for large residential spaces or multi-family properties. Supports heavy electrical loads, EV chargers, and multiple HVAC units.';
                recPackageYield.textContent = '32–40 Units';
                recPackageWarranty.textContent = '30 Years';
            } else {
                recPackageName.textContent = '10 kW Solar Plant';
                recPackageDesc.textContent = 'Maximum domestic capacity. Provides total energy independence and protection against utility tariffs for large homes with luxury setups.';
                recPackageYield.textContent = '40–50 Units';
                recPackageWarranty.textContent = '30 Years';
            }
        }
    }

    // Toggle collapsible spec sheet
    const toggleSpecBtn = document.getElementById('toggle-spec-btn');
    const collapsibleSpecs = document.getElementById('collapsible-specs');
    if (toggleSpecBtn && collapsibleSpecs) {
        toggleSpecBtn.addEventListener('click', () => {
            collapsibleSpecs.classList.toggle('hidden');
            if (collapsibleSpecs.classList.contains('hidden')) {
                toggleSpecBtn.innerHTML = '<i class="fa-solid fa-table"></i> View Spec Sheet';
            } else {
                toggleSpecBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Hide Spec Sheet';
            }
        });
    }


    /* --- FAQ Accordion --- */
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');

            // Collapse all others
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Toggle current
            if (!isActive) {
                faqItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });


    /* --- Reveal Scroll Animation --- */
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => revealObserver.observe(el));


    /* --- Form Submission Simulation --- */
    const contactForm = document.getElementById('solar-contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const submitLoader = document.getElementById('submit-loader');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic client validation checks
        const name = document.getElementById('contact-name').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const address = document.getElementById('contact-address').value.trim();

        if (!name || !phone || !email || !address) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        // Disable button & show loading spinner
        submitBtn.disabled = true;
        submitBtnText.classList.add('hidden');
        submitLoader.classList.remove('hidden');

        // Simulate API post (1.5 seconds)
        setTimeout(() => {
            // Reset button states
            submitBtn.disabled = false;
            submitBtnText.classList.remove('hidden');
            submitLoader.classList.add('hidden');

            // Reset form
            contactForm.reset();

            // Re-calculate solar values to slider default
            monthlyBillInput.value = 5000;
            billDisplay.textContent = '₹5,000';
            calculateSolarPotential();

            // Show congratulations toast
            showToast('Request submitted! Santhosh Kumar J. R. will contact you shortly.', 'success');
        }, 1500);
    });


    /* --- Toast Notification Helper --- */
    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;

        const iconClass = type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check';
        
        toast.innerHTML = `
            <span class="toast-icon"><i class="${iconClass}"></i></span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Slide out and remove toast after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutToast 0.3s ease-in forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 4000);
    }
});
