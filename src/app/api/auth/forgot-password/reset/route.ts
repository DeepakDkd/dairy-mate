import { prisma } from "@/lib/db";
import { verifyOtp } from "@/utils/otp";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, otp, requestId, newPassword } = await req.json();

    if (!phone || !otp || !requestId || !newPassword) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const otpRequest = await prisma.otpRequest.findUnique({
      where: {
        id: Number(requestId),
      },
    });

    if (!otpRequest || otpRequest.phone !== phone) {
      return NextResponse.json(
        { message: "Invalid verification request details" },
        { status: 404 }
      );
    }

    if (otpRequest.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Verification code has expired" },
        { status: 400 }
      );
    }

    const isValid = await verifyOtp(otp, otpRequest.otp, otpRequest.salt);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Find the owner or staff user record to reset password
    const user = await prisma.user.findFirst({
      where: {
        phone,
        role: { in: ["OWNER", "STAFF"] },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Account not found for Owner or Staff with this phone number" },
        { status: 404 }
      );
    }

    // Hash new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the OTP request so it cannot be reused
    await prisma.otpRequest.delete({
      where: {
        id: otpRequest.id,
      },
    }).catch((err) => console.error("Error deleting used OTP Request:", err));

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password reset error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
