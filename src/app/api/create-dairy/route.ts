import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Creating dairy with data:", body);
    const {
      dairyName,
      dairyAddress,
      dairyEmail,
      dairyPhone,
      dairyMode,
      createdById,
    } = body;
    if (!dairyName || !dairyAddress || !dairyPhone || !dairyEmail || !dairyMode || !createdById) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }
    const newDairy = await prisma.dairy.create({
      data: {
        name: dairyName,
        address: dairyAddress,
        email: dairyEmail,
        phone: dairyPhone,
        pricingMode: dairyMode,
        ownerId: createdById,
        },
    });

    return NextResponse.json(
      { message: "Dairy created successfully", dairy: newDairy },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating dairy:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}