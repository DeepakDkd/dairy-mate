import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import {
  isReminderStatus,
  jsonError,
  parseDateInput,
  parsePositiveInt,
} from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getOwnedReminder(reminderId: number, ownerId: number) {
  return prisma.reminder.findFirst({
    where: {
      id: reminderId,
      dairy: {
        ownerId,
      },
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ reminderId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "OWNER") {
      return jsonError("Forbidden", 403);
    }

    const { reminderId: reminderIdParam } = await context.params;
    const reminderId = parsePositiveInt(reminderIdParam);

    if (!reminderId) {
      return jsonError("Invalid reminder ID", 400);
    }

    const reminder = await getOwnedReminder(reminderId, session.user.id);
    if (!reminder) {
      return jsonError("Reminder not found", 404);
    }

    const body = await request.json();
    const nextStatus = body?.status;
    const nextDueDate = body?.dueDate ? parseDateInput(body.dueDate) : undefined;

    if (nextStatus != null && !isReminderStatus(nextStatus)) {
      return jsonError("Invalid reminder status", 400);
    }

    if (body?.dueDate && !nextDueDate) {
      return jsonError("Invalid due date", 400);
    }

    const updated = await prisma.reminder.update({
      where: {
        id: reminderId,
      },
      data: {
        ...(nextStatus ? { status: nextStatus } : {}),
        ...(nextDueDate ? { dueDate: nextDueDate } : {}),
        ...(nextStatus === "DONE"
          ? { doneAt: new Date() }
          : nextStatus === "PENDING"
            ? { doneAt: null }
            : {}),
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

    return NextResponse.json({ reminder: updated }, { status: 200 });
  } catch (error) {
    console.error("Failed to update reminder:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ reminderId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "OWNER") {
      return jsonError("Forbidden", 403);
    }

    const { reminderId: reminderIdParam } = await context.params;
    const reminderId = parsePositiveInt(reminderIdParam);

    if (!reminderId) {
      return jsonError("Invalid reminder ID", 400);
    }

    const reminder = await getOwnedReminder(reminderId, session.user.id);
    if (!reminder) {
      return jsonError("Reminder not found", 404);
    }

    await prisma.reminder.delete({
      where: {
        id: reminderId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete reminder:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
