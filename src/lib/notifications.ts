import prisma from "@/lib/prisma";

export type NotificationTypeValue =
  | "PAYMENT_RECEIVED"
  | "PAYMENT_SENT"
  | "MONTH_CLOSE"
  | "CUSTOM";

type CreateNotificationInput = {
  dairyId: number;
  createdByUserId: number;
  userId: number;
  type: NotificationTypeValue;
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

export async function createUserNotifications(
  input: Omit<CreateNotificationInput, "userId"> & { userIds: number[] }
) {
  const uniqueUserIds = Array.from(new Set(input.userIds.filter((userId) => Number.isInteger(userId))));

  if (uniqueUserIds.length === 0) {
    return { count: 0 };
  }

  return prisma.notification.createMany({
    data: uniqueUserIds.map((userId) => ({
      dairyId: input.dairyId,
      createdByUserId: input.createdByUserId,
      userId,
      type: input.type,
      title: input.title,
      message: input.message?.trim() || null,
      actionUrl: input.actionUrl?.trim() || null,
    })),
  });
}
