# Smooth Birth Apothecary - 1-Click Practitioner Approval Worker

This Cloudflare Worker gives Simba a **1-click approval button** directly inside Formspree application emails.

When clicked:
1. **Verifies Security Token:** Confirms the request originates from Simba's email.
2. **Unlocks Clerk:** Queries Clerk API using your `CLERK_SECRET_KEY` to set `approved: true` (or issues an official approved invitation).
3. **Emails Practitioner:** Sends a branded welcome email to the practitioner with wholesale ordering instructions and a direct portal access link.
4. **Shows Confirmation:** Displays a branded confirmation receipt to Simba.

---

## Quick Setup & Deployment

### 1. Deploy the Worker
Run from your terminal:
```bash
cd workers/approval-worker
wrangler deploy
```
*(Cloudflare will output your worker URL, e.g. `https://smoothbirth-approval-worker.<your-subdomain>.workers.dev`)*

---

### 2. Set Secrets
Run each command and paste your key when prompted:

```bash
# 1. Your Clerk Backend Secret Key (from Clerk Dashboard > API Keys > Secret Key)
wrangler secret put CLERK_SECRET_KEY

# 2. Secret security passphrase for the approval link (choose any secret string, e.g. a random passphrase)
wrangler secret put APPROVE_SECRET_TOKEN

# 3. (Optional) Resend API Key for automatic branded email delivery (from https://resend.com)
wrangler secret put RESEND_API_KEY
```

---

## How It Works in Formspree

When a practitioner submits the wholesale application on `smoothbirth.com/wholesale.html`, the website automatically generates the approval link:

```
https://smoothbirth-approval-worker.<subdomain>.workers.dev/approve?email=midwife@clinic.com&name=Jane+Doe&clinic=Boulder+Birth&token=YOUR_SECRET_TOKEN
```

Formspree delivers this link directly into Simba's notification email as:
`One_Click_Approval_Link: [Link]`

Simba taps it from her phone or laptop, and the practitioner is instantly approved and notified!
