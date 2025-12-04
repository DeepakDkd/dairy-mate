import { prisma } from "@/lib/db";
import { verifyOtp } from "@/utils/otp";
import { signIn } from "next-auth/react";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { phone, otp, requestId } = await req.json();
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

        if (otpRequest.expiresAt < new Date()) {
            return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
        }
        const isValid = await verifyOtp(otp, otpRequest.otp, otpRequest.salt);
        if (isValid) {


            // is user is owner of any dairy
            const owner = await prisma.dairy.findFirst({
                where: {
                    owner: {
                        phone: phone,
                        role: "OWNER",
                    }
                }
            })

            if (owner) {
                await signIn("credentials", {
                    redirect: false,
                    phone,
                    role: "OWNER",
                });
                return NextResponse.json({ success: true, message: "OTP verified successfully", owner }, { status: 200 });
            }

            const dairies = await prisma.dairy.findMany({
                where: {
                    users: {
                        some: {
                            phone: phone,
                        }
                    }
                }
            });
            return NextResponse.json({ success: true, message: "OTP verified successfully", dairies }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error in verify-otp route:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}