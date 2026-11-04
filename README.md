# Smooth Birth Apothecary Website & Wholesale Portal

A clinical, patient-friendly frontend and dedicated B2B Practitioner Wholesale Portal for **Smooth Birth Apothecary** (`smoothbirth.com`), founded by Simba Eun-Hye Shim, L.Ac.

Hosted on **GitHub Pages** with DNS and CDN managed via **Cloudflare**.

---

## 🌿 Project Structure

```
smoothbirthsite/
├── index.html              # Public homepage (Hero, Formula Accordions, Meet Founder, FAQ, FDA Disclaimer)
├── index-staging.html      # Staging duplicate of index.html
├── wholesale.html          # B2B Portal (Live Wholesale Order Calculator, Free Shipping Meter, Registration Form)
├── wholesale-staging.html  # Staging duplicate of wholesale.html
├── thanks.html             # Submission confirmation page
├── thanks-staging.html     # Staging duplicate of thanks.html
├── privacy.html            # Healthcare & B2B Privacy Policy
├── privacy-staging.html    # Staging duplicate of privacy.html
├── terms.html              # Terms of Service & FDA Regulatory Notices
├── terms-staging.html      # Staging duplicate of terms.html
├── promote-staging.sh      # Helper script to promote staging changes to production
├── CNAME                   # Custom domain pointer: smoothbirth.com
├── robots.txt              # Search engine crawling rules (blocks staging indexing)
├── sitemap.xml             # XML sitemap for SEO
├── llms.txt                # AI search & LLM indexing manifest
├── css/
│   └── style.css           # Custom responsive styles (Sage Green & Warm Gold palette, Fraunces/Inter typography)
├── js/
│   └── main.js             # Formula drawers, accordion logic, batch order math, Formspree & Clerk hooks
└── images/
    ├── favicon.png         # Site favicon
    ├── simba-headshot.webp # Founder headshot
    ├── bottles-prenatal.jpg# Studio bottle showcase
    ├── bottles-labor.jpg   # Studio bottle showcase
    └── products/           # 10 label banners and extracted badge crops
```

---

## 🛠 Features & Formulas

### 1. Educational Public Frontend (`index.html`)
- **No Direct Retail Cart / Public Pricing**: Protects practitioner dispensing boundaries.
- **4 Stage Accordions**:
  1. *Pregnancy Support*: Swell Away (2 oz), Deep Rest 1 (2 oz), Deep Rest 2 (2 oz), Cool Center (1 oz)
  2. *Birth Prep*: Getting Ready (1 oz), Boost Up (1 oz)
  3. *Labor Support*: More Oomph (2 oz), High Baby (2 oz), Turn Around (2 oz)
  4. *Postpartum Recovery*: Abundant Flow (2 oz)
- **Deep Formula Drawers**: Indications, dosage, full ingredient lists, TCM actions, precautions, and verified FAQ.
- **Compliance**: Verbatim FDA disclaimer on all footers and compliance pages.

### 2. B2B Practitioner Wholesale Portal (`wholesale.html`)
- **Batch Minimum Orders**:
  - 1 oz bottles: \$11.00 wholesale / \$22.00 MSRP (Minimum 8 bottles per formula)
  - 2 oz bottles: \$20.00 wholesale / \$36.00 MSRP (Minimum 4 bottles per formula)
- **Dynamic Pricing Calculator**: Live wholesale subtotal, estimated retail MSRP value, practitioner profit margin calculator, and a free shipping progress bar (\$250 threshold, \$15 flat rate otherwise).
- **Manual Invoicing Workflow**: Orders submitted via Formspree generate an itemized invoice sent via Square or QuickBooks, fulfilled directly through our authorized manufacturing partner.
- **Practitioner Credential Verification**: Embedded application form collecting clinical license #, NPI, and doula certifications.
- **Clerk Authentication Ready**: Built-in hook in `js/main.js` for instant SSO / gated access when desired.

---

## 🌐 Cloudflare DNS Setup

In your [Cloudflare Dashboard](https://dash.cloudflare.com/):

### 1. Apex Domain (`smoothbirth.com`)
Add either **CNAME** flattening (recommended on Cloudflare) or **A records**:

**Option A (CNAME Flattening):**
- **Type**: `CNAME`
- **Name**: `@` (or `smoothbirth.com`)
- **Target**: `simba435.github.io`
- **Proxy Status**: *DNS Only* (Grey Cloud) during initial setup, then switch to *Proxied* (Orange Cloud)

**Option B (GitHub IP A Records):**
- **Type**: `A` | **Name**: `@` | **IP**: `185.199.108.153`
- **Type**: `A` | **Name**: `@` | **IP**: `185.199.109.153`
- **Type**: `A` | **Name**: `@` | **IP**: `185.199.110.153`
- **Type**: `A` | **Name**: `@` | **IP**: `185.199.111.153`

### 2. Subdomain (`www.smoothbirth.com`)
- **Type**: `CNAME`
- **Name**: `www`
- **Target**: `simba435.github.io` (or `smoothbirth.com`)
- **Proxy Status**: *DNS Only* initially, then *Proxied*

### 3. Cloudflare SSL/TLS Settings
- Navigate to **SSL/TLS** in Cloudflare.
- Set encryption mode to **Full** or **Full (strict)** to ensure end-to-end HTTPS between Cloudflare and GitHub Pages.

---

## 📬 Formspree Integration

To receive order and registration submissions directly to your email:
1. Log in to [Formspree](https://formspree.io/) and create a new form (e.g. `Smooth Birth Orders`).
2. Copy your Form ID (the alphanumeric string like `xpwzlkjq`).
3. Open `js/main.js` and paste your Form ID in `window.SMOOTH_BIRTH_CONFIG`:
   ```javascript
   window.SMOOTH_BIRTH_CONFIG = {
       formspreeOrderEndpoint: "https://formspree.io/f/xbglpwbe",
       formspreeRegEndpoint: "https://formspree.io/f/xbglpwbe",
       turnstileSiteKey: "0x4AAAAAAFUz1RMAT1FQIPVT",
       clerkPublishableKey: ""
   };
   ```
4. Commit and push:
   ```bash
   git add js/main.js
   git commit -m "Configure Formspree endpoint and Turnstile"
   git push origin main
   ```

---

## 🛡️ Cloudflare Turnstile Spam Protection

The Wholesale Order Form and Practitioner Registration Form are protected against bot spam via **Cloudflare Turnstile**:
1. **Site Key**: `0x4AAAAAAFUz1RMAT1FQIPVT` (configured in `wholesale.html` and `js/main.js`).
2. **Formspree Backend Verification**:
   - In the Formspree Dashboard for form `xbglpwbe`, go to **Settings → CAPTCHA / Spam Protection**.
   - Select **Cloudflare Turnstile** and paste your Cloudflare **Secret Key**.
   - Formspree automatically verifies the `cf-turnstile-response` token sent with each order/application request.

---

## 🎭 Staging Environment & Promotion Workflow

The site includes full-fidelity duplicate staging pages ending in `-staging.html` for staging and previewing modifications safely before publishing to production:
- `https://smoothbirth.com/index-staging.html`
- `https://smoothbirth.com/wholesale-staging.html`
- `https://smoothbirth.com/thanks-staging.html`
- `https://smoothbirth.com/privacy-staging.html`
- `https://smoothbirth.com/terms-staging.html`

### Key Staging Features:
- **Noindex Protection**: All staging pages include `<meta name="robots" content="noindex, nofollow">` and are disallowed in `robots.txt` so search engine crawlers will never index duplicate content or affect live SEO.
- **Closed-Loop Navigation**: All internal links across staging pages automatically route to their sibling `-staging.html` pages.
- **Staging Header Banner**: Displays an environment badge with a direct link back to the live production page.
- **Form Submission Routing**: In `js/main.js`, form submission redirects point to `thanks-staging.html` when submitted from a staging page.

### Promoting Staged Changes to Production:
Use the included `promote-staging.sh` helper to promote individual or all pages with 1 command:
```bash
# Promote all 5 staging pages to production
./promote-staging.sh all

# Or promote an individual page
./promote-staging.sh index
./promote-staging.sh wholesale
```
The promotion script automatically:
1. Strips the staging banner and `noindex` meta tags.
2. Rewrites `-staging.html` links back to clean production URLs.
3. Removes `[Staging]` from page titles.
4. Shows a `git diff` preview so you can verify changes before committing.

---

## 👥 Multi-User Shared Workspace Setup

On this local machine, this project is located in `/Users/Shared/smoothbirthsite` so both `eunhyeshim` and `duncanmcnaught` can work on the same repository with group write access (`staff`).
```bash
git config --global --add safe.directory /Users/Shared/smoothbirthsite
git config core.fileMode false
```
