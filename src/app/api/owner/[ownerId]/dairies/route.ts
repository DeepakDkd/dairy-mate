import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ ownerId: string }> }
) {
  try {
    const params = await context.params;
    const ownerId = Number(params.ownerId);

    if (isNaN(ownerId)) {
      return NextResponse.json(
        { message: "Invalid owner ID" },
        { status: 400 }
      );
    }

    
    const owner = await prisma.user.findUnique({
      where: { id: ownerId, role: "OWNER" },
      select: { id: true },
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Owner not found" },
        { status: 404 }
      );
    }

    
    const dairies = await prisma.dairy.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        address: true,

        users: {
          select: { role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    
    const formatted = dairies.map((dairy) => {
      const sellers = dairy.users.filter(u => u.role === "SELLER").length;
      const buyers = dairy.users.filter(u => u.role === "BUYER").length;
      const staff = dairy.users.filter(u => u.role === "STAFF").length;

      return {
        id: dairy.id,
        name: dairy.name,
        address: dairy.address,
        stats: {
          sellers,
          buyers,
          staff,
        },
      };
    });
    

    return NextResponse.json(
      { dairies: formatted },
      { status: 200 }
    );

  } catch (error) {
    console.error("Failed to fetch owner dairies", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
