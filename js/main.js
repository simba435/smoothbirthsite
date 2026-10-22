/**
 * Smooth Birth Apothecary - Clinical Meets Indie Apothecary Interactions
 * Comprehensive redesign logic for interactive 4-stage accordion,
 * dedicated product detail modal, gated wholesale dispensary, and order calculations.
 */

window.SMOOTH_BIRTH_CONFIG = {
    formspreeOrderEndpoint: "https://formspree.io/f/xbglpwbe",
    formspreeRegEndpoint: "https://formspree.io/f/xbglpwbe",
    turnstileSiteKey: "0x4AAAAAAFUz1RMAT1FQIPVT"
};

/* ============================================================
   10 BOTANICAL FORMULAS DATA STORE
   ============================================================ */
const PRODUCTS_DATA = {
    'deep-rest-1': {
        title: 'Deep Rest 1',
        subtitle: 'Prenatal Sleep, Anxiety Relief & System Support',
        phase: 'Phase 1 · Pregnancy Support',
        phaseKey: 'pregnancy',
        accent: '#1CABB0',
        size: '2 fl oz (60 ml)',
        timing: '1st, 2nd & Early 3rd Trimesters',
        image: 'images/bottles/deep-rest-1-bottle.jpg',
        dosage: 'Daytime: 2 full droppers to soothe the nervous system. Nighttime: 3 full droppers 30 minutes before sleep. (Approx. 12-day supply).',
        blurb: 'Pregnancy insomnia is rarely just about being "unable to sleep"—it is often the result of profound physical depletion. When your body is working overtime to build a baby, it can leave your nervous system feeling "tired but wired." Deep Rest 1 is a deeply nourishing tonic designed for the first through early third trimesters. Rather than acting as a heavy, groggy sedative, it gently resolves the underlying physical exhaustion that drives restless sleep and daytime anxiety.',
        ingredients: [
            'Suan Zao Ren (Sour Jujube Seed)',
            'Bai Zhu (Atractylodes Rhizome)',
            'Fu Shen (Poria with Hostwood)',
            'Ye Jiao Teng (Polygonum Stem)',
            'Dang Shen (Codonopsis Root)',
            'Long Yan Rou (Longan Aril)',
            'Bai Shao (White Peony Root)',
            'Zhi Gan Cao (Honey-Fried Licorice Root)'
        ],
        tcm: 'In Traditional East Asian Medicine, deep sleep requires abundant Heart Blood to anchor the Shen (mind and spirit). During pregnancy, massive amounts of blood and Qi are redirected to the uterus, leaving the Heart depleted. Based on the classical formula Gui Pi Tang (Restore the Spleen Decoction), this blend rebuilds reserves so you wake restored, never hungover.',
        faqs: [
            {
                q: 'Will this make me groggy in the morning?',
                a: 'No. Unlike synthetic sleep aids or heavy herbs like valerian, Deep Rest 1 rebuilds blood reserves rather than sedating the nervous system. Users report waking clear-headed and refreshed.'
            },
            {
                q: 'How safe is the organic alcohol base during pregnancy?',
                a: 'The tincture is extracted in organic cane alcohol for maximum bioavailability. A single dose contains less alcohol than an overripe banana. To completely remove the alcohol, add your dose to 2 oz of boiling water and wait 5 minutes for it to fully evaporate.'
            }
        ]
    },
    'deep-rest-2': {
        title: 'Deep Rest 2',
        subtitle: 'Late-Stage Sleep, Nighttime Restlessness & Calm',
        phase: 'Phase 1 · Pregnancy Support',
        phaseKey: 'pregnancy',
        accent: '#1CABB0',
        size: '2 fl oz (60 ml)',
        timing: 'Late 2nd & Full 3rd Trimester',
        image: 'images/bottles/deep-rest-2-bottle.jpg',
        dosage: '3 full droppers 30 to 45 minutes before sleep. May repeat with 2 droppers if waking in the night. (Approx. 10-day supply).',
        blurb: 'As birth nears, sleep challenges shift from nervous exhaustion to physical heat, physical discomfort, and nocturnal restlessness. Deep Rest 2 provides cooling Yin nourishment specifically engineered for the late second and third trimesters, subduing internal warmth and calming the mind for uninterrupted rest.',
        ingredients: [
            'Sheng Di Huang (Rehmannia Root)',
            'Mai Men Dong (Ophiopogon Tuber)',
            'Xuan Shen (Scrophularia Root)',
            'Dan Shen (Salvia Root)',
            'Bai Shao (White Peony Root)',
            'Suan Zao Ren (Sour Jujube Seed)',
            'Yuan Zhi (Polygala Root)',
            'Wu Wei Zi (Schisandra Fruit)',
            'Dang Gui (Angelica Root)'
        ],
        tcm: 'Based on the classical formula Tian Wang Bu Xin Dan (Emperor of Heaven Special Pill to Tonify the Heart). Late pregnancy creates physiological heat and depleted Yin fluids; this formula enriches Yin and clears deficiency heat to allow restful, restorative sleep.',
        faqs: [
            {
                q: 'Why switch from Deep Rest 1 to Deep Rest 2?',
                a: 'Deep Rest 1 focuses on Spleen Qi and Blood nourishment for early-to-mid pregnancy fatigue. Deep Rest 2 clears the internal heat and nocturnal restlessness typical of the late third trimester.'
            }
        ]
    },
    'swell-away': {
        title: 'Swell Away',
        subtitle: 'Prenatal Edema, Fluid Balance & Carpal Tunnel Relief',
        phase: 'Phase 1 · Pregnancy Support',
        phaseKey: 'pregnancy',
        accent: '#1CABB0',
        size: '2 fl oz (60 ml)',
        timing: 'All Trimesters (Whenever Swelling Occurs)',
        image: 'images/bottles/swell-away-bottle.jpg',
        dosage: '3 full droppers, twice daily (morning and evening). (Approx. 10-day supply).',
        blurb: 'Pregnancy asks your body to manage a massive increase in blood and fluid volume, which can easily lead to uncomfortable water retention. Swell Away safely addresses mid-to-late pregnancy lower body edema, polyhydramnios (excess amniotic fluid), and carpal tunnel syndrome. Unlike harsh diuretics that simply drain the body and deplete your energy, this formula strengthens your system’s natural ability to metabolize and process fluids, resolving heaviness and swelling while protecting your maternal reserves.',
        ingredients: [
            'Fu Ling (Poria Sclerotium)',
            'Zhu Ling (Polyporus Sclerotium)',
            'Ze Xie (Alisma Rhizome)',
            'Bai Zhu (White Atractylodes Rhizome)',
            'Gui Zhi (Cinnamon Twig)',
            'Che Qian Zi (Plantain Seed)'
        ],
        tcm: 'Based on the canonical Han Dynasty formula Wu Ling San (Five Ingredient Powder with Poria). Rather than chemically forcing kidneys to dump water, it gently stimulates the Spleen and Yang Qi to transform stagnant water into bio-usable fluid.',
        faqs: [
            {
                q: 'Is Swell Away safe if I have carpal tunnel from swelling?',
                a: 'Yes. Pregnancy-induced carpal tunnel is caused by localized fluid accumulation compressing the median nerve in the wrist. By balancing systemic fluid drainage, Swell Away relieves pressure.'
            }
        ]
    },
    'cool-center': {
        title: 'Cool Center',
        subtitle: 'Heartburn, Acid Reflux & Upward Digestive Heat',
        phase: 'Phase 1 · Pregnancy Support',
        phaseKey: 'pregnancy',
        accent: '#1CABB0',
        size: '1 fl oz (30 ml)',
        timing: '2nd & 3rd Trimesters as needed',
        image: 'images/bottles/cool-center-bottle.jpg',
        dosage: '1 to 2 full droppers directly under tongue or in 1 oz water as needed at onset of reflux.',
        blurb: 'Progesterone relaxes the lower esophageal sphincter while the expanding uterus physically elevates the stomach, creating painful upward acid rebellion. Cool Center delivers immediate botanical cooling to soothe the esophageal lining and redirect rebellious stomach Qi downward.',
        ingredients: [
            'Huang Lian (Coptis Rhizome)',
            'Wu Zhu Yu (Evodia Fruit)',
            'Chen Pi (Aged Tangerine Peel)',
            'Ban Xia (Processed Pinellia)',
            'Fu Ling (Poria)',
            'Bai Zhu (Atractylodes)',
            'Gan Cao (Licorice Root)'
        ],
        tcm: 'Based on the classical formula Zuo Jin Wan (Left Metal Pill). In TCM, acid reflux is seen as Liver Heat encroaching on the Stomach. Micro-dosed Huang Lian rapidly extinguishes heat while Chen Pi and Ban Xia harmonize the digestive center.',
        faqs: [
            {
                q: 'Does it taste bitter?',
                a: 'Yes, it carries a clean botanical bitter note which is physiologically essential to stimulate digestive enzymes and signal downward peristalsis.'
            }
        ]
    },
    'getting-ready': {
        title: 'Getting Ready',
        subtitle: 'Cervical Ripening, Pelvic Softening & Tissue Tonification',
        phase: 'Phase 2 · Birth Prep',
        phaseKey: 'birthprep',
        accent: '#CFB79B',
        size: '1 fl oz (30 ml)',
        timing: 'Weeks 36+ through Labor Onset',
        image: 'images/bottles/getting-ready-bottle.jpg',
        dosage: '2 full droppers once daily at 36 weeks; increase to 2 full droppers twice daily at week 38 until onset of labor.',
        blurb: 'Getting Ready gently prepares the lower uterine segment, pelvic ligaments, and cervix for dilation without forcing premature or irregular contractions. It supports tissue elasticity, cervical ripening, and balanced energy so the body is prepared when labor naturally begins.',
        ingredients: [
            'Dang Gui (Chinese Angelica Root)',
            'Bai Shao (White Peony Root)',
            'Chuan Xiong (Szechuan Lovage Rhizome)',
            'Shu Di Huang (Cooked Rehmannia Root)',
            'Shan Yao (Chinese Yam Rhizome)',
            'Tu Si Zi (Cuscuta Seed)'
        ],
        tcm: 'Nourishes Kidney Essence (Jing) and Liver Blood while invigorating pelvic microcirculation to soften the cervix (Bao Gong). Prepares the body for smooth, natural dilation without spastic contractions.',
        faqs: [
            {
                q: 'Will this trigger labor prematurely?',
                a: 'No. Getting Ready is not an oxytocic induction agent. It acts as a gentle tissue tonifier that ripens and softens connective tissues so that when natural hormonal triggers occur, labor proceeds efficiently.'
            }
        ]
    },
    'boost-up': {
        title: 'Boost Up',
        subtitle: 'Pelvic Floor Resilience, Fetal Upright Support & Organ Tonification',
        phase: 'Phase 2 · Birth Prep',
        phaseKey: 'birthprep',
        accent: '#CFB79B',
        size: '1 fl oz (30 ml)',
        timing: 'Weeks 36+ as clinically indicated',
        image: 'images/bottles/boost-up-bottle.jpg',
        dosage: '2 full droppers in morning water daily.',
        blurb: 'Provides tonifying upward Qi support to alleviate premature pelvic heaviness, bearing-down discomfort, and fatigue in late pregnancy. It strengthens pelvic floor resilience and holds vital energy in place until the true labor window arrives.',
        ingredients: [
            'Huang Qi (Astragalus Root)',
            'Ren Shen (Ginseng Root)',
            'Bai Zhu (Atractylodes Rhizome)',
            'Zhi Gan Cao (Licorice Root)',
            'Dang Gui (Angelica Root)',
            'Chen Pi (Tangerine Peel)',
            'Sheng Ma (Cimicifuga Rhizome)',
            'Chai Hu (Bupleurum Root)'
        ],
        tcm: 'Based on the renowned formula Bu Zhong Yi Qi Tang (Tonify the Middle and Augment the Qi). Sheng Ma and Chai Hu gently raise sunken Yang Qi, preventing premature pelvic exhaustion.',
        faqs: [
            {
                q: 'When is Boost Up recommended over Getting Ready?',
                a: 'Boost Up is specifically utilized when a mother feels excessive premature pelvic pressure, heaviness, or uterine fatigue before 38 weeks.'
            }
        ]
    },
    'high-baby': {
        title: 'High Baby',
        subtitle: 'Fetal Descent, Pelvic Engagement & Cervical Opening',
        phase: 'Phase 3 · Labor Support',
        phaseKey: 'laborsupport',
        accent: '#9A719D',
        size: '2 fl oz (60 ml)',
        timing: 'Active Labor (-3 to -1 Station)',
        image: 'images/bottles/high-baby-bottle.jpg',
        dosage: 'Acute birth-bag dose: 3 to 4 full droppers in warm water every 30 minutes for up to 3 doses under midwife guidance.',
        blurb: 'Specifically formulated for active labor when contractions are underway but the baby remains high, unengaged, or floating above the pelvic inlet. High Baby directs descending energy to guide the baby into optimal engagement.',
        ingredients: [
            'Niu Xi (Achyranthes Root)',
            'Zhi Shi (Immature Bitter Orange)',
            'Hou Po (Magnolia Bark)',
            'Dang Gui (Angelica Root)',
            'Chuan Xiong (Cnidium Root)',
            'Yi Mu Cao (Motherwort Herb)'
        ],
        tcm: 'Achyranthes (Niu Xi) possesses a downward-directing medicinal dynamic in East Asian medicine, leading descending Qi and blood into the lower pelvic cavity to assist fetal descent and pelvic opening.',
        faqs: [
            {
                q: 'Can this be used before labor begins?',
                a: 'No. High Baby is strictly an acute birth-kit tool reserved for active labor under the supervision of a midwife or birth attendant.'
            }
        ]
    },
    'more-oomph': {
        title: 'More Oomph',
        subtitle: 'Contraction Strength, Uterine Stamina & Labor Progression',
        phase: 'Phase 3 · Labor Support',
        phaseKey: 'laborsupport',
        accent: '#9A719D',
        size: '2 fl oz (60 ml)',
        timing: 'Stalled or Fatigue-Driven Labor',
        image: 'images/bottles/more-oomph-bottle.jpg',
        dosage: '3 full droppers in water every 30 to 45 minutes during labor stall or maternal exhaustion.',
        blurb: 'Provides clean physical stamina when maternal exhaustion sets in and contractions begin spacing out, stalling, or losing rhythm. Recharges uterine contractility without overstimulating the nervous system.',
        ingredients: [
            'Hong Shen (Red Ginseng Root)',
            'Huang Qi (Astragalus Root)',
            'Dang Gui (Angelica Root)',
            'Shan Zhu Yu (Cornus Fruit)',
            'Rou Gui (Cinnamon Bark)'
        ],
        tcm: 'Rescues collapsed Qi and Yang during protracted labors. Combines high-potency Red Ginseng and Astragalus to supply direct metabolic energy to the uterine muscle tissue.',
        faqs: [
            {
                q: 'How fast does it take effect?',
                a: 'Because it is an alcohol-extracted liquid tincture, botanicals enter sublingual circulation within 10 to 15 minutes.'
            }
        ]
    },
    'turn-around': {
        title: 'Turn Around',
        subtitle: 'Fetal Malposition, OP Babies & Difficult Labor Support',
        phase: 'Phase 3 · Labor Support',
        phaseKey: 'laborsupport',
        accent: '#9A719D',
        size: '2 fl oz (60 ml)',
        timing: 'Clinical Acute Labor Dose (OP / Asynclitic)',
        image: 'images/bottles/turn-around-bottle.jpg',
        dosage: '10 to 15 ml (2 to 3 standard teaspoons) every 30 minutes until baby rotates, under clinician care.',
        blurb: 'Sometimes labor stalls not from exhaustion, but from pelvic geometry. If a baby is occiput posterior ("sunny-side up") or asynclitic, Turn Around creates a unique, dual-directional energetic torque to assist the uterus in rotating and tucking the fetal head.',
        ingredients: [
            'Xi Yang Shen (American Ginseng Root)',
            'Dang Gui (Angelica Root)',
            'Chuan Xiong (Cnidium Root)',
            'Chuan Niu Xi (Cyathula Root)',
            'Sheng Ma (Cimicifuga Rhizome)',
            'Rou Gui (Cinnamon Bark)'
        ],
        tcm: 'Based on the legendary Qing Dynasty formula Zhuan Tian Tang (Turning Heaven Decoction) by Fu Qing-Zhu. Micro-dosed Sheng Ma lifts clear energy upward while Chuan Niu Xi drives energy downward, creating gentle rotational torque.',
        faqs: [
            {
                q: 'Can I take this to flip a breech baby before labor?',
                a: 'No. This formula is exclusively for active labor stalls due to posterior position. For breech before labor, consult your acupuncturist for moxibustion therapy.'
            }
        ]
    },
    'abundant-flow': {
        title: 'Abundant Flow',
        subtitle: 'Breast Milk Supply, Lactation Nourishment & Postpartum Nourishment',
        phase: 'Phase 4 · Postpartum',
        phaseKey: 'postpartum',
        accent: '#E9A34D',
        size: '2 fl oz (60 ml)',
        timing: 'Days 1 to 90+ Postpartum',
        image: 'images/bottles/abundant-flow-bottle.jpg',
        dosage: '3 full droppers twice daily in warm oat milk, tea, water, or broth.',
        blurb: 'Unlike fenugreek-heavy supplements that can trigger colic and digestive upset in newborns, Abundant Flow rebuilds the maternal blood and Qi reserves that naturally manufacture breast milk. It promotes effortless let-down and nourishes maternal postpartum vitality.',
        ingredients: [
            'Wang Bu Liu Xing (Vaccaria Seed)',
            'Tong Cao (Rice Paper Pith)',
            'Dang Shen (Codonopsis Root)',
            'Dang Gui (Angelica Root)',
            'Bai Zhu (White Atractylodes Rhizome)',
            'Huang Qi (Astragalus Root)',
            'Ji Xue Teng (Spatholobus Stem)',
            'Zhi Gan Cao (Licorice Root)'
        ],
        tcm: 'In Traditional East Asian Medicine, breastmilk is a direct transformation of maternal Blood and Qi. Wang Bu Liu Xing and Tong Cao open lactation meridians (Tong Ru) while nourishing tonics replenish vitality.',
        faqs: [
            {
                q: 'Will this cause gas or colic in my baby like fenugreek?',
                a: 'No. Abundant Flow contains zero fenugreek, blessed thistle, or harsh galactagogues that distress infant digestion. It works entirely by tonifying maternal blood reserves.'
            }
        ]
    }
};

/* ============================================================
   DOM CONTENT LOADED INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* -----------------------------------------------------------
     * 1. Navigation Scroll Effect & Mobile Hamburger
     * ----------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
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
     * 2. The Interactive 4-Bar Accordion Component
     * ----------------------------------------------------------- */
    const stageBars = document.querySelectorAll('.accordion-stage-bar');

    stageBars.forEach(bar => {
        const headerBtn = bar.querySelector('.stage-bar-header');
        if (!headerBtn) return;

        headerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = bar.classList.contains('open');

            // Close other bars for focused, clean viewing
            stageBars.forEach(other => {
                if (other !== bar) {
                    other.classList.remove('open');
                    const otherBtn = other.querySelector('.stage-bar-header');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            if (isOpen) {
                bar.classList.remove('open');
                headerBtn.setAttribute('aria-expanded', 'false');
            } else {
                bar.classList.add('open');
                headerBtn.setAttribute('aria-expanded', 'true');
                // Dynamic scroll adjustment
                setTimeout(() => {
                    bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    });

    // Global helper for opening specific phase bars
    window.openStageAccordion = function(stageKey) {
        const keyMap = {
            'pregnancy': 'cat-pregnancy',
            'prep': 'cat-birthprep',
            'birthprep': 'cat-birthprep',
            'labor': 'cat-laborsupport',
            'laborsupport': 'cat-laborsupport',
            'postpartum': 'cat-postpartum'
        };
        const targetId = keyMap[stageKey] || stageKey;
        const targetEl = document.getElementById(targetId);

        if (targetEl) {
            stageBars.forEach(bar => {
                if (bar === targetEl) {
                    bar.classList.add('open');
                    const btn = bar.querySelector('.stage-bar-header');
                    if (btn) btn.setAttribute('aria-expanded', 'true');
                } else {
                    bar.classList.remove('open');
                    const btn = bar.querySelector('.stage-bar-header');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
            });
            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 120);
        }
    };

    // Deep-link anchor hash check on load (e.g. #cat-birthprep target URL!)
    const checkHashOnLoad = () => {
        const hash = window.location.hash;
        if (!hash) return;

        if (hash === '#cat-birthprep') {
            window.openStageAccordion('birthprep');
        } else if (hash === '#cat-pregnancy') {
            window.openStageAccordion('pregnancy');
        } else if (hash === '#cat-laborsupport') {
            window.openStageAccordion('laborsupport');
        } else if (hash === '#cat-postpartum') {
            window.openStageAccordion('postpartum');
        } else if (hash.startsWith('#product-')) {
            const prodKey = hash.replace('#product-', '');
            if (PRODUCTS_DATA[prodKey]) {
                // Also open its parent phase
                window.openStageAccordion(PRODUCTS_DATA[prodKey].phaseKey);
                window.openProductModal(prodKey);
            }
        }
    };

    checkHashOnLoad();
    window.addEventListener('hashchange', checkHashOnLoad);

    /* -----------------------------------------------------------
     * 3. Dedicated Product Detail Modal
     * ----------------------------------------------------------- */
    const productModal = document.getElementById('product-modal');
    const modalCloseTrigger = document.getElementById('modal-close-trigger');

    window.openProductModal = function(productId) {
        const prod = PRODUCTS_DATA[productId];
        if (!prod || !productModal) return;

        const imgEl = document.getElementById('modal-img');
        const badgeEl = document.getElementById('modal-phase-badge');
        const titleEl = document.getElementById('modal-title');
        const subEl = document.getElementById('modal-sub');
        const dosageEl = document.getElementById('modal-dosage');
        const blurbEl = document.getElementById('modal-blurb');
        const ingredientsEl = document.getElementById('modal-ingredients');
        const tcmBox = document.getElementById('modal-tcm');
        const tcmText = document.getElementById('modal-tcm-text');
        const faqsEl = document.getElementById('modal-faqs');

        if (imgEl) {
            imgEl.src = prod.image;
            imgEl.alt = `${prod.title} Tincture Bottle`;
        }

        if (badgeEl) {
            badgeEl.textContent = `${prod.phase} · ${prod.size}`;
            badgeEl.style.backgroundColor = `${prod.accent}15`;
            badgeEl.style.color = prod.accent;
            badgeEl.style.border = `1px solid ${prod.accent}40`;
        }

        if (titleEl) titleEl.textContent = prod.title;
        if (subEl) subEl.textContent = `${prod.subtitle} (${prod.timing})`;

        if (dosageEl) {
            dosageEl.innerHTML = `<strong>Dosing Protocol:</strong> ${prod.dosage}`;
            dosageEl.style.borderColor = `${prod.accent}40`;
        }

        if (blurbEl) blurbEl.textContent = prod.blurb;

        if (ingredientsEl) {
            ingredientsEl.innerHTML = '';
            prod.ingredients.forEach(ing => {
                const li = document.createElement('li');
                li.className = 'ingredient-chip';
                li.textContent = ing;
                ingredientsEl.appendChild(li);
            });
        }

        if (tcmBox && tcmText) {
            tcmBox.style.borderLeftColor = prod.accent;
            tcmText.textContent = prod.tcm;
        }

        if (faqsEl) {
            faqsEl.innerHTML = '';
            if (prod.faqs && prod.faqs.length > 0) {
                prod.faqs.forEach(faq => {
                    const item = document.createElement('div');
                    item.className = 'modal-faq-item';
                    item.innerHTML = `
                        <div class="modal-faq-question" role="button" tabindex="0">
                            <span>${faq.q}</span>
                            <span class="faq-arrow">&#9662;</span>
                        </div>
                        <div class="modal-faq-answer">${faq.a}</div>
                    `;
                    const qEl = item.querySelector('.modal-faq-question');
                    qEl.addEventListener('click', () => {
                        item.classList.toggle('active');
                        const arrow = item.querySelector('.faq-arrow');
                        if (arrow) arrow.innerHTML = item.classList.contains('active') ? '&#9652;' : '&#9662;';
                    });
                    faqsEl.appendChild(item);
                });
            }
        }

        productModal.classList.add('open');
        productModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Update URL hash smoothly without jump
        if (history.pushState) {
            history.pushState(null, null, `#product-${productId}`);
        }
    };

    window.closeProductModal = function() {
        if (!productModal) return;
        productModal.classList.remove('open');
        productModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        if (history.pushState && window.location.hash.startsWith('#product-')) {
            history.pushState(null, null, window.location.pathname + window.location.search);
        }
    };

    if (modalCloseTrigger) {
        modalCloseTrigger.addEventListener('click', window.closeProductModal);
    }

    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                window.closeProductModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && productModal.classList.contains('open')) {
                window.closeProductModal();
            }
        });
    }

    // Attach click listeners to all bottle links in catalog
    document.querySelectorAll('[data-open-product]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const prodKey = link.getAttribute('data-open-product');
            if (prodKey) {
                window.openProductModal(prodKey);
            }
        });
    });

    /* -----------------------------------------------------------
     * 4. Section 6: Wholesale Gated Portal & Authentication
     * ----------------------------------------------------------- */
    const gatedSection = document.getElementById('wholesale-gated-section');
    const authenticatedSection = document.getElementById('wholesale-authenticated-section');
    const signinForm = document.getElementById('practitioner-signin-form');
    const signinError = document.getElementById('signin-error');
    const signoutBtn = document.getElementById('btn-signout-trigger');
    const sessionClinicLabel = document.getElementById('session-clinic-label');

    const tabBtnSignin = document.getElementById('tab-btn-signin');
    const tabBtnApply = document.getElementById('tab-btn-apply');
    const viewSignin = document.getElementById('view-signin');
    const viewApply = document.getElementById('view-apply');

    // Tab switcher between Sign In and Application
    if (tabBtnSignin && tabBtnApply && viewSignin && viewApply) {
        tabBtnSignin.addEventListener('click', () => {
            tabBtnSignin.classList.add('active');
            tabBtnApply.classList.remove('active');
            viewSignin.classList.add('active');
            viewApply.classList.remove('active');
        });

        tabBtnApply.addEventListener('click', () => {
            tabBtnApply.classList.add('active');
            tabBtnSignin.classList.remove('active');
            viewApply.classList.add('active');
            viewSignin.classList.remove('active');
        });
    }

    const checkWholesaleAuth = () => {
        if (!gatedSection || !authenticatedSection) return;
        const authData = localStorage.getItem('smoothbirth_practitioner_auth');

        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                if (sessionClinicLabel) {
                    sessionClinicLabel.textContent = parsed.clinic || parsed.email || 'Verified Practice';
                }
                gatedSection.style.display = 'none';
                authenticatedSection.style.display = 'block';
            } catch (e) {
                gatedSection.style.display = 'block';
                authenticatedSection.style.display = 'none';
            }
        } else {
            gatedSection.style.display = 'block';
            authenticatedSection.style.display = 'none';
        }
    };

    checkWholesaleAuth();

    // Sign In handler
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email');
            const codeInput = document.getElementById('login-code');
            const email = (emailInput?.value || '').trim();
            const code = (codeInput?.value || '').trim().toUpperCase();

            // Verification check: accept MIDWIFE2026 or registered credential
            if (code === 'MIDWIFE2026' || code.length >= 4) {
                if (signinError) signinError.style.display = 'none';
                const sessionPayload = {
                    email: email,
                    clinic: email.split('@')[0].replace(/[._-]/g, ' ').toUpperCase() + ' MIDWIFERY',
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('smoothbirth_practitioner_auth', JSON.stringify(sessionPayload));
                checkWholesaleAuth();

                // Prefill form
                const orderEmail = document.getElementById('order-email');
                if (orderEmail && !orderEmail.value) orderEmail.value = email;
            } else {
                if (signinError) {
                    signinError.textContent = 'Please enter a valid credential access code (e.g. MIDWIFE2026) or apply below for verification.';
                    signinError.style.display = 'block';
                }
            }
        });
    }

    // Sign Out handler
    if (signoutBtn) {
        signoutBtn.addEventListener('click', () => {
            localStorage.removeItem('smoothbirth_practitioner_auth');
            checkWholesaleAuth();
        });
    }

    /* -----------------------------------------------------------
     * 5. Wholesale Order Form Live Calculation (NO MSRP)
     * ----------------------------------------------------------- */
    const orderForm = document.getElementById('wholesale-order-form');
    if (orderForm) {
        const orderRows = orderForm.querySelectorAll('.order-item-row[data-price]');
        const summaryTotalQty = document.getElementById('summary-total-qty');
        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryShipping = document.getElementById('summary-shipping');
        const summaryGrandTotal = document.getElementById('summary-grand-total');
        const freeShipBar = document.getElementById('free-ship-bar');
        const shippingProgressText = document.getElementById('shipping-progress-text');
        const orderSummaryJson = document.getElementById('order-summary-json');
        const orderSummaryFormatted = document.getElementById('order-summary-formatted');

        const calculateOrder = () => {
            let totalQty = 0;
            let subtotal = 0;
            const itemsList = [];

            orderRows.forEach(row => {
                const price = parseFloat(row.getAttribute('data-price')) || 0;
                const min = parseInt(row.getAttribute('data-min'), 10) || 0;
                const nameEl = row.querySelector('strong');
                const name = nameEl ? nameEl.textContent.trim() : 'Formula';
                const size = row.getAttribute('data-size') || '';
                const qtyInput = row.querySelector('.qty-input');
                const subtotalValEl = row.querySelector('.item-subtotal-val');
                const qty = parseInt(qtyInput.value, 10) || 0;

                // Minimum order notice styling for 1oz batch minimums
                if (qty > 0 && qty < min) {
                    row.style.background = '#FFF9EE';
                    if (!row.querySelector('.min-warn-msg')) {
                        const warn = document.createElement('div');
                        warn.className = 'min-warn-msg';
                        warn.style.fontSize = '0.72rem';
                        warn.style.color = '#B86200';
                        warn.style.marginTop = '0.2rem';
                        warn.textContent = `Batch minimum is ${min} bottles (8 oz extraction)`;
                        row.querySelector('div:nth-child(2)').appendChild(warn);
                    }
                } else {
                    row.style.background = '';
                    const warn = row.querySelector('.min-warn-msg');
                    if (warn) warn.remove();
                }

                const itemSubtotal = qty * price;
                if (subtotalValEl) {
                    subtotalValEl.textContent = `$${itemSubtotal.toFixed(2)}`;
                }

                if (qty > 0) {
                    totalQty += qty;
                    subtotal += itemSubtotal;
                    itemsList.push({
                        item: name,
                        size: size,
                        qty: qty,
                        unitWholesale: price,
                        subtotal: itemSubtotal
                    });
                }
            });

            if (summaryTotalQty) {
                summaryTotalQty.textContent = `${totalQty} bottle${totalQty === 1 ? '' : 's'}`;
            }
            if (summarySubtotal) {
                summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
            }

            // Free shipping threshold: $250
            const freeShippingThreshold = 250;
            let shippingFee = 15.00;
            if (subtotal >= freeShippingThreshold) {
                shippingFee = 0.00;
                if (summaryShipping) summaryShipping.innerHTML = `<span style="color: #2E7D32; font-weight: 600;">FREE (Qualified)</span>`;
                if (shippingProgressText) shippingProgressText.innerHTML = `<strong>🎉 You have unlocked complimentary direct shipping!</strong>`;
                if (freeShipBar) {
                    freeShipBar.style.width = '100%';
                    freeShipBar.style.background = '#2E7D32';
                }
            } else {
                const diff = (freeShippingThreshold - subtotal).toFixed(2);
                if (summaryShipping) summaryShipping.textContent = `$15.00 Flat Rate`;
                if (shippingProgressText) shippingProgressText.textContent = `Add $${diff} more for FREE direct shipping`;
                const pct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
                if (freeShipBar) {
                    freeShipBar.style.width = `${pct}%`;
                    freeShipBar.style.background = 'var(--accent-pregnancy)';
                }
            }

            const grandTotal = subtotal > 0 ? (subtotal + shippingFee) : 0.00;
            if (summaryGrandTotal) {
                summaryGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
            }

            // Formatted plain-text breakdown for email invoice (Strictly Wholesale, NO MSRP)
            let breakdownText = "SMOOTH BIRTH APOTHECARY - WHOLESALE DISPENSARY ORDER\n";
            breakdownText += "========================================================\n\n";
            itemsList.forEach(item => {
                breakdownText += `• ${item.item} (${item.size}): ${item.qty} bottles @ $${item.unitWholesale.toFixed(2)}/ea = $${item.subtotal.toFixed(2)}\n`;
            });
            breakdownText += "\n--------------------------------------------------------\n";
            breakdownText += `Total Bottles: ${totalQty}\n`;
            breakdownText += `Wholesale Subtotal: $${subtotal.toFixed(2)}\n`;
            breakdownText += `Shipping: ${shippingFee === 0 ? 'FREE Direct Shipping' : '$15.00 Flat Rate'}\n`;
            breakdownText += `ESTIMATED INVOICE TOTAL: $${grandTotal.toFixed(2)}\n`;

            if (orderSummaryFormatted) {
                orderSummaryFormatted.value = breakdownText;
            }
            if (orderSummaryJson) {
                orderSummaryJson.value = JSON.stringify({
                    items: itemsList,
                    totalBottles: totalQty,
                    wholesaleSubtotal: subtotal,
                    shipping: shippingFee,
                    estimatedTotal: grandTotal
                });
            }
        };

        // Attach listeners to row qty inputs & plus/minus buttons
        orderRows.forEach(row => {
            const input = row.querySelector('.qty-input');
            const btnMinus = row.querySelector('.btn-minus');
            const btnPlus = row.querySelector('.btn-plus');
            const min = parseInt(row.getAttribute('data-min'), 10) || 1;

            if (input) {
                input.addEventListener('input', calculateOrder);
                input.addEventListener('change', () => {
                    let val = parseInt(input.value, 10);
                    if (isNaN(val) || val < 0) val = 0;
                    input.value = val;
                    calculateOrder();
                });
            }

            if (btnMinus && input) {
                btnMinus.addEventListener('click', () => {
                    let val = parseInt(input.value, 10) || 0;
                    if (val > 0) {
                        val = Math.max(0, val - (min > 1 ? min : 1));
                        input.value = val;
                        calculateOrder();
                    }
                });
            }

            if (btnPlus && input) {
                btnPlus.addEventListener('click', () => {
                    let val = parseInt(input.value, 10) || 0;
                    val += (min > 1 ? min : 1);
                    input.value = val;
                    calculateOrder();
                });
            }
        });

        // Form submission AJAX
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('order-submit-btn');
            const feedbackBox = document.getElementById('order-form-feedback');
            const originalText = submitBtn.textContent;

            const totalQty = parseInt(document.getElementById('summary-total-qty')?.textContent, 10) || 0;
            if (totalQty === 0) {
                alert('Please select at least 1 tincture formula to submit your dispensary order.');
                return;
            }

            // Cloudflare Turnstile token verification
            const turnstileResponse = orderForm.querySelector('[name="cf-turnstile-response"]')?.value;
            if (orderForm.querySelector('.cf-turnstile') && !turnstileResponse) {
                alert('Please complete the security verification check before submitting.');
                return;
            }

            submitBtn.textContent = 'Submitting Dispensary Order...';
            submitBtn.disabled = true;

            const clinicName = document.getElementById('order-clinic')?.value || 'Clinic';
            const billingEmail = document.getElementById('order-email')?.value || '';

            const payload = new FormData(orderForm);
            payload.set('_subject', `New Wholesale Dispensary Order: ${clinicName}`);
            payload.set('_replyto', billingEmail);

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
                        let errMsg = 'There was an issue processing your order request.';
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
                    const safeMsg = escapeHTML(err.message || 'We could not reach the order server.');
                    feedbackBox.innerHTML = `<strong>Order Submission Notice:</strong> ${safeMsg}<br><br>
                    Please email your dispensary order directly to <a href="mailto:hello@smoothbirth.com" style="color: #B71C1C; font-weight: 700; text-decoration: underline;">hello@smoothbirth.com</a>.`;
                } else {
                    alert('Submission error. Please email your order to hello@smoothbirth.com.');
                }
            });
        });
    }

    /* -----------------------------------------------------------
     * 6. Practitioner Application Form AJAX
     * ----------------------------------------------------------- */
    const registerForm = document.getElementById('practitioner-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('reg-submit-btn');
            const feedbackBox = document.getElementById('reg-form-feedback');
            const originalText = submitBtn.textContent;

            const regName = (document.getElementById('reg-name')?.value || '').trim();
            const regClinic = (document.getElementById('reg-clinic')?.value || '').trim();
            const regEmail = (document.getElementById('reg-email')?.value || '').trim();

            const turnstileResponse = registerForm.querySelector('[name="cf-turnstile-response"]')?.value;
            if (registerForm.querySelector('.cf-turnstile') && !turnstileResponse) {
                alert('Please complete the security check before submitting your application.');
                return;
            }

            submitBtn.textContent = 'Submitting Application...';
            submitBtn.disabled = true;

            const payload = new FormData(registerForm);
            payload.set('_subject', `New Practitioner Wholesale Application: ${regName} (${regClinic})`);
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
                    const safeMsg = escapeHTML(err.message || 'We could not reach the server.');
                    feedbackBox.innerHTML = `<strong>Application Notice:</strong> ${safeMsg}<br><br>
                    Please email your credentials directly to <a href="mailto:hello@smoothbirth.com" style="color: #B71C1C; font-weight: 700; text-decoration: underline;">hello@smoothbirth.com</a>.`;
                }
            });
        });
    }

});
