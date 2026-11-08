/**
 * Smooth Birth Apothecary - Main Interactions
 * Includes category accordions, product drawers, wholesale order calculation, and form handling.
 */

// Configuration for third-party integrations (Clerk Auth, Formspree, etc.)
window.SMOOTH_BIRTH_CONFIG = {
    // Active Formspree Form endpoint
    formspreeOrderEndpoint: "https://formspree.io/f/xbglpwbe",
    formspreeRegEndpoint: "https://formspree.io/f/xbglpwbe",
    // Cloudflare Turnstile Site Key
    turnstileSiteKey: "0x4AAAAAAFUz1RMAT1FQIPVT",
    // Clerk Publishable Key (Smooth Birth Apothecary production)
    clerkPublishableKey: "pk_live_Y2xlcmsuc21vb3RoYmlydGguY29tJA",
    // Default dispensary access password for approved practitioners
    practitionerPassword: "smoothbirth",
    // Cloudflare Worker 1-Click Approval Endpoint
    approvalWorkerEndpoint: "https://smoothbirth-approval-worker.smoothbirth.workers.dev/approve",
    approvalSecretToken: "sb_dispensary_secret_2026"
};

document.addEventListener('DOMContentLoaded', () => {

    /* -----------------------------------------------------------
     * 1. Navigation Bar Scroll Effect & Mobile Menu
     * ----------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const heroSection = document.querySelector('.hero');

    if (navbar) {
        if (heroSection) {
            // Homepage with dark hero: toggle scrolled styling on scroll
            window.addEventListener('scroll', () => {
                if (window.scrollY > 40) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        } else {
            // Subpages (about, wholesale, tinctures): navbar must permanently stay scrolled/light
            navbar.classList.add('scrolled');
        }
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
     * 1b. Navigation Dropdown Hover Intent (Grace Period)
     * ----------------------------------------------------------- */
    document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
        let closeTimer = null;

        const openMenu = () => {
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
            dropdown.classList.add('is-open');
        };

        const closeMenu = () => {
            if (closeTimer) clearTimeout(closeTimer);
            closeTimer = setTimeout(() => {
                dropdown.classList.remove('is-open');
            }, 300); // 300ms grace period keeps menu rock-solid during mouse movement
        };

        dropdown.addEventListener('mouseenter', openMenu);
        dropdown.addEventListener('mouseleave', closeMenu);
    });

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
    const categoryItems = document.querySelectorAll('.category-accordion-item:not(.phase-accordion-bar)');
    const catTabButtons = document.querySelectorAll('.category-filter-nav:not(.phase-filter-nav) .cat-tab-btn');

    // Accordion header click toggles collapse/expand
    document.querySelectorAll('.category-accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const parentItem = header.closest('.category-accordion-item:not(.phase-accordion-bar)');
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
                    item.classList.remove('open');
                } else if (item.id === targetFilter) {
                    item.style.display = 'block';
                    item.classList.add('open');
                    item.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    item.style.display = 'none';
                    item.classList.remove('open');
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
     * 5. Wholesale Practitioner Authentication & Portal Gating (wholesale.html)
     * ----------------------------------------------------------- */
    const viewOrder = document.getElementById('view-order');
    const viewApply = document.getElementById('view-apply');
    const viewPending = document.getElementById('view-pending');
    const pendingDisplay = document.getElementById('pending-user-display');
    const btnPendingLogout = document.getElementById('btn-pending-logout');
    const sessionDisplay = document.getElementById('session-user-display');
    const btnToggleLogin = document.getElementById('btn-toggle-login');
    const btnTogglePassLogin = document.getElementById('btn-toggle-pass-login');
    const btnCancelLogin = document.getElementById('btn-cancel-login');
    const loginCard = document.getElementById('practitioner-login-card');
    const loginForm = document.getElementById('practitioner-login-form');
    const loginError = document.getElementById('login-error-msg');
    const btnLogout = document.getElementById('btn-practitioner-logout');
    const clerkUserButtonMount = document.getElementById('clerk-user-button');

    const AUTH_STORAGE_KEY = 'sb_practitioner_session';

    const getPractitionerSession = () => {
        try {
            const raw = localStorage.getItem(AUTH_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    };

    const setPractitionerSession = (data) => {
        try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    };

    const clearPractitionerSession = () => {
        try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (e) {}
    };

    // Centralized View Renderer for Wholesale Portal
    const showMasterOrderView = (sessionInfo) => {
        if (viewOrder) {
            viewOrder.classList.add('active');
            viewOrder.style.display = 'block';
        }
        if (viewApply) {
            viewApply.classList.remove('active');
            viewApply.style.display = 'none';
        }
        if (viewPending) {
            viewPending.classList.remove('active');
            viewPending.style.display = 'none';
        }
        if (sessionDisplay) {
            sessionDisplay.textContent = sessionInfo.email || 'Verified Practitioner';
        }
        const orderEmail = document.getElementById('order-email');
        if (orderEmail && !orderEmail.value && sessionInfo.email && sessionInfo.email.includes('@')) {
            orderEmail.value = sessionInfo.email;
        }
        if (loginCard) {
            loginCard.style.display = 'none';
        }

        if (sessionInfo.type === 'clerk') {
            if (window.Clerk && clerkUserButtonMount) {
                try {
                    window.Clerk.mountUserButton(clerkUserButtonMount);
                } catch (e) {}
            }
        } else {
            if (clerkUserButtonMount) {
                clerkUserButtonMount.innerHTML = '';
            }
        }
        if (btnLogout) {
            btnLogout.style.display = 'inline-block';
        }
    };

    const showApplicationView = () => {
        if (viewOrder) {
            viewOrder.classList.remove('active');
            viewOrder.style.display = 'none';
        }
        if (viewApply) {
            viewApply.classList.add('active');
            viewApply.style.display = 'block';
        }
        if (viewPending) {
            viewPending.classList.remove('active');
            viewPending.style.display = 'none';
        }
        if (clerkUserButtonMount) {
            clerkUserButtonMount.innerHTML = '';
        }
        if (loginCard) {
            loginCard.style.display = 'none';
        }
    };

    const showPendingView = (sessionInfo) => {
        if (viewOrder) {
            viewOrder.classList.remove('active');
            viewOrder.style.display = 'none';
        }
        if (viewApply) {
            viewApply.classList.remove('active');
            viewApply.style.display = 'none';
        }
        if (viewPending) {
            viewPending.classList.add('active');
            viewPending.style.display = 'block';
        }
        if (pendingDisplay) {
            pendingDisplay.textContent = sessionInfo.email || 'Practitioner';
        }
        if (loginCard) {
            loginCard.style.display = 'none';
        }
    };

    // Unified auth state evaluator: checks Clerk user first, then local password session
    const syncPortalAuthState = (clerkUser) => {
        // 1. If Clerk reports an authenticated user, verify approval status
        if (clerkUser) {
            const email = clerkUser.primaryEmailAddress ? clerkUser.primaryEmailAddress.emailAddress : (clerkUser.fullName || 'Verified Practitioner');
            const meta = clerkUser.publicMetadata || clerkUser.unsafeMetadata || {};
            const isApproved = meta.approved === true || meta.role === 'approved_practitioner' || meta.status === 'approved';

            if (!isApproved) {
                showPendingView({ type: 'clerk', email: email, user: clerkUser });
                return;
            }

            showMasterOrderView({ type: 'clerk', email: email, user: clerkUser });

            // Prefill all Clinic & Shipping fields from Clerk user metadata
            const contactInput = document.getElementById('order-contact');
            const emailInput = document.getElementById('order-email');
            const phoneInput = document.getElementById('order-phone');
            const clinicInput = document.getElementById('order-clinic');
            const addressInput = document.getElementById('order-address');

            if (contactInput && !contactInput.value) {
                contactInput.value = clerkUser.fullName || '';
            }
            if (emailInput && !emailInput.value) {
                emailInput.value = email;
            }
            if (phoneInput && !phoneInput.value) {
                phoneInput.value = clerkUser.primaryPhoneNumber ? clerkUser.primaryPhoneNumber.phoneNumber : (meta.phone || '');
            }
            if (clinicInput && !clinicInput.value && meta.clinicName) {
                clinicInput.value = meta.clinicName;
            }
            if (addressInput && !addressInput.value && meta.shippingAddress) {
                addressInput.value = meta.shippingAddress;
            }
            return;
        }

        // 2. If no Clerk user, check if practitioner is authenticated via dispensary password
        const localSession = getPractitionerSession();
        if (localSession && localSession.isLoggedIn) {
            showMasterOrderView({ type: 'password', email: localSession.email || 'Verified Practitioner' });
            return;
        }

        // 3. Otherwise, neither is authenticated: show registration / application view
        showApplicationView();
    };

    // Expose globally for Clerk callback
    window.syncPortalAuthState = syncPortalAuthState;

    // Initial check on load (renders instantly from localStorage before Clerk SDK finishes loading)
    if (viewOrder || viewApply) {
        syncPortalAuthState(null);
    }

    // Primary Sign In button: redirects directly to Clerk hosted sign-in on custom domain
    if (btnToggleLogin) {
        btnToggleLogin.addEventListener('click', (e) => {
            e.preventDefault();
            btnToggleLogin.innerHTML = 'Connecting to Secure Sign In...';
            btnToggleLogin.disabled = true;
            // Direct redirect to hosted Clerk portal with seamless return to wholesale portal
            window.location.href = 'https://accounts.smoothbirth.com/sign-in?redirect_url=' + encodeURIComponent(window.location.href);
        });
    }

    // Universal Log Out: clears local session and signs out of Clerk
    const handleLogout = async () => {
        clearPractitionerSession();
        if (window.Clerk && window.Clerk.user) {
            try {
                await window.Clerk.signOut();
            } catch (e) {
                console.warn('Clerk signOut error:', e);
            }
        }
        syncPortalAuthState(null);
        window.scrollTo({ top: 120, behavior: 'smooth' });
    };

    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }
    if (btnPendingLogout) {
        btnPendingLogout.addEventListener('click', handleLogout);
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
                    if (current === min) {
                        current = 0; // Jump down to 0 if at batch minimum
                    } else {
                        current = Math.max(0, current - 1);
                    }
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

            // Validate that every selected formula meets its required batch minimum (8 bottles for 1 oz / 4 bottles for 2 oz)
            const underMinItems = [];
            orderRows.forEach(row => {
                const qtyInput = row.querySelector('.qty-input');
                const qty = parseInt(qtyInput.value, 10) || 0;
                const min = parseInt(row.getAttribute('data-min'), 10) || 0;
                const name = row.querySelector('.item-name-col strong').textContent.trim();
                const size = row.getAttribute('data-size') || '';
                if (qty > 0 && qty < min) {
                    underMinItems.push(`${name} (${size}): ${qty} selected (minimum is ${min} bottles)`);
                }
            });

            if (underMinItems.length > 0) {
                const errorText = 'Batch minimum requirement not met for the following formulas (minimum 8 oz batch):\n\n• ' + underMinItems.join('\n• ');
                if (feedbackBox) {
                    feedbackBox.style.display = 'block';
                    feedbackBox.style.background = '#FFF9EE';
                    feedbackBox.style.border = '1px solid #B86200';
                    feedbackBox.style.color = '#7A4100';
                    feedbackBox.innerHTML = `<strong>Batch Minimum Requirement:</strong> Each formula requires a minimum batch order of 8 oz (8 bottles for 1 oz / 4 bottles for 2 oz). Please adjust the following formulas:<ul style="margin: 0.5rem 0 0 1.25rem; padding: 0;">${underMinItems.map(item => `<li>${item}</li>`).join('')}</ul>`;
                    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                alert(errorText);
                return;
            }

            const clinicName = (document.getElementById('order-clinic')?.value || '').trim();
            const contactName = (document.getElementById('order-contact')?.value || '').trim();
            const contactEmail = (document.getElementById('order-email')?.value || '').trim();
            const contactPhone = (document.getElementById('order-phone')?.value || '').trim();
            const shippingAddress = (document.getElementById('order-address')?.value || '').trim();
            const notes = (document.getElementById('order-notes')?.value || '').trim();

            // Verify Cloudflare Turnstile token if widget is present
            const turnstileResponse = orderForm.querySelector('[name="cf-turnstile-response"]')?.value;
            if (orderForm.querySelector('.cf-turnstile') && !turnstileResponse) {
                alert('Please complete the security check before submitting your order.');
                return;
            }

            submitBtn.textContent = 'Submitting Order Request...';
            submitBtn.disabled = true;

            // Build clean submission payload omitting zero-quantity rows so email is clean
            const payload = new FormData();
            payload.append('form_type', 'Wholesale Master Order');
            if (turnstileResponse) {
                payload.append('cf-turnstile-response', turnstileResponse);
            }
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
                    window.location.href = window.location.pathname.includes('-staging') ? 'thanks-staging.html' : 'thanks.html';
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
                if (window.turnstile) {
                    try { window.turnstile.reset(); } catch (e) {}
                }
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                if (feedbackBox) {
                    feedbackBox.style.display = 'block';
                    feedbackBox.style.background = '#FFF3F3';
                    feedbackBox.style.border = '1px solid #D32F2F';
                    feedbackBox.style.color = '#B71C1C';

                    const mailtoSubject = encodeURIComponent(`Wholesale Order Request - ${clinicName}`);
                    const mailtoBody = encodeURIComponent(`Hello Smooth Birth Team,\n\nHere is our wholesale order request for ${clinicName}:\n\nPrimary Contact: ${contactName}\nPhone: ${contactPhone}\nShipping Address: ${shippingAddress}\n\n${orderSummaryFormatted ? orderSummaryFormatted.value : ''}\n\nSpecial Instructions: ${notes}`);

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
            const regPhone = (document.getElementById('reg-phone')?.value || '').trim();
            const regPassword = (document.getElementById('reg-password')?.value || '').trim();
            const regCredential = (document.getElementById('reg-credential')?.value || '').trim();
            const regWebsite = (document.getElementById('reg-website')?.value || '').trim();
            const regNotes = (document.getElementById('reg-notes')?.value || '').trim();

            // Verify Cloudflare Turnstile token if widget is present
            const turnstileResponse = registerForm.querySelector('[name="cf-turnstile-response"]')?.value;
            if (registerForm.querySelector('.cf-turnstile') && !turnstileResponse) {
                alert('Please complete the security check before submitting your application.');
                return;
            }

            submitBtn.textContent = 'Submitting Application...';
            submitBtn.disabled = true;

            const payload = new FormData(registerForm);
            // Protect user privacy: do not send plaintext password over email via Formspree
            payload.delete('password');
            payload.set('_subject', `New Practitioner Application: ${regName} (${regClinic})`);
            payload.set('_replyto', regEmail);

            // Construct 1-Click Approval Link for Simba's Formspree Notification Email
            const workerEndpoint = window.SMOOTH_BIRTH_CONFIG.approvalWorkerEndpoint;
            const secretToken = window.SMOOTH_BIRTH_CONFIG.approvalSecretToken || 'sb_dispensary_secret_2026';
            if (workerEndpoint) {
                const approveUrl = `${workerEndpoint}?email=${encodeURIComponent(regEmail)}&name=${encodeURIComponent(regName)}&clinic=${encodeURIComponent(regClinic)}&token=${secretToken}`;
                payload.set('1_CLICK_APPROVE_PRACTITIONER', approveUrl);
            }
            payload.set('Clerk_Dashboard_Search', `https://dashboard.clerk.com/last-active?search=${encodeURIComponent(regEmail)}`);

            // Register user in Clerk Backend via Cloudflare Worker (held in pending approval state)
            const clerkRegisterUrl = workerEndpoint ? `${workerEndpoint.replace(/\/approve$/, '')}/register` : null;
            const clerkPromise = clerkRegisterUrl && regEmail && regPassword ? fetch(clerkRegisterUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: regEmail,
                    password: regPassword,
                    name: regName,
                    clinic: regClinic,
                    phone: regPhone,
                    credential: regCredential,
                    website: regWebsite,
                    notes: regNotes
                })
            }).catch(e => console.warn('Worker Clerk registration warning:', e)) : Promise.resolve();

            const targetUrl = window.SMOOTH_BIRTH_CONFIG.formspreeRegEndpoint || registerForm.action;

            Promise.all([
                clerkPromise,
                fetch(targetUrl, {
                    method: 'POST',
                    body: payload,
                    headers: { 'Accept': 'application/json' }
                })
            ])
            .then(([clerkRes, formspreeRes]) => {
                if (formspreeRes.ok) {
                    window.location.href = window.location.pathname.includes('-staging') ? 'thanks-staging.html' : 'thanks.html';
                } else {
                    return formspreeRes.json().then(data => {
                        let errMsg = 'Application submission could not be processed.';
                        if (data && data.errors && data.errors.length > 0) {
                            errMsg = data.errors.map(err => err.message).join(', ');
                        }
                        throw new Error(errMsg);
                    });
                }
            })
            .catch(err => {
                if (window.turnstile) {
                    try { window.turnstile.reset(); } catch (e) {}
                }
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
     * 8. Clerk Authentication Integration (Full BaaS Auth & Prefill)
     * ----------------------------------------------------------- */
    if (window.SMOOTH_BIRTH_CONFIG.clerkPublishableKey) {
        let initRetries = 0;
        const initClerk = async () => {
            let clerk = window.Clerk;
            if (!clerk) {
                // If Clerk SDK is still downloading via script tag, retry shortly (up to 5s)
                initRetries++;
                if (initRetries < 80) {
                    setTimeout(initClerk, 60);
                }
                return;
            }

            try {
                if (typeof clerk === 'function') {
                    window.Clerk = clerk = new clerk(window.SMOOTH_BIRTH_CONFIG.clerkPublishableKey);
                }
                if (typeof clerk.load === 'function' && !clerk.loaded) {
                    await clerk.load({ publishableKey: window.SMOOTH_BIRTH_CONFIG.clerkPublishableKey });
                }

                // Listen to live Clerk state updates (sign in, sign out)
                if (typeof clerk.addListener === 'function') {
                    clerk.addListener(({ user }) => {
                        if (window.syncPortalAuthState) {
                            window.syncPortalAuthState(user);
                        }
                    });
                }

                // Initial sync with Clerk user state
                if (window.syncPortalAuthState) {
                    window.syncPortalAuthState(clerk.user);
                }

                // When order form is submitted, persist updated clinic info to Clerk user metadata
                const orderForm = document.getElementById('wholesale-order-form');
                if (orderForm) {
                    orderForm.addEventListener('submit', () => {
                        if (clerk.user) {
                            const clinicVal = document.getElementById('order-clinic')?.value;
                            const phoneVal = document.getElementById('order-phone')?.value;
                            const addrVal = document.getElementById('order-address')?.value;
                            try {
                                clerk.user.update({
                                    unsafeMetadata: {
                                        clinicName: clinicVal || '',
                                        phone: phoneVal || '',
                                        shippingAddress: addrVal || ''
                                    }
                                });
                            } catch (e) {
                                console.warn('Could not update Clerk metadata:', e);
                            }
                        }
                    });
                }

            } catch (err) {
                console.warn('Clerk initialization notice:', err);
            }
        };

        // Start initialization
        initClerk();
    }

});
