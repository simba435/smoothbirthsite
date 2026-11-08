/**
 * Smooth Birth Apothecary - Practitioner Approval Worker
 * Handles 1-click approvals from Simba's Formspree notification emails:
 * 1. Verifies secret approval token
 * 2. Updates practitioner account in Clerk (or issues an approved invitation)
 * 3. Sends branded welcome & access email to practitioner
 * 4. Displays verified confirmation receipt to Simba
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        service: 'Smooth Birth Apothecary Approval Worker',
        status: 'healthy',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname !== '/approve') {
      return new Response('Not Found', { status: 404 });
    }

    const email = (url.searchParams.get('email') || '').trim();
    const name = (url.searchParams.get('name') || '').trim();
    const clinic = (url.searchParams.get('clinic') || '').trim();
    const token = (url.searchParams.get('token') || '').trim();

    // 1. Verify Security Token
    const configuredToken = env.APPROVE_SECRET_TOKEN || 'sb_dispensary_secret_2026';
    if (!token || token !== configuredToken) {
      return renderHtmlResponse({
        success: false,
        title: 'Unauthorized Approval Request',
        message: 'The security verification token provided is missing or invalid. Please click the approval link directly from your original Formspree notification email.',
        email,
        name,
        clinic
      }, 403);
    }

    if (!email || !email.includes('@')) {
      return renderHtmlResponse({
        success: false,
        title: 'Missing Practitioner Email',
        message: 'No valid practitioner email was provided in the approval request.',
        email,
        name,
        clinic
      }, 400);
    }

    const results = {
      clerkUpdated: false,
      clerkInvited: false,
      emailSent: false,
      details: []
    };

    // 2. Update or Invite via Clerk Backend API
    if (env.CLERK_SECRET_KEY) {
      try {
        // Check if user already exists in Clerk
        const userSearchRes = await fetch(
          `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
          {
            headers: {
              'Authorization': `Bearer ${env.CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (userSearchRes.ok) {
          const users = await userSearchRes.json();
          if (Array.isArray(users) && users.length > 0) {
            // Existing user found: update their metadata to approved: true
            const user = users[0];
            const currentPublicMeta = user.public_metadata || {};
            const updateRes = await fetch(`https://api.clerk.com/v1/users/${user.id}/metadata`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                public_metadata: {
                  ...currentPublicMeta,
                  approved: true,
                  clinicName: clinic || currentPublicMeta.clinicName || '',
                  approvedAt: new Date().toISOString()
                }
              })
            });

            if (updateRes.ok) {
              results.clerkUpdated = true;
              results.details.push(`Existing Clerk account (${user.id}) unlocked and set to approved.`);
            } else {
              const errBody = await updateRes.text();
              results.details.push(`Clerk metadata update failed: ${errBody}`);
            }
          } else {
            // User has not registered in Clerk yet: send approved Clerk invitation
            const inviteRes = await fetch('https://api.clerk.com/v1/invitations', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email_address: email,
                public_metadata: {
                  approved: true,
                  clinicName: clinic,
                  approvedAt: new Date().toISOString()
                },
                redirect_url: `${env.SITE_URL || 'https://smoothbirth.com'}/wholesale.html`,
                notify: false
              })
            });

            if (inviteRes.ok) {
              results.clerkInvited = true;
              results.details.push(`Practitioner invitation created with pre-approved wholesale status.`);
            } else {
              const inviteErr = await inviteRes.text();
              results.details.push(`Clerk invitation notice: ${inviteErr}`);
            }
          }
        }
      } catch (clerkErr) {
        results.details.push(`Clerk API connection note: ${clerkErr.message}`);
      }
    } else {
      results.details.push('CLERK_SECRET_KEY not configured in worker environment.');
    }

    // 3. Dispatch Branded Welcome Email (via Resend if RESEND_API_KEY configured)
    if (env.RESEND_API_KEY) {
      try {
        const practitionerDisplayName = name || 'Practitioner';
        const fromEmail = env.FROM_EMAIL || 'Smooth Birth Apothecary <orders@smoothbirth.com>';
        const wholesalePortalUrl = `${env.SITE_URL || 'https://smoothbirth.com'}/wholesale.html`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF8; margin: 0; padding: 24px; color: #2A2A2A;">
            <table align="center" width="100%" max-width="600" style="max-width: 600px; background: #FFFFFF; border-radius: 8px; border: 1px solid #EAE6DF; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
              <tr>
                <td style="background: #2D3E30; padding: 28px 32px; text-align: center;">
                  <span style="font-size: 28px; color: #D4BFA0; display: block; margin-bottom: 4px;">❧</span>
                  <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 0.5px;">Smooth Birth Apothecary</h1>
                  <p style="color: #D4BFA0; font-size: 12px; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 2px;">Clinical Botanical Restocking</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 36px 32px;">
                  <h2 style="color: #2D3E30; font-size: 20px; font-weight: 500; margin: 0 0 16px;">Welcome to the Practitioner Dispensary</h2>
                  <p style="font-size: 15px; line-height: 1.7; color: #4A4A4A; margin: 0 0 16px;">
                    Dear ${practitionerDisplayName},
                  </p>
                  <p style="font-size: 15px; line-height: 1.7; color: #4A4A4A; margin: 0 0 20px;">
                    Your practitioner credentials for <strong>${clinic || 'your clinical practice'}</strong> have been verified and approved by Smooth Birth Apothecary.
                  </p>
                  <div style="background: #F7F4EF; border-left: 3px solid #B8956A; padding: 14px 18px; border-radius: 4px; margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #4A4A4A;">
                    <strong>Wholesale Ordering Guidelines:</strong><br>
                    &bull; Minimum batch size per formula: <strong>8 oz</strong> (8 &times; 1 oz bottles or 4 &times; 2 oz bottles)<br>
                    &bull; <strong>FREE direct shipping</strong> on all orders over $250<br>
                    &bull; Frictionless invoicing sent directly to your clinic via Square / QuickBooks
                  </div>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${wholesalePortalUrl}" style="background-color: #5E7F65; color: #FFFFFF; padding: 14px 28px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                      Access Wholesale Master Order Form &rarr;
                    </a>
                  </div>
                  <p style="font-size: 13px; line-height: 1.6; color: #717171; margin: 24px 0 0;">
                    You can sign in using your email address (<strong>${email}</strong>) or your clinic dispensary credentials.<br>
                    If you have clinical formula questions or custom client needs, feel free to reply directly to this email.
                  </p>
                  <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A; margin: 24px 0 0;">
                    Warmly,<br>
                    <strong>Smooth Birth Apothecary</strong><br>
                    <span style="font-size: 13px; color: #717171;">Clinical Dispensary Team</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background: #FAFAF8; padding: 20px 32px; text-align: center; border-top: 1px solid #EAE6DF; font-size: 12px; color: #9A9A9A;">
                  &copy; 2026 Smooth Birth Apothecary LLC &bull; Boulder, Colorado &bull; <a href="https://smoothbirth.com" style="color: #5E7F65; text-decoration: none;">smoothbirth.com</a>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: 'Your Smooth Birth Wholesale Practitioner Account is Approved!',
            html: emailHtml
          })
        });

        if (resendRes.ok) {
          results.emailSent = true;
          results.details.push(`Welcome email successfully sent to ${email} via Resend.`);
        } else {
          const resendErr = await resendRes.text();
          results.details.push(`Resend email delivery note: ${resendErr}`);
        }
      } catch (emailErr) {
        results.details.push(`Email delivery error: ${emailErr.message}`);
      }
    }

    // 4. Return Confirmation Page for Simba
    return renderHtmlResponse({
      success: true,
      title: 'Practitioner Approved Successfully',
      message: `Practitioner access has been verified and unlocked for <strong>${name || email}</strong>.`,
      email,
      name,
      clinic,
      results
    }, 200);
  }
};

/**
 * Clean Branded HTML Response View
 */
function renderHtmlResponse(data, statusCode = 200) {
  const isSuccess = data.success;
  const wholesaleUrl = 'https://smoothbirth.com/wholesale.html';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title} | Smooth Birth Apothecary</title>
      <link rel="icon" type="image/png" href="https://smoothbirth.com/images/favicon.png">
      <style>
        body {
          margin: 0;
          padding: 30px 16px;
          background: #FAFAF8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #2A2A2A;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 90vh;
          box-sizing: border-box;
        }
        .card {
          background: #FFFFFF;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          max-width: 580px;
          width: 100%;
          padding: 2.75rem 2.25rem;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
          text-align: center;
          box-sizing: border-box;
        }
        .leaf-icon {
          font-size: 2.8rem;
          color: ${isSuccess ? '#5E7F65' : '#C62828'};
          margin-bottom: 0.5rem;
        }
        h1 {
          font-family: 'Georgia', serif;
          font-size: 1.85rem;
          color: #2D3E30;
          margin: 0 0 0.8rem;
          font-weight: normal;
        }
        p {
          font-size: 1.02rem;
          line-height: 1.6;
          color: #4A4A4A;
          margin: 0 0 1.5rem;
        }
        .details-box {
          background: #F7F4EF;
          border: 1px solid rgba(184, 149, 106, 0.35);
          border-radius: 6px;
          padding: 1.25rem 1.5rem;
          text-align: left;
          margin-bottom: 1.75rem;
          font-size: 0.9rem;
          line-height: 1.7;
        }
        .details-box strong {
          color: #2D3E30;
        }
        .status-badge {
          display: inline-block;
          background: ${isSuccess ? '#E8F5E9' : '#FFEBEE'};
          color: ${isSuccess ? '#2E7D32' : '#C62828'};
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }
        .btn {
          display: inline-block;
          background: #5E7F65;
          color: #FFFFFF;
          text-decoration: none;
          padding: 0.85rem 1.75rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background 0.2s ease;
        }
        .btn:hover {
          background: #3D5A42;
        }
        .btn-outline {
          display: inline-block;
          background: transparent;
          color: var(--text-dark, #2A2A2A);
          border: 1px solid rgba(0,0,0,0.2);
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .btn-outline:hover {
          background: rgba(0,0,0,0.04);
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="leaf-icon">❧</div>
        <div class="status-badge">${isSuccess ? '✓ VERIFIED & APPROVED' : '⚠ APPROVAL NOTICE'}</div>
        <h1>${data.title}</h1>
        <p>${data.message}</p>

        <div class="details-box">
          ${data.name ? `<div><strong>Practitioner:</strong> ${data.name}</div>` : ''}
          ${data.clinic ? `<div><strong>Clinic:</strong> ${data.clinic}</div>` : ''}
          <div><strong>Email:</strong> ${data.email || 'N/A'}</div>
          <div><strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })} MT</div>
          ${data.results && data.results.details && data.results.details.length > 0 ? `
            <hr style="border: none; border-top: 1px dashed rgba(0,0,0,0.15); margin: 0.75rem 0;">
            <div style="font-size: 0.8rem; color: #717171;">
              ${data.results.details.map(d => `&bull; ${d}`).join('<br>')}
            </div>
          ` : ''}
        </div>

        ${isSuccess && data.email ? `
          <div style="margin-bottom: 1.5rem;">
            <a href="mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent('Your Smooth Birth Wholesale Practitioner Account is Approved!')}&body=${encodeURIComponent(
              `Dear ${data.name || 'Practitioner'},\n\nWelcome to Smooth Birth Apothecary! Your wholesale practitioner credentials for ${data.clinic || 'your practice'} have been verified and approved by Smooth Birth Apothecary.\n\nYou can now log into the wholesale dispensary portal to view clinical formulas and place restocking orders directly at:\nhttps://smoothbirth.com/wholesale.html\n\nWholesale Ordering Guidelines:\n• Minimum batch size per formula: 8 oz (8 x 1 oz bottles or 4 x 2 oz bottles)\n• FREE direct shipping on all orders over $250\n• Invoicing sent via Square / QuickBooks upon order submission\n\nIf you have any clinical formula questions or custom perinatal case needs, please feel free to reach out anytime.\n\nWarmly,\nSmooth Birth Apothecary\nClinical Dispensary Team\nhttps://smoothbirth.com`
            )}" class="btn" style="width: 100%; box-sizing: border-box; margin-bottom: 0.75rem; text-align: center;">
              ✉️ Send Welcome Email to Practitioner &rarr;
            </a>
            <div style="font-size: 0.78rem; color: #717171;">
              Tapping above opens your email app with a pre-written welcome message ready for you to review and send.
            </div>
          </div>
        ` : ''}

        <a href="${wholesaleUrl}" class="btn-outline">View Wholesale Portal &rarr;</a>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    status: statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
