import { PaymentMethod } from "@prisma/client";

import { generatePaymentConfirmationEmail } from "@/templates/email/payment-confirmation";
import { sendEmail } from "@/utils/email";

type SendPaymentConfirmationEmailInput = {
  recipientEmail?: string | null;
  recipientName: string;
  dairyName: string;
  replyToEmail?: string | null;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  currentBalance: number;
  portalPath: "/portal/buyer" | "/portal/seller";
  audience: "BUYER" | "SELLER";
};

export async function sendPaymentConfirmationEmail(
  input: SendPaymentConfirmationEmailInput
) {
  if (!input.recipientEmail?.trim()) {
    return { sent: false, reason: "missing-recipient-email" as const };
  }

  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    !process.env.EMAIL_FROM
  ) {
    return { sent: false, reason: "missing-email-config" as const };
  }

  const { subject, html, text } = generatePaymentConfirmationEmail({
    recipientName: input.recipientName,
    dairyName: input.dairyName,
    amount: input.amount,
    paymentDate: input.paymentDate,
    paymentMethod: input.paymentMethod,
    currentBalance: input.currentBalance,
    portalPath: input.portalPath,
    audience: input.audience,
  });

  await sendEmail({
    to: input.recipientEmail,
    subject,
    text,
    html,
    fromName: input.dairyName,
    replyTo: input.replyToEmail?.trim() || undefined,
  });

  return { sent: true as const };
}
