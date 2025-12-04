export function generateOtpEmail(
  otp: string,
  expirationMinutes: number,
  appName = "Dairy Mate"
) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${appName} - OTP Verification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table width="100%" cellspacing="0" cellpadding="0" style="padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: #008ED6; padding: 20px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: normal;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 30px; text-align: center; color: #333333;">
                  <h2 style="margin-top: 0;">Your OTP Code</h2>
                  <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                    We received a request to reset your password.  
                    Use the one-time password below to complete the process.  
                    This code will expire in <strong>${expirationMinutes} minutes</strong>.
                  </p>
                  
                  <div style="display: inline-block; padding: 12px 24px; background: #008ED6; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 6px;">
                    ${otp}
                  </div>
                  
                  <p style="font-size: 14px; color: #888888; margin-top: 25px;">
                    If you didn&apos;t request a password reset, please ignore this email.  
                    Your account is safe.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #f9f9f9; padding: 15px; font-size: 12px; color: #999999;">
                  &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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
${appName} - Password Reset OTP

We received a request to reset your password.  
Use the one-time password below to complete the process.  
This code will expire in ${expirationMinutes} minutes.

OTP: ${otp}

If you didn&apos;t request a password reset, you can ignore this email. Your account is safe.

© ${new Date().getFullYear()} ${appName}
  `;

  return { html, text };
}
