import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        mobile: true,
        role: true,
        customerType: true,
        balanceAmount: true,
        address: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}