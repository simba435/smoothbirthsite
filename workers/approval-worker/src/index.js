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

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        service: 'Smooth Birth Apothecary Approval Worker',
        status: 'healthy',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Practitioner Registration via Clerk Backend API
    if (url.pathname === '/register' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { email, password, name, clinic, phone, credential, website, notes } = body;

        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email and password are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!env.CLERK_SECRET_KEY) {
          return new Response(JSON.stringify({ error: 'CLERK_SECRET_KEY not configured in worker environment' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Call Clerk Backend API to create the user account
        const clerkRes = await fetch('https://api.clerk.com/v1/users', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email_address: [email],
            password: password,
            first_name: name || '',
            public_metadata: {
              approved: false,
              clinicName: clinic || '',
              phone: phone || '',
              credential: credential || '',
              website: website || '',
              appliedAt: new Date().toISOString()
            }
          })
        });

        const clerkData = await clerkRes.json();

        if (!clerkRes.ok) {
          // If user already exists in Clerk, treat as existing and proceed
          const isExisting = clerkData.errors && clerkData.errors.some(e => e.code === 'form_identifier_exists');
          if (isExisting) {
            return new Response(JSON.stringify({
              success: true,
              existing: true,
              message: 'Account with this email already exists in Clerk.'
            }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          const errMsg = clerkData.errors ? clerkData.errors.map(e => e.message).join(', ') : 'Failed to create user in Clerk';
          return new Response(JSON.stringify({ error: errMsg }), {
            status: clerkRes.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          userId: clerkData.id,
          message: 'Practitioner user created in Clerk with pending approval.'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Wholesale Order Confirmation Email (sent directly to practitioner upon order submission)
    if (url.pathname === '/order-confirmation' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { email, contactName, clinicName, phone, shippingAddress, notes, orderSummary } = body;

        if (!email) {
          return new Response(JSON.stringify({ error: 'Practitioner email is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!env.RESEND_API_KEY) {
          return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured in worker environment' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const fromEmail = env.FROM_EMAIL || 'Smooth Birth Apothecary <hello@smoothbirth.com>';
        const practitionerDisplayName = contactName || 'Practitioner';
        const clinicDisplayName = clinicName || 'Your Practice';

        // Build itemized table rows
        let itemsTableHtml = '';
        if (orderSummary && Array.isArray(orderSummary.items) && orderSummary.items.length > 0) {
          itemsTableHtml = `
            <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
              <thead>
                <tr style="background: #F7F4EF; border-bottom: 2px solid #EAE6DF; text-align: left;">
                  <th style="padding: 10px 12px; font-weight: 600; color: #2D3E30;">Formula</th>
                  <th style="padding: 10px 12px; font-weight: 600; color: #2D3E30;">Size</th>
                  <th style="padding: 10px 12px; font-weight: 600; color: #2D3E30; text-align: center;">Qty</th>
                  <th style="padding: 10px 12px; font-weight: 600; color: #2D3E30; text-align: right;">Wholesale</th>
                  <th style="padding: 10px 12px; font-weight: 600; color: #2D3E30; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderSummary.items.map((it, idx) => `
                  <tr style="border-bottom: 1px solid #EAE6DF; background: ${idx % 2 === 0 ? '#FFFFFF' : '#FAFAF8'};">
                    <td style="padding: 10px 12px; color: #2A2A2A; font-weight: 500;">${it.item}</td>
                    <td style="padding: 10px 12px; color: #717171;">${it.size}</td>
                    <td style="padding: 10px 12px; color: #2A2A2A; text-align: center; font-weight: 600;">${it.qty}</td>
                    <td style="padding: 10px 12px; color: #4A4A4A; text-align: right;">$${Number(it.price).toFixed(2)}</td>
                    <td style="padding: 10px 12px; color: #2D3E30; text-align: right; font-weight: 600;">$${Number(it.subtotal).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }

        const subtotal = orderSummary ? `$${Number(orderSummary.subtotal || 0).toFixed(2)}` : '$0.00';
        const shippingFee = orderSummary && Number(orderSummary.shipping) === 0 ? 'FREE (Orders over $250)' : `$${Number(orderSummary ? orderSummary.shipping : 15).toFixed(2)} Flat Rate`;
        const grandTotal = orderSummary ? `$${Number(orderSummary.estimated_total || 0).toFixed(2)}` : '$0.00';
        const totalBottles = orderSummary ? `${orderSummary.total_bottles || 0} bottles` : '';

        const orderEmailHtml = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF8; margin: 0; padding: 24px; color: #2A2A2A;">
            <table align="center" width="100%" style="max-width: 620px; background: #FFFFFF; border-radius: 8px; border: 1px solid #EAE6DF; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.04); margin: auto;">
              <tr>
                <td style="background: #2D3E30; padding: 28px 32px; text-align: center;">
                  <span style="font-size: 28px; color: #D4BFA0; display: block; margin-bottom: 4px;">❧</span>
                  <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 0.5px;">Smooth Birth Apothecary</h1>
                  <p style="color: #D4BFA0; font-size: 12px; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 2px;">Wholesale Order Request Confirmation</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 36px 32px;">
                  <div style="display: inline-block; background: #E8F5E9; color: #2E7D32; font-weight: 600; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 14px;">
                    ✓ REQUEST RECEIVED
                  </div>
                  <h2 style="color: #2D3E30; font-size: 20px; font-weight: 500; margin: 0 0 16px;">We’ve Received Your Restocking Order</h2>
                  <p style="font-size: 15px; line-height: 1.7; color: #4A4A4A; margin: 0 0 16px;">
                    Dear ${practitionerDisplayName},
                  </p>
                  <p style="font-size: 15px; line-height: 1.7; color: #4A4A4A; margin: 0 0 20px;">
                    Thank you for ordering with Smooth Birth Apothecary. We have received your wholesale restocking request for <strong>${clinicDisplayName}</strong>.
                  </p>

                  <h3 style="color: #2D3E30; font-size: 16px; margin: 24px 0 8px; border-bottom: 1px solid #EAE6DF; padding-bottom: 8px;">Requested Formulas</h3>
                  ${itemsTableHtml}

                  <div style="background: #F7F4EF; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
                    <table width="100%" style="font-size: 14px; line-height: 1.8;">
                      <tr>
                        <td style="color: #717171;">Total Bottles Requested:</td>
                        <td style="text-align: right; font-weight: 600; color: #2A2A2A;">${totalBottles}</td>
                      </tr>
                      <tr>
                        <td style="color: #717171;">Wholesale Products Subtotal:</td>
                        <td style="text-align: right; font-weight: 600; color: #2A2A2A;">${subtotal}</td>
                      </tr>
                      <tr>
                        <td style="color: #717171;">Direct Shipping:</td>
                        <td style="text-align: right; font-weight: 600; color: #2A2A2A;">${shippingFee}</td>
                      </tr>
                      <tr style="border-top: 1px dashed #D4BFA0;">
                        <td style="padding-top: 8px; font-weight: 700; color: #2D3E30; font-size: 15px;">Estimated Invoice Total:</td>
                        <td style="padding-top: 8px; text-align: right; font-weight: 700; color: #2D3E30; font-size: 16px;">${grandTotal}</td>
                      </tr>
                    </table>
                  </div>

                  <h3 style="color: #2D3E30; font-size: 16px; margin: 24px 0 8px; border-bottom: 1px solid #EAE6DF; padding-bottom: 8px;">Clinic & Shipping Information</h3>
                  <div style="font-size: 14px; line-height: 1.7; color: #4A4A4A; margin-bottom: 20px;">
                    <strong>Clinic / Practice:</strong> ${clinicDisplayName}<br>
                    <strong>Primary Contact:</strong> ${practitionerDisplayName}<br>
                    <strong>Invoice Email:</strong> ${email}<br>
                    ${phone ? `<strong>Phone:</strong> ${phone}<br>` : ''}
                    <strong>Shipping Address:</strong> ${shippingAddress || 'On file'}<br>
                    ${notes ? `<strong>Special Instructions:</strong> <em>${notes}</em><br>` : ''}
                  </div>

                  <div style="background: #F7F4EF; border-left: 3px solid #B8956A; padding: 14px 18px; border-radius: 4px; margin: 24px 0; font-size: 14px; line-height: 1.6; color: #4A4A4A;">
                    <strong style="color: #2D3E30;">What happens next?</strong><br>
                    &bull; <strong>Square / QuickBooks Invoicing:</strong> Our dispensary team reviews your requested batch quantities and will email a secure electronic invoice for payment.<br>
                    &bull; <strong>Fresh Compounding &amp; Drop-Shipping:</strong> Upon payment, your formulas are freshly compounded and drop-shipped directly from our manufacturing partner to your practice with FedEx/UPS tracking.
                  </div>

                  <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A; margin: 24px 0 0;">
                    Warmly,<br>
                    <strong>Smooth Birth Apothecary</strong><br>
                    <span style="font-size: 13px; color: #717171;">Clinical Dispensary Team</span>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background: #FAFAF8; padding: 20px 32px; text-align: center; border-top: 1px solid #EAE6DF; font-size: 12px; color: #9A9A9A;">
                  Questions about your order? Reply directly to this email or reach us at <a href="mailto:hello@smoothbirth.com" style="color: #5E7F65; text-decoration: none;">hello@smoothbirth.com</a>.<br>
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
            reply_to: 'hello@smoothbirth.com',
            subject: `Wholesale Order Request Received - ${clinicDisplayName}`,
            html: orderEmailHtml
          })
        });

        if (!resendRes.ok) {
          const resendErr = await resendRes.text();
          return new Response(JSON.stringify({ error: `Resend error: ${resendErr}` }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const resendData = await resendRes.json();
        return new Response(JSON.stringify({
          success: true,
          message: 'Order confirmation email sent successfully to practitioner.',
          id: resendData.id
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
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
            // Existing user found: check if already approved to prevent duplicate emails
            const user = users[0];
            const currentPublicMeta = user.public_metadata || {};
            const isAlreadyApproved = currentPublicMeta.approved === true;

            if (isAlreadyApproved) {
              results.clerkUpdated = true;
              results.alreadyApproved = true;
              results.details.push(`Practitioner account (${user.id}) is already verified and active.`);
            } else {
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
      if (results.alreadyApproved) {
        results.details.push('Practitioner was previously approved; skipped duplicate welcome email.');
      } else {
        try {
          const practitionerDisplayName = name || 'Practitioner';
          const fromEmail = env.FROM_EMAIL || 'Smooth Birth Apothecary <hello@smoothbirth.com>';
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
              reply_to: 'hello@smoothbirth.com',
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

        ${isSuccess && data.email && data.results && (data.results.emailSent || data.results.alreadyApproved) ? `
          <div style="margin-bottom: 1.5rem; background: #E8F5E9; border: 1px solid rgba(46, 125, 50, 0.25); border-radius: 6px; padding: 0.9rem 1.2rem; color: #2E7D32; font-size: 0.88rem; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <span>✓</span> Branded welcome email has been delivered to <strong>${data.email}</strong>.
          </div>
        ` : isSuccess && data.email ? `
          <div style="margin-bottom: 1.5rem;">
            <a href="mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent('Your Smooth Birth Wholesale Practitioner Account is Approved!')}&body=${encodeURIComponent(
              `Dear ${data.name || 'Practitioner'},\n\nWelcome to Smooth Birth Apothecary! Your wholesale practitioner credentials for ${data.clinic || 'your practice'} have been verified and approved by Smooth Birth Apothecary.\n\nYou can now log into the wholesale dispensary portal to view clinical formulas and place restocking orders directly at:\nhttps://smoothbirth.com/wholesale.html\n\nWholesale Ordering Guidelines:\n• Minimum batch size per formula: 8 oz (8 x 1 oz bottles or 4 x 2 oz bottles)\n• FREE direct shipping on all orders over $250\n• Invoicing sent via Square / QuickBooks upon order submission\n\nIf you have any clinical formula questions or custom perinatal case needs, please feel free to reach out anytime.\n\nWarmly,\nSmooth Birth Apothecary\nClinical Dispensary Team\nhttps://smoothbirth.com`
            )}" class="btn" style="width: 100%; box-sizing: border-box; margin-bottom: 0.75rem; text-align: center;">
              ✉️ Send Manual Welcome Email &rarr;
            </a>
            <div style="font-size: 0.78rem; color: #717171;">
              Automated delivery was unavailable; tap above to send directly from your mail app.
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
