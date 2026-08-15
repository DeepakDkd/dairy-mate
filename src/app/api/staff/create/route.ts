import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const isOwner = session.user.role === "OWNER";
        const isManager = session.user.role === "STAFF" && session.user.staffRole === "MANAGER";

        if (!isOwner && !isManager) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        if (isManager && session.user.dairyId !== body.dairyId) {
            return NextResponse.json({ message: "Forbidden: Cannot create staff for another dairy" }, { status: 403 });
        }

        if (isOwner) {
            const ownedDairy = await prisma.dairy.findFirst({
                where: {
                    id: body.dairyId,
                    ownerId: session.user.id,
                }
            });
            if (!ownedDairy) {
                return NextResponse.json({ message: "Forbidden: Dairy not owned by you" }, { status: 403 });
            }
        }

        const hashedPassword = bcrypt.hashSync(body.password, 10);

        const isUserExist = await prisma.dairy.findFirst({
            where: {
                owner: {
                    phone: body.phone
                }
            }
        });
        if (isUserExist) {
            return NextResponse.json(
                { message: "This phone number already exists" },
                { status: 400 }
            );
        }
        const isStaffExist = await prisma.user.findFirst({
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

        if (isStaffExist) {
            return NextResponse.json(
                { message: "This phone/email already exists in this dairy" },
                { status: 400 }
            );
        }
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
                role: body.role || "STAFF",
            }
        });
        console.log("Created", newStaff);
        const profile = await prisma.staffProfile.create({
            data: {
                userId: newStaff.id,
                dairyId: body.dairyId!,
                role: body.staffRole || "HELPER",
                shift: body.shift,
                position: body.position,
                salary: body.salary,
                joinDate: body.joinDate ? new Date(body.joinDate) : new Date(),
                emergencyContact: body?.emergencyContact,
                photoUrl: body?.photoUrl,
                notes: body?.notes

            }
        });
        console.log("Staff profile created", profile);

        const finalProfile = {
            ...newStaff,
            password: null,
            ...profile
        };
        return NextResponse.json(
            { message: "Staff created successfully", finalProfile },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error creating staff:", error);
        return NextResponse.json(
            { message: "Internal server error", error: (error as Error).message },
            { status: 500 }
        );

    }
}