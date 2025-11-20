import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { ownerId: string } }
) {
  try {
    const { ownerId } = params;

    if (!ownerId) {
      return NextResponse.json(
        { message: "Owner ID is required" },
        { status: 400 }
      );
    }

    console.log("Fetching dairies for ownerId:", ownerId);

    const owner = await prisma.user.findUnique({
      where: { id: Number(ownerId) },
      select: { ownedDairies: true },
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Owner not found" },
        { status: 404 }
      );
    }

    console.log("Fetched owner dairies:", owner.ownedDairies);

    return NextResponse.json(
      { dairies: owner.ownedDairies },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error fetching dairies:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
