import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
     const {
      phone,
      password,
      confirmPassword,
      firstName,
      lastName,
      role,
      address,
      email,

      // Dairy fields (only for OWNER)
      dairyName,
      dairyAddress,
      dairyEmail,
      dairyPhone,
      dairyMode,
    } = body;

    if (!phone || !password || !firstName || !lastName || !address || !role || !email) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

      if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
         { message: "Phone number already registered" },
        { status: 400 }
      );
    }


     const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email already registered" },
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
        role,
        password: hashedPassword,
        address,
      },
    });
    
    console.log("User created:", newUser.id);

      if (role === "OWNER") {
      if (!dairyName || !dairyMode) {
        return NextResponse.json(
          { message: "Dairy name & pricing mode are required for owners" },
          { status: 400 }
        );
      }

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

      console.log("Dairy created:", dairy.id);
    }

    return NextResponse.json(
      { message: "User registration successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
