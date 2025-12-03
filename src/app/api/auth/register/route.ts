import { prisma } from "@/app/lib/prisma";
import { RegisterOwnerSchema } from "@/app/lib/validators/registerOwner";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const json = await req.json();

    const parsed = RegisterOwnerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      address,
      dairyName,
      dairyAddress,
      dairyEmail,
      dairyPhone,
      dairyMode,
    } = parsed.data;


    const existingOwnerPhone = await prisma.user.findFirst({
      where: { phone, role: "OWNER" },
    });

    if (existingOwnerPhone) {
      return NextResponse.json(
        { message: "Phone already used by another owner" },
        { status: 400 }
      );
    }

    const existingOwnerEmail = await prisma.user.findFirst({
      where: { email, role: "OWNER" },
    });

    if (existingOwnerEmail) {
      return NextResponse.json(
        { message: "Email already used by another owner" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        role: "OWNER",
        password: hashedPassword,
        address,
      },
    });

    const dairy = await prisma.dairy.create({
      data: {
        ownerId: newUser.id,
        name: dairyName,
        address: dairyAddress,
        email: dairyEmail,
        phone: dairyPhone,
        pricingMode: dairyMode,
      },
    });




    return NextResponse.json(
      {
        message: "Owner & Dairy created successfully",
        userId: newUser.id,
        dairyId: dairy.id,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Owner registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
