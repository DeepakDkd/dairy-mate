import { prisma } from "@/lib/db";
import { generateOtpEmail } from "@/templates/email/otp";
import { sendEmail } from "@/utils/email";
import { generateOtp, generateSalt, hashOtp } from "@/utils/otp";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Verify user exists and is OWNER or STAFF
    const user = await prisma.user.findFirst({
      where: {
        phone,
        role: { in: ["OWNER", "STAFF"] }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Account not found for Owner or Staff with this phone number" },
        { status: 404 }
      );
    }

    const otp = generateOtp();
    console.log("Forgot Password OTP generated:", otp);
    
    const salt = generateSalt();
    const hashedOtp = hashOtp(otp, salt);
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    const res = await prisma.otpRequest.create({
      data: {
        phone,
        email: user.email,
        otp: hashedOtp,
        salt,
        userId: user.id,
        expiresAt: expiry,
      }
    });

    const { html, text } = generateOtpEmail(otp, 5, "Dairy Mate", "reset");

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request - Dairy Mate",
      html,
      text,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Password reset OTP sent successfully", 
        requestId: res.id,
        email: user.email 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password request error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
