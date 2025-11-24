import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request, 
  { params }: { params: { dairyId: string } }
) {
  try {
    const dairyId = Number(params.dairyId);

    if (isNaN(dairyId)) {
      return NextResponse.json(
        { message: "Invalid dairy ID" },
        { status: 400 }
      );
    }

    const dairy = await prisma.dairy.findUnique({
      where: { id: dairyId },
      include: {
        users: true,
      },
    });

    if (!dairy) {
      return NextResponse.json(
        { message: "Dairy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { dairy },
      { status: 200 }
    );

  } catch (error) {
    console.error("Failed to get dairy details", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
