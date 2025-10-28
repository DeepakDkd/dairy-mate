import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mobile, password } = body;

    if (!mobile || !password) {
      return NextResponse.json(
        { message: "Mobile and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Remove password before sending user data
    const { password: _, ...userData } = user;

    return NextResponse.json(
      { message: "Login successful", user: userData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
