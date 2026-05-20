import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { jsonError, parsePositiveInt } from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ notificationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "OWNER") {
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
        dairy: {
          ownerId: session.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      return jsonError("Notification not found", 404);
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
