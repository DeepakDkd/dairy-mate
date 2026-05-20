type PaymentConfirmationEmailInput = {
  recipientName: string;
  dairyName: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  currentBalance: number;
  portalPath: "/portal/buyer" | "/portal/seller";
  audience: "BUYER" | "SELLER";
};

const USER_PORTAL_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.APP_BASE_URL?.trim() ||
  "https://dairy-mate.vercel.app";

function formatMoney(value: number) {
  return `Rs ${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(value: Date) {
  return value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function getBalanceLabel(audience: "BUYER" | "SELLER", currentBalance: number) {
  if (audience === "BUYER") {
    if (currentBalance > 0) return "Remaining amount to pay";
    if (currentBalance < 0) return "Advance in account";
    return "Account status";
  }

  if (currentBalance < 0) return "Amount still to receive";
  if (currentBalance > 0) return "Advance received";
  return "Account status";
}

function getHeading(audience: "BUYER" | "SELLER") {
  return audience === "BUYER" ? "Payment Received" : "Payment Sent";
}

function getSummaryLine(audience: "BUYER" | "SELLER", dairyName: string) {
  return audience === "BUYER"
    ? `Your payment to ${dairyName} has been recorded successfully.`
    : `${dairyName} has recorded a payment in your favor.`;
}

export function generatePaymentConfirmationEmail(input: PaymentConfirmationEmailInput) {
  const {
    recipientName,
    dairyName,
    amount,
    paymentDate,
    paymentMethod,
    currentBalance,
    portalPath,
    audience,
  } = input;

  const heading = getHeading(audience);
  const summaryLine = getSummaryLine(audience, dairyName);
  const balanceLabel = getBalanceLabel(audience, currentBalance);
  const balanceValue = currentBalance === 0 ? "Settled" : formatMoney(Math.abs(currentBalance));
  const formattedAmount = formatMoney(amount);
  const formattedDate = formatDateTime(paymentDate);
  const portalUrl = `${USER_PORTAL_BASE_URL.replace(/\/$/, "")}${portalPath}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${dairyName} - ${heading}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f7fb; font-family: Arial, sans-serif;">
      <table width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);">
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #0f766e, #0891b2); padding: 24px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">${heading}</h1>
                  <p style="margin: 8px 0 0; color: #d5f5f6; font-size: 14px;">${dairyName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px; color: #1f2937;">
                  <p style="margin: 0 0 16px; font-size: 16px;">Hello ${recipientName},</p>
                  <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7;">${summaryLine}</p>

                  <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Amount</td>
                      <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${formattedAmount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Date & Time</td>
                      <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${formattedDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Method</td>
                      <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${paymentMethod}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">${balanceLabel}</td>
                      <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; font-weight: 600;">${balanceValue}</td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.7; color: #4b5563;">
                    You can review the full transaction and updated account history anytime in your portal.
                  </p>

                  <a
                    href="${portalUrl}"
                    style="display: inline-block; padding: 12px 18px; border-radius: 10px; background: #0f766e; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;"
                  >
                    Open Portal
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 16px 24px; background: #f8fafc; color: #94a3b8; font-size: 12px; text-align: center;">
                  This is an automated update from Dairy Mate.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `${heading}

Hello ${recipientName},

${summaryLine}

Amount: ${formattedAmount}
Date & Time: ${formattedDate}
Method: ${paymentMethod}
${balanceLabel}: ${balanceValue}

Open Portal: ${portalUrl}

This is an automated update from Dairy Mate.`;

  return {
    subject: `${dairyName} - ${heading}`,
    html,
    text,
  };
}
