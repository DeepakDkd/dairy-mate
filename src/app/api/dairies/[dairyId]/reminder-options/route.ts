import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { jsonError, parsePositiveInt, requireOwnedDairy } from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = parsePositiveInt(dairyIdParam);

    if (!dairyId) {
      return jsonError("Invalid dairy ID", 400);
    }

    const access = await requireOwnedDairy(session, dairyId);
    if (!access.ok) {
      return access.response;
    }

    const users = await prisma.user.findMany({
      where: {
        dairyId,
        role: {
          in: ["BUYER", "SELLER"],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: [{ role: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
    });

    return NextResponse.json(
      {
        buyers: users
          .filter((user) => user.role === "BUYER")
          .map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
          })),
        sellers: users
          .filter((user) => user.role === "SELLER")
          .map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
          })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch reminder options:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
