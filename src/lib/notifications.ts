import prisma from "@/lib/prisma";

type CreateNotificationInput = {
  dairyId: number;
  createdByUserId: number;
  userId: number;
  type: "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "MONTH_CLOSE" | "CUSTOM";
  title: string;
  message?: string | null;
  actionUrl?: string | null;
};

export async function createUserNotification(input: CreateNotificationInput) {
  const { dairyId, createdByUserId, userId, type, title, message, actionUrl } = input;

  return prisma.notification.create({
    data: {
      dairyId,
      createdByUserId,
      userId,
      type,
      title,
      message: message?.trim() || null,
      actionUrl: actionUrl?.trim() || null,
    },
  });
}
