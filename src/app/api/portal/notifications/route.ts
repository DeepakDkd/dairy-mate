import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "BUYER" && session.user.role !== "SELLER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        dairy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }, { id: "desc" }],
      take: 20,
    });

    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    return NextResponse.json({ notifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch portal notifications:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
