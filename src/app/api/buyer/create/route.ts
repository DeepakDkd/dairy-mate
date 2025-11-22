import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const hashedPassword = bcrypt.hashSync(body.password, 10);

        const newBuyer = await prisma.user.create({
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phone: body.phone,
                address: body.address,
                password: hashedPassword,
                dairyId: body.dairyId,
                status: body.status,
                role: body.role,
            }
        });
        console.log("New buyer created:", newBuyer);
        // send this buyer credentials to the email
        return NextResponse.json(
            { message: "Buyer created successfully", data: { ...newBuyer, password: body.null } },
            { status: 201 }
        )

    } catch (error) {
        console.error("Error creating buyer:", error);
        return NextResponse.json(
            { message: "Internal server error", error: (error as Error).message },
            { status: 500 }
        );

    }
}