import { prisma } from "@/lib/db";
import { generateOtpEmail } from "@/templates/email/otp";
import { sendEmail } from "@/utils/email";
import { generateOtp, generateSalt, hashOtp } from "@/utils/otp";
import { request } from "http";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { phone } = await req.json();
    try {
        if (!phone) {
            return NextResponse.json(
                { message: "Phone number is required" },
                { status: 400 }
            );
        }
        const user = await prisma.user.findFirst({
            where: {
                phone,
            }
        });
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }
        const otp = generateOtp();
        const salt = generateSalt();
        const hashedOtp = hashOtp(otp, salt);
        const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

        const res = await prisma.otpRequest.create({
            data: {
                phone,
                email: user.email,
                otp: hashedOtp,
                salt,
                userId: user.id,
                expiresAt: expiry,
            }
        })

        const { html, text } = generateOtpEmail(otp, 5, "Dairy Mate");

        await sendEmail({
            to: user.email,
            subject: "Your OTP Code for Dairy Mate",
            html,
            text,
        })

        return NextResponse.json(
            { success: true, message: "OTP sent successfully", requestId: res.id },
            { status: 200 }
        );



    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}