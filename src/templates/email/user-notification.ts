import { Role } from "@prisma/client";

const USER_PORTAL_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  process.env.APP_BASE_URL?.trim() ||
  "https://dairy-mate.vercel.app";

type GenerateUserNotificationEmailInput = {
  recipientName: string;
  dairyName: string;
  title: string;
  message?: string | null;
  role: Role;
  actionUrl?: string | null;
};

function getPortalPath(role: Role) {
  if (role === "SELLER") {
    return "/portal/seller";
  }

  return "/portal/buyer";
}

function getAbsoluteUrl(actionUrl: string | null | undefined, role: Role) {
  if (actionUrl?.trim()) {
    if (/^https?:\/\//i.test(actionUrl)) {
      return actionUrl.trim();
    }

    return `${USER_PORTAL_BASE_URL.replace(/\/$/, "")}/${actionUrl.replace(/^\/+/, "")}`;
  }

  return `${USER_PORTAL_BASE_URL.replace(/\/$/, "")}${getPortalPath(role)}`;
}

export function generateUserNotificationEmail(
  input: GenerateUserNotificationEmailInput
) {
  const { recipientName, dairyName, title, message, role, actionUrl } = input;
  const portalUrl = getAbsoluteUrl(actionUrl, role);
  const previewMessage =
    typeof message === "string" && message.trim()
      ? message.trim()
      : "A new update is waiting for you in your Dairy Mate portal.";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${dairyName} - ${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f7fb; font-family: Arial, sans-serif;">
      <table width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);">
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #0f766e, #0891b2); padding: 24px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">${title}</h1>
                  <p style="margin: 8px 0 0; color: #d5f5f6; font-size: 14px;">${dairyName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px; color: #1f2937;">
                  <p style="margin: 0 0 16px; font-size: 16px;">Hello ${recipientName},</p>
                  <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
                    You have received a new notification from ${dairyName}.
                  </p>
                  <div style="margin: 0 0 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f8fafc; padding: 18px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #334155;">
                      ${previewMessage}
                    </p>
                  </div>
                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.7; color: #4b5563;">
                    Open your portal to review the full update and any related account activity.
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

  const text = `${title}

Hello ${recipientName},

You have received a new notification from ${dairyName}.

${previewMessage}

Open Portal: ${portalUrl}

This is an automated update from Dairy Mate.`;

  return {
    subject: `${dairyName} - ${title}`,
    html,
    text,
  };
}
