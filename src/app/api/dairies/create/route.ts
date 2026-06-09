import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreateDairySchema } from "@/lib/validators/dairy";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "OWNER") {
      return jsonError("Forbidden", 403);
    }

    const body = await req.json();
    const parsed = CreateDairySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid dairy details", 400);
    }

    const {
      dairyName,
      dairyAddress,
      dairyEmail,
      dairyPhone,
      dairyMode,
    } = parsed.data;

    const normalizedEmail = dairyEmail?.trim() || null;

    if (normalizedEmail) {
      const existingDairy = await prisma.dairy.findFirst({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (existingDairy) {
        return jsonError("A dairy with this email already exists", 400);
      }
    }

    const newDairy = await prisma.dairy.create({
      data: {
        name: dairyName,
        address: dairyAddress,
        email: normalizedEmail,
        phone: dairyPhone,
        pricingMode: dairyMode,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Dairy created successfully", dairy: newDairy },
      { status: 201 }
    );
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return jsonError("A dairy with this email already exists", 400);
    }

    console.error("Error creating dairy:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
