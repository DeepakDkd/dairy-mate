import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import {
  isNotificationType,
  jsonError,
  parsePositiveInt,
  requireOwnedDairy,
} from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import { createUserNotification } from "@/lib/notifications";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "OWNER") {
      return jsonError("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const dairyId = parsePositiveInt(searchParams.get("dairyId"));

    if (dairyId) {
      const access = await requireOwnedDairy(session, dairyId);
      if (!access.ok) {
        return access.response;
      }
    }

    const notifications = await prisma.notification.findMany({
      where: {
        dairy: {
          ownerId: session.user.id,
        },
        ...(dairyId ? { dairyId } : {}),
      },
      include: {
        dairy: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "OWNER") {
      return jsonError("Forbidden", 403);
    }

    const body = await request.json();
    const dairyId = parsePositiveInt(body?.dairyId);
    const userId = parsePositiveInt(body?.userId);
    const type = body?.type;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() || null : null;
    const actionUrl = typeof body?.actionUrl === "string" ? body.actionUrl.trim() || null : null;

    if (!dairyId || !userId || !title) {
      return jsonError("dairyId, userId, and title are required", 400);
    }

    if (!isNotificationType(type)) {
      return jsonError("Invalid notification type", 400);
    }

    const access = await requireOwnedDairy(session, dairyId);
    if (!access.ok) {
      return access.response;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        dairyId,
        role: {
          in: ["BUYER", "SELLER"],
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return jsonError("Notification recipient not found", 404);
    }

    const notification = await createUserNotification({
      dairyId,
      createdByUserId: session.user.id,
      userId,
      type,
      title,
      message,
      actionUrl,
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
