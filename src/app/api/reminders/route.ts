import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import {
  isReminderType,
  jsonError,
  parseDateInput,
  parsePositiveInt,
  requireOwnedDairy,
} from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
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

    const reminders = await prisma.reminder.findMany({
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
        targetUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { id: "desc" }],
    });

    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch reminders:", error);
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
    const targetUserId = parsePositiveInt(body?.targetUserId);
    const type = body?.type;
    const dueDate = parseDateInput(body?.dueDate);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() || null : null;

    if (!dairyId || !dueDate || !title) {
      return jsonError("dairyId, title, and dueDate are required", 400);
    }

    if (!isReminderType(type)) {
      return jsonError("Invalid reminder type", 400);
    }

    const access = await requireOwnedDairy(session, dairyId);
    if (!access.ok) {
      return access.response;
    }

    let targetUser:
      | {
          id: number;
          role: "BUYER" | "SELLER";
        }
      | null = null;

    if (targetUserId) {
      const user = await prisma.user.findFirst({
        where: {
          id: targetUserId,
          dairyId,
          role: {
            in: ["BUYER", "SELLER"],
          },
        },
        select: {
          id: true,
          role: true,
        },
      });

      if (!user || (user.role !== "BUYER" && user.role !== "SELLER")) {
        return jsonError("Target user not found", 404);
      }

      targetUser = {
        id: user.id,
        role: user.role,
      };
    }

    const reminder = await prisma.reminder.create({
      data: {
        dairyId,
        createdByUserId: session.user.id,
        targetUserId: targetUser?.id ?? null,
        targetUserRole: targetUser?.role ?? null,
        type,
        title,
        message,
        dueDate,
      },
      include: {
        dairy: {
          select: {
            id: true,
            name: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error("Failed to create reminder:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
