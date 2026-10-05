/**
 * Smooth Birth Apothecary - Main Interactions
 * Includes category accordions, product drawers, wholesale order calculation, and form handling.
 */

// Configuration for third-party integrations (Clerk Auth, Formspree, etc.)
window.SMOOTH_BIRTH_CONFIG = {
    // Active Formspree Form endpoint
    formspreeOrderEndpoint: "https://formspree.io/f/xbglpwbe",
    formspreeRegEndpoint: "https://formspree.io/f/xbglpwbe",
    // Paste your Clerk Publishable Key here when ready (e.g. "pk_test_...")
    clerkPublishableKey: ""
};

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------------------
     * 1. Navigation Bar Scroll Effect & Mobile Menu
     * ----------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /* -----------------------------------------------------------
     * 2. Intersection Observer for Scroll Animations
     * ----------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }

    /* -----------------------------------------------------------
     * 3. Category Accordion & Filter Tabs (index.html)
     * ----------------------------------------------------------- */
    const categoryItems = document.querySelectorAll('.category-accordion-item');
    const catTabButtons = document.querySelectorAll('.cat-tab-btn');

    // Accordion header click toggles collapse/expand
    document.querySelectorAll('.category-accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const parentItem = header.closest('.category-accordion-item');
            if (parentItem) {
                parentItem.classList.toggle('open');
            }
        });
    });

    // Filter tabs
    catTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            catTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetFilter = btn.getAttribute('data-filter');

            categoryItems.forEach(item => {
                if (targetFilter === 'all') {
                    item.style.display = 'block';
                    item.classList.add('open');
                } else if (item.id === targetFilter) {
                    item.style.display = 'block';
                    item.classList.add('open');
                    item.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Global helper for opening specific categories from navigation dropdown
    window.openCategoryAccordion = function(categoryKey) {
        const idMap = {
            'pregnancy': 'cat-pregnancy',
            'prep': 'cat-birthprep',
            'labor': 'cat-laborsupport',
            'postpartum': 'cat-postpartum'
        };
        const targetId = idMap[categoryKey] || categoryKey;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            categoryItems.forEach(item => {
                item.style.display = 'block';
            });
            targetEl.classList.add('open');
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    /* -----------------------------------------------------------
     * 4. Product Deep Details & FAQ Accordions
     * ----------------------------------------------------------- */
    // Toggle formula details panel
    document.querySelectorAll('.view-details-btn.toggle-details').forEach(btn => {
        btn.addEventListener('click', () => {
            const productCard = btn.closest('.product-card');
            if (!productCard) return;
            const panel = productCard.querySelector('.product-deep-panel');
            const chevron = btn.querySelector('.btn-chevron');

            if (panel) {
                panel.classList.toggle('open');
                if (panel.classList.contains('open')) {
                    if (chevron) chevron.innerHTML = '&#9652;';
                    btn.querySelector('span:first-child').textContent = 'Hide Formula Wisdom';
                } else {
                    if (chevron) chevron.innerHTML = '&#9662;';
                    btn.querySelector('span:first-child').textContent = 'Formula Wisdom & Ingredients';
                }
            }
        });
    });

    // Product FAQs inside panel
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const faqItem = q.closest('.faq-item');
            if (faqItem) {
                faqItem.classList.toggle('active');
            }
        });
    });

    /* -----------------------------------------------------------
     * 5. Wholesale Portal Tabs (wholesale.html)
     * ----------------------------------------------------------- */
    const tabBtnOrder = document.getElementById('tab-btn-order');
    const tabBtnApply = document.getElementById('tab-btn-apply');
    const viewOrder = document.getElementById('view-order');
    const viewApply = document.getElementById('view-apply');

    if (tabBtnOrder && tabBtnApply && viewOrder && viewApply) {
        tabBtnOrder.addEventListener('click', () => {
            tabBtnOrder.classList.add('active');
            tabBtnApply.classList.remove('active');
            viewOrder.classList.add('active');
            viewApply.classList.remove('active');
        });

        tabBtnApply.addEventListener('click', () => {
            tabBtnApply.classList.add('active');
            tabBtnOrder.classList.remove('active');
            viewApply.classList.add('active');
            viewOrder.classList.remove('active');
        });
    }

    /* -----------------------------------------------------------
     * 6. Wholesale Master Order Form Live Calculations
     * ----------------------------------------------------------- */
    const orderForm = document.getElementById('wholesale-order-form');
    if (orderForm) {
        const orderRows = orderForm.querySelectorAll('.order-item-row[data-price]');
        const summaryTotalQty = document.getElementById('summary-total-qty');
        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryMsrp = document.getElementById('summary-msrp');
        const summaryMargin = document.getElementById('summary-margin');
        const summaryShipping = document.getElementById('summary-shipping');
        const summaryGrandTotal = document.getElementById('summary-grand-total');
        const freeShipBar = document.getElementById('free-ship-bar');
        const shippingProgressText = document.getElementById('shipping-progress-text');
        const orderSummaryJson = document.getElementById('order-summary-json');
        const orderSummaryFormatted = document.getElementById('order-summary-formatted');

        const calculateOrder = () => {
            let totalQty = 0;
            let subtotal = 0;
            let totalMsrp = 0;
            const itemsList = [];

            orderRows.forEach(row => {
                const price = parseFloat(row.getAttribute('data-price')) || 0;
                const msrp = parseFloat(row.getAttribute('data-msrp')) || 0;
                const min = parseInt(row.getAttribute('data-min'), 10) || 0;
                const name = row.querySelector('.item-name-col strong').textContent.trim();
                const size = row.getAttribute('data-size') || '';
                const qtyInput = row.querySelector('.qty-input');
                const subtotalValEl = row.querySelector('.item-subtotal-val');
                const qty = parseInt(qtyInput.value, 10) || 0;

                // Minimum order notice styling
                if (qty > 0 && qty < min) {
                    row.style.background = '#FFF9EE';
                    if (!row.querySelector('.min-warn-msg')) {
                        const warn = document.createElement('div');
                        warn.className = 'min-warn-msg';
                        warn.style.fontSize = '0.72rem';
                        warn.style.color = '#B86200';
                        warn.style.marginTop = '0.2rem';
                        warn.textContent = `Batch minimum is ${min} bottles (8 oz)`;
                        row.querySelector('.item-name-col').appendChild(warn);
                    }
                } else {
                    row.style.background = '';
                    const warn = row.querySelector('.min-warn-msg');
                    if (warn) warn.remove();
                }

                const itemSubtotal = qty * price;
                const itemMsrp = qty * msrp;

                subtotalValEl.textContent = `$${itemSubtotal.toFixed(2)}`;

                if (qty > 0) {
                    totalQty += qty;
                    subtotal += itemSubtotal;
                    totalMsrp += itemMsrp;
                    itemsList.push({
                        item: name,
                        size: size,
                        qty: qty,
                        price: price,
                        subtotal: itemSubtotal
                    });
                }
            });

            // Update Summary Elements
            summaryTotalQty.textContent = `${totalQty} bottle${totalQty === 1 ? '' : 's'}`;
            summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
            summaryMsrp.textContent = `$${totalMsrp.toFixed(2)}`;

            const margin = Math.max(0, totalMsrp - subtotal);
            summaryMargin.textContent = `$${margin.toFixed(2)} (${totalMsrp > 0 ? Math.round((margin / totalMsrp) * 100) : 0}% margin)`;

            // Shipping Rule: Over $250 is Free, otherwise $15 flat rate
            const freeShippingThreshold = 250;
            let shippingFee = 15.00;
            if (subtotal >= freeShippingThreshold) {
                shippingFee = 0.00;
                summaryShipping.innerHTML = `<span class="free-ship-badge">FREE (Qualified)</span>`;
                shippingProgressText.innerHTML = `<strong>🎉 Congratulations! You have unlocked FREE Direct Shipping!</strong>`;
                freeShipBar.style.width = '100%';
                freeShipBar.style.background = '#2E7D32';
            } else {
                const diff = (freeShippingThreshold - subtotal).toFixed(2);
                summaryShipping.textContent = `$15.00 Flat Rate`;
                shippingProgressText.textContent = `Add $${diff} more for FREE Shipping`;
                const pct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
                freeShipBar.style.width = `${pct}%`;
                freeShipBar.style.background = 'var(--primary)';
            }

            const grandTotal = subtotal > 0 ? (subtotal + shippingFee) : 0.00;
            summaryGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;

            // Build human-readable formatted order breakdown for direct email invoicing
            let breakdownText = "";
            itemsList.forEach(item => {
                breakdownText += `• ${item.item} (${item.size}) : ${item.qty} bottles @ $${item.price.toFixed(2)}/ea = $${item.subtotal.toFixed(2)}\n`;
            });
            breakdownText += `\n----------------------------------------\n`;
            breakdownText += `Total Bottles: ${totalQty}\n`;
            breakdownText += `Wholesale Subtotal: $${subtotal.toFixed(2)}\n`;
            breakdownText += `Suggested Retail (MSRP): $${totalMsrp.toFixed(2)}\n`;
            breakdownText += `Practice Margin: $${margin.toFixed(2)} (${totalMsrp > 0 ? Math.round((margin / totalMsrp) * 100) : 0}%)\n`;
            breakdownText += `Shipping: ${shippingFee === 0 ? 'FREE (Direct Shipping over $250)' : '$15.00 Flat Rate'}\n`;
            breakdownText += `ESTIMATED INVOICE TOTAL: $${grandTotal.toFixed(2)}`;

            if (orderSummaryFormatted) {
                orderSummaryFormatted.value = breakdownText;
            }

            // Build JSON summary payload
            if (orderSummaryJson) {
                orderSummaryJson.value = JSON.stringify({
                    items: itemsList,
                    total_bottles: totalQty,
                    subtotal: subtotal.toFixed(2),
                    msrp: totalMsrp.toFixed(2),
                    shipping: shippingFee.toFixed(2),
                    estimated_total: grandTotal.toFixed(2)
                });
            }
        };

        // Wire + / - buttons and direct input
        orderRows.forEach(row => {
            const minusBtn = row.querySelector('.btn-minus');
            const plusBtn = row.querySelector('.btn-plus');
            const qtyInput = row.querySelector('.qty-input');
            const min = parseInt(row.getAttribute('data-min'), 10) || 1;

            minusBtn.addEventListener('click', () => {
                let current = parseInt(qtyInput.value, 10) || 0;
                if (current > 0) {
                    current = Math.max(0, current - 1);
                    qtyInput.value = current;
                    calculateOrder();
                }
            });

            plusBtn.addEventListener('click', () => {
                let current = parseInt(qtyInput.value, 10) || 0;
                if (current === 0) {
                    current = min; // Jump directly to batch minimum for practitioner convenience
                } else {
                    current += 1;
                }
                qtyInput.value = current;
                calculateOrder();
            });

            qtyInput.addEventListener('input', () => {
                if (parseInt(qtyInput.value, 10) < 0 || isNaN(parseInt(qtyInput.value, 10))) {
                    qtyInput.value = 0;
                }
                calculateOrder();
            });
        });

        // Initialize calculation
        calculateOrder();

        // Handle AJAX form submission for Master Order
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('order-submit-btn');
            const feedbackBox = document.getElementById('order-form-feedback');
            const originalText = submitBtn.textContent;

            if (feedbackBox) {
                feedbackBox.style.display = 'none';
                feedbackBox.innerHTML = '';
            }

            // Check if any items are selected
            const totalQty = parseInt(summaryTotalQty.textContent, 10) || 0;
            if (totalQty === 0) {
                alert('Please select at least one tincture formula with the required batch minimum to submit an order request.');
                return;
            }

            const clinicName = (document.getElementById('order-clinic')?.value || '').trim();
            const contactName = (document.getElementById('order-contact')?.value || '').trim();
            const contactEmail = (document.getElementById('order-email')?.value || '').trim();
            const contactPhone = (document.getElementById('order-phone')?.value || '').trim();
            const shippingAddress = (document.getElementById('order-address')?.value || '').trim();
            const notes = (document.getElementById('order-notes')?.value || '').trim();

            submitBtn.textContent = 'Submitting Order Request...';
            submitBtn.disabled = true;

            // Build clean submission payload omitting zero-quantity rows so email is clean
            const payload = new FormData();
            payload.append('form_type', 'Wholesale Master Order');
            payload.append('_subject', `New Wholesale Order: ${clinicName || 'Clinic'} (${totalQty} bottles - ${summaryGrandTotal.textContent})`);
            payload.append('_replyto', contactEmail);
            payload.append('clinic_name', clinicName);
            payload.append('contact_name', contactName);
            payload.append('email', contactEmail);
            payload.append('phone', contactPhone);
            payload.append('shipping_address', shippingAddress);

            // Append only items that have quantity > 0
            orderRows.forEach(row => {
                const qtyInput = row.querySelector('.qty-input');
                const qty = parseInt(qtyInput.value, 10) || 0;
                if (qty > 0) {
                    const name = row.querySelector('.item-name-col strong').textContent.trim();
                    const size = row.getAttribute('data-size') || '';
                    payload.append(`${name} (${size})`, `${qty} bottles`);
                }
            });

            // Formatted order breakdown and JSON
            if (orderSummaryFormatted) {
                payload.append('Order_Breakdown', orderSummaryFormatted.value);
            }
            if (orderSummaryJson) {
                payload.append('order_summary_json', orderSummaryJson.value);
            }
            if (notes) {
                payload.append('special_instructions', notes);
            }
            payload.append('terms_acknowledged', 'Yes (Agreed to invoice & fulfillment terms)');

            const targetUrl = window.SMOOTH_BIRTH_CONFIG.formspreeOrderEndpoint || orderForm.action;

            fetch(targetUrl, {
                method: 'POST',
                body: payload,
                headers: { 'Accept': 'application/json' }
            })
            .then(res => {
                if (res.ok) {
                    window.location.href = 'thanks.html';
                } else {
                    return res.json().then(data => {
                        let errMsg = 'There was an issue processing your order submission.';
                        if (data && data.errors && data.errors.length > 0) {
                            errMsg = data.errors.map(err => err.message).join(', ');
                        }
                        throw new Error(errMsg);
                    });
                }
            })
            .catch(err => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                if (feedbackBox) {
                    feedbackBox.style.display = 'block';
                    feedbackBox.style.background = '#FFF3F3';
                    feedbackBox.style.border = '1px solid #D32F2F';
                    feedbackBox.style.color = '#B71C1C';

                    const mailtoSubject = encodeURIComponent(`Wholesale Order Request - ${clinicName}`);
                    const mailtoBody = encodeURIComponent(`Hi Simba,\n\nHere is our wholesale order request for ${clinicName}:\n\nPrimary Contact: ${contactName}\nPhone: ${contactPhone}\nShipping Address: ${shippingAddress}\n\n${orderSummaryFormatted ? orderSummaryFormatted.value : ''}\n\nSpecial Instructions: ${notes}`);

                    feedbackBox.innerHTML = `<strong>Submission Notice:</strong> ${err.message || 'We could not reach the form submission server.'}<br><br>
                    <a href="mailto:hello@smoothbirth.com?subject=${mailtoSubject}&body=${mailtoBody}" style="color: #B71C1C; font-weight: 700; text-decoration: underline;">
                        &rarr; Click here to send your order directly via Email to hello@smoothbirth.com
                    </a>`;
                } else {
                    alert('Submission error: ' + (err.message || 'Please email your order to hello@smoothbirth.com'));
                }
            });
        });
    }

    /* -----------------------------------------------------------
     * 7. Practitioner Registration Form AJAX
     * ----------------------------------------------------------- */
    const registerForm = document.getElementById('practitioner-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('reg-submit-btn');
            const feedbackBox = document.getElementById('reg-form-feedback');
            const originalText = submitBtn.textContent;

            if (feedbackBox) {
                feedbackBox.style.display = 'none';
                feedbackBox.innerHTML = '';
            }

            const regName = (document.getElementById('reg-name')?.value || '').trim();
            const regClinic = (document.getElementById('reg-clinic')?.value || '').trim();
            const regEmail = (document.getElementById('reg-email')?.value || '').trim();

            submitBtn.textContent = 'Submitting Application...';
            submitBtn.disabled = true;

            const payload = new FormData(registerForm);
            payload.set('_subject', `New Practitioner Application: ${regName} (${regClinic})`);
            payload.set('_replyto', regEmail);

            const targetUrl = window.SMOOTH_BIRTH_CONFIG.formspreeRegEndpoint || registerForm.action;

            fetch(targetUrl, {
                method: 'POST',
                body: payload,
                headers: { 'Accept': 'application/json' }
            })
            .then(res => {
                if (res.ok) {
                    window.location.href = 'thanks.html';
                } else {
                    return res.json().then(data => {
                        let errMsg = 'Application submission could not be processed.';
                        if (data && data.errors && data.errors.length > 0) {
                            errMsg = data.errors.map(err => err.message).join(', ');
                        }
                        throw new Error(errMsg);
                    });
                }
            })
            .catch(err => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                if (feedbackBox) {
                    feedbackBox.style.display = 'block';
                    feedbackBox.style.background = '#FFF3F3';
                    feedbackBox.style.border = '1px solid #D32F2F';
                    feedbackBox.style.color = '#B71C1C';
                    feedbackBox.innerHTML = `<strong>Application Notice:</strong> ${err.message || 'We could not reach the server.'}<br><br>
                    Please email your clinic credentials directly to <a href="mailto:hello@smoothbirth.com?subject=${encodeURIComponent('Practitioner Application - ' + regClinic)}" style="color: #B71C1C; font-weight: 700; text-decoration: underline;">hello@smoothbirth.com</a>.`;
                } else {
                    alert('Submission error. Please email hello@smoothbirth.com.');
                }
            });
        });
    }

    /* -----------------------------------------------------------
     * 8. Clerk Authentication Integration Hook (Optional BaaS)
     * ----------------------------------------------------------- */
    if (window.SMOOTH_BIRTH_CONFIG.clerkPublishableKey) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = async () => {
            try {
                const clerk = window.Clerk;
                await clerk.load({ publishableKey: window.SMOOTH_BIRTH_CONFIG.clerkPublishableKey });

                if (clerk.user) {
                    // Pre-fill user data into the order form
                    const clinicInput = document.getElementById('order-clinic');
                    const contactInput = document.getElementById('order-contact');
                    const emailInput = document.getElementById('order-email');

                    if (contactInput && !contactInput.value) {
                        contactInput.value = clerk.user.fullName || '';
                    }
                    if (emailInput && !emailInput.value) {
                        emailInput.value = clerk.user.primaryEmailAddress ? clerk.user.primaryEmailAddress.emailAddress : '';
                    }
                    if (clinicInput && !clinicInput.value && clerk.user.publicMetadata && clerk.user.publicMetadata.clinicName) {
                        clinicInput.value = clerk.user.publicMetadata.clinicName;
                    }
                }
            } catch (err) {
                console.warn('Clerk initialization notice:', err);
            }
        };
        document.head.appendChild(script);
    }

});
