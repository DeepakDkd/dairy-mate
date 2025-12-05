import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const hashedPassword = bcrypt.hashSync(body.password, 10);
        
        const isUserExist = await prisma.dairy.findFirst({
            where: {
                owner: {
                    phone: body.phone
                }
            }
        })
        if (isUserExist) {
            return NextResponse.json(
                { message: "This phone number already exists" },
                { status: 400 }
            );
        }
        const isSellerExist = await prisma.user.findFirst({
            where: {
                OR: [
                    {
                        phone: body.phone,
                        dairyId: body.dairyId,
                    },
                    {
                        email: body.email,
                        dairyId: body.dairyId,
                    },
                ],
            },
        });

        if (isSellerExist) {
            return NextResponse.json(
                { message: "This phone/email already exists in this dairy" },
                { status: 400 }
            );
        }

        const newSeller = await prisma.user.create({
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
        // send this seller credentials to the email
        return NextResponse.json(
            { message: "Seller created successfully", data: { ...newSeller, password: body.null } },
            { status: 201 }
        )

    } catch (error) {
        console.error("Error creating seller:", error);
        return NextResponse.json(
            { message: "Internal server error", error: (error as Error).message },
            { status: 500 }
        );

    }
}