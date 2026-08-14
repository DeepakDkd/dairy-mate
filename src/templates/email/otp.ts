export function generateOtpEmail(
  otp: string,
  expirationMinutes: number,
  appName = "Dairy Mate",
  purpose: "login" | "reset" = "login"
) {
  const isReset = purpose === "reset";
  
  const titleText = isReset ? "Password Reset Verification" : "Secure Login Verification";
  const headerHeading = isReset ? "Reset Your Password" : "Verify Your Identity";
  
  const bodyText = isReset
    ? `We received a request to reset your password for your <strong>${appName}</strong> account. Use the one-time verification code below to authorize this change.`
    : `We received a request to log in to your <strong>${appName}</strong> account. Use the one-time verification code below to securely sign in.`;

  const footerDisclaimer = isReset
    ? "If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged."
    : "If you did not request this login code, someone may have entered your mobile number by mistake. Your account remains secure.";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${appName} - ${titleText}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; padding: 40px 0;">
      <table width="100%" cellspacing="0" cellpadding="0" style="padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="560" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;">
              
              <!-- Top Color Banner -->
              <tr>
                <td height="6" style="background: linear-gradient(90deg, #008ED6 0%, #00A3E0 100%);"></td>
              </tr>
              
              <!-- Header Brand & Icon -->
              <tr>
                <td align="center" style="padding: 35px 40px 25px 40px; border-bottom: 1px solid #f8fafc;">
                  <table width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background: #e0f2fe; border-radius: 12px; margin-bottom: 16px; text-align: center;">
                          <span style="font-size: 24px; vertical-align: middle;">⚡</span>
                        </div>
                        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
                          ${appName}
                        </h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content Body -->
              <tr>
                <td style="padding: 40px; text-align: center;">
                  <h2 style="margin-top: 0; font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">
                    ${headerHeading}
                  </h2>
                  <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 30px; margin-top: 0; max-width: 440px; margin-left: auto; margin-right: auto;">
                    ${bodyText}
                  </p>
                  
                  <!-- OTP Code Display Card -->
                  <div style="background: #f0f9ff; border: 1px dashed #bae6fd; border-radius: 12px; padding: 20px; display: inline-block; min-width: 260px; margin-bottom: 25px;">
                    <span style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #0284c7; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">
                      Verification Code
                    </span>
                    <span style="font-size: 36px; font-weight: 800; color: #0369a1; letter-spacing: 6px; font-family: monospace; display: block; line-height: 1;">
                      ${otp}
                    </span>
                  </div>
                  
                  <p style="font-size: 13px; color: #64748b; margin-top: 5px;">
                    This code is valid for <strong style="color: #475569;">${expirationMinutes} minutes</strong>.
                  </p>
                  
                  <!-- Divider Line -->
                  <div style="margin: 35px auto 25px auto; width: 80px; height: 1px; background-color: #e2e8f0;"></div>
                  
                  <!-- Disclaimer / Caution -->
                  <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0; max-width: 400px; margin-left: auto; margin-right: auto;">
                    ${footerDisclaimer}
                  </p>
                </td>
              </tr>
              
              <!-- Footer Details -->
              <tr>
                <td align="center" style="background-color: #f8fafc; padding: 25px 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
                  <p style="margin: 0 0 6px 0; font-weight: 500; color: #64748b;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 11px;">
                    This is an automated system message. Please do not reply to this email directly.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
=========================================
${appName} - ${titleText}
=========================================

${headerHeading}

${bodyText.replace(/<\/?strong>/g, "")}

Verification Code: ${otp}

This code will expire in ${expirationMinutes} minutes.

-----------------------------------------
${footerDisclaimer}

© ${new Date().getFullYear()} ${appName}. All rights reserved.
  `;

  return { html, text };
}
