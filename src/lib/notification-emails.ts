import { Role } from "@prisma/client";

import { generateUserNotificationEmail } from "@/templates/email/user-notification";
import { sendEmail } from "@/utils/email";

type NotificationEmailRecipient = {
  email?: string | null;
  firstName: string;
  role: Role;
};

type SendNotificationEmailsInput = {
  dairyName: string;
  replyToEmail?: string | null;
  title: string;
  message?: string | null;
  actionUrl?: string | null;
  recipients: NotificationEmailRecipient[];
};

function hasEmailConfig() {
  return Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_FROM
  );
}

export async function sendNotificationEmails(
  input: SendNotificationEmailsInput
) {
  if (!hasEmailConfig()) {
    return { sentCount: 0, skippedCount: input.recipients.length, reason: "missing-email-config" as const };
  }

  const settled = await Promise.allSettled(
    input.recipients.map(async (recipient) => {
      if (!recipient.email?.trim()) {
        return { skipped: true as const };
      }

      const { subject, html, text } = generateUserNotificationEmail({
        recipientName: recipient.firstName,
        dairyName: input.dairyName,
        title: input.title,
        message: input.message,
        role: recipient.role,
        actionUrl: input.actionUrl,
      });

      await sendEmail({
        to: recipient.email,
        subject,
        text,
        html,
        fromName: input.dairyName,
        replyTo: input.replyToEmail?.trim() || undefined,
      });

      return { skipped: false as const };
    })
  );

  const sentCount = settled.filter(
    (result) => result.status === "fulfilled" && result.value.skipped === false
  ).length;
  const skippedCount = settled.filter(
    (result) => result.status === "fulfilled" && result.value.skipped === true
  ).length;
  const failedCount = settled.filter((result) => result.status === "rejected").length;

  return { sentCount, skippedCount, failedCount };
}
