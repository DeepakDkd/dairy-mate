import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { otp, requestId } = await req.json();
        if (!otp || !requestId) {
            return NextResponse.json({ message: "OTP and Request ID are required" }, { status: 400 });
        }
        const otpRequest = await prisma.otpRequest.findUnique({
            where: {
                id: requestId,
            },
        });
        if (!otpRequest) {
            return NextResponse.json({ message: "Invalid OTP request" }, { status: 404 });
        }

        if(otpRequest.expiresAt < new Date()) {
            return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
        }
        const isValid = await verifyOtp(otp, otpRequest.otp, otpRequest.salt);
        // if(otpRequest.otp !== ) {
    } catch (error) {
        console.error("Error in verify-otp route:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}