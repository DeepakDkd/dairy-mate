import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST(req: Request) {
    const { phone, password, role } = await req.json();
    try {

        if (!phone) {
            return NextResponse.json(
                { message: "Phone number is required" },
                { status: 400 }
            );
        }

        if (phone && password && role === "OWNER") {



            const user = await prisma.user.findFirst({
                where: {
                    phone,
                    role: { in: ["OWNER", "STAFF"] }
                },
            })
            console.log("User found ( owner/staff):", user);
            if (!user) {
                return NextResponse.json(
                    { message: "User not found ( owner/staff)" },
                    { status: 404 }
                );
            }
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return NextResponse.json(
                    { message: "Invalid password" },
                    { status: 401 }
                );
            }
            return NextResponse.json(
                { success: true ,role},
                { status: 200 }
            );
        } else if (phone && !password && (role === "BUYER" || role === "SELLER")) {
            const user = await prisma.user.findFirst({
                where: {
                    phone,
                    role: { in: ["BUYER", "SELLER"] }
                },
            })
            console.log("User found ( buyer/seller):", user);
            if (!user) {
                return NextResponse.json(
                    { message: "User not found ( buyer/seller)" },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { success: true },
                { status: 200 }
            );
        }
        else {
            return NextResponse.json(
                { success: false, message: "Invalid role or missing password" },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}