import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { jsonError, parsePositiveInt } from "@/lib/api-access";
import prisma from "@/lib/prisma";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ notificationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "BUYER" && session.user.role !== "SELLER") {
      return jsonError("Forbidden", 403);
    }

    const { notificationId: notificationIdParam } = await context.params;
    const notificationId = parsePositiveInt(notificationIdParam);

    if (!notificationId) {
      return jsonError("Invalid notification ID", 400);
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      return jsonError("Notification not found", 404);
    }

    const updated = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ notification: updated }, { status: 200 });
  } catch (error) {
    console.error("Failed to update portal notification:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
