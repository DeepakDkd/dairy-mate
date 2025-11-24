import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const hashedPassword = bcrypt.hashSync(body.password, 10);

        const newStaff = await prisma.user.create({
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
        console.log("Created")
        console.log(newStaff)
        const profile = await prisma.staffProfile.create({
            data: {
                userId: newStaff.id,
                dairyId: body.dairyId!,
                shift: body.shift,
                position: body.position,
                salary: body.salary,
                joinDate: body.joinDate,
                emergencyContact: body?.emergencyContact,
                photoUrl: body?.photoUrl,
                notes: body?.notes

            }
        });
        console.log("Staff profile created", profile)


        // send this seller credentials to the email
        const finalProfile = {
            ...newStaff,
            password:null,
            ...profile
        }
        return NextResponse.json(
            { message: "Seller created successfully", finalProfile  },
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