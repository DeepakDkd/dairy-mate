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
        const isBuyerExist = await prisma.user.findFirst({
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
        

        if (isBuyerExist) {
            return NextResponse.json(
                { message: "This phone/email already exists in this dairy" },
                { status: 400 }
            );
        }

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