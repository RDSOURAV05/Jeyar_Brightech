
































































































































































































































































































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
