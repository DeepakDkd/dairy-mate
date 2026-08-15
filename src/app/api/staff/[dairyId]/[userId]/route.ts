import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
    req: Request,
    context: { params: Promise<{ dairyId: string; userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { dairyId, userId } = await context.params;
        const dairyIdNum = Number(dairyId);
        const userIdNum = Number(userId);

        if (isNaN(dairyIdNum) || isNaN(userIdNum)) {
            return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
        }

        // Prevent staff from editing themselves
        if (session.user.id === userIdNum) {
            return NextResponse.json({ message: "Forbidden: Cannot edit your own profile" }, { status: 403 });
        }

        // Fetch target user and their staff profile to verify existence and role
        const targetUser = await prisma.user.findFirst({
            where: { id: userIdNum, role: "STAFF" },
            include: { staffProfile: true }
        });

        if (!targetUser) {
            return NextResponse.json({ message: "Staff member not found" }, { status: 404 });
        }

        const isOwner = session.user.role === "OWNER";
        const isManager = session.user.role === "STAFF" && session.user.staffRole === "MANAGER";

        if (!isOwner && !isManager) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        if (isManager && (session.user.dairyId !== dairyIdNum || targetUser.dairyId !== dairyIdNum)) {
            return NextResponse.json({ message: "Forbidden: Manager can only update staff in their own dairy" }, { status: 403 });
        }

        if (isOwner) {
            const ownedDairy = await prisma.dairy.findFirst({
                where: { id: dairyIdNum, ownerId: session.user.id }
            });
            if (!ownedDairy || targetUser.dairyId !== dairyIdNum) {
                return NextResponse.json({ message: "Forbidden: You do not own this dairy or staff doesn't belong to it" }, { status: 403 });
            }
        }

        const body = await req.json();

        // Prepare User update data
        const userUpdateData: any = {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            phone: body.phone,
            address: body.address,
            status: body.status,
        };

        if (body.password) {
            userUpdateData.password = bcrypt.hashSync(body.password, 10);
        }

        // Prepare StaffProfile update data
        const profileUpdateData: any = {
            role: body.staffRole,
            position: body.position,
            salary: body.salary,
            shift: body.shift,
            emergencyContact: body.emergencyContact,
            notes: body.notes,
        };

        if (body.joinDate) {
            profileUpdateData.joinDate = new Date(body.joinDate);
        }

        // Perform updates in a transaction
        const updatedData = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userIdNum },
                data: userUpdateData,
            });

            const profile = await tx.staffProfile.update({
                where: { userId: userIdNum },
                data: profileUpdateData,
            });

            return { ...user, password: null, ...profile };
        });

        return NextResponse.json({ message: "Staff updated successfully", staff: updatedData }, { status: 200 });

    } catch (error: any) {
        console.error("Error updating staff:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ dairyId: string; userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { dairyId, userId } = await context.params;
        const dairyIdNum = Number(dairyId);
        const userIdNum = Number(userId);

        if (isNaN(dairyIdNum) || isNaN(userIdNum)) {
            return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
        }

        // Prevent staff from deleting themselves
        if (session.user.id === userIdNum) {
            return NextResponse.json({ message: "Forbidden: Cannot delete your own profile" }, { status: 403 });
        }

        // Fetch target user to check role & dairy
        const targetUser = await prisma.user.findFirst({
            where: { id: userIdNum, role: "STAFF" }
        });

        if (!targetUser) {
            return NextResponse.json({ message: "Staff member not found" }, { status: 404 });
        }

        const isOwner = session.user.role === "OWNER";
        const isManager = session.user.role === "STAFF" && session.user.staffRole === "MANAGER";

        if (!isOwner && !isManager) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        if (isManager && (session.user.dairyId !== dairyIdNum || targetUser.dairyId !== dairyIdNum)) {
            return NextResponse.json({ message: "Forbidden: Manager can only delete staff in their own dairy" }, { status: 403 });
        }

        if (isOwner) {
            const ownedDairy = await prisma.dairy.findFirst({
                where: { id: dairyIdNum, ownerId: session.user.id }
            });
            if (!ownedDairy || targetUser.dairyId !== dairyIdNum) {
                return NextResponse.json({ message: "Forbidden: You do not own this dairy or staff doesn't belong to it" }, { status: 403 });
            }
        }

        // Perform deletion in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete StaffProfile first
            await tx.staffProfile.deleteMany({
                where: { userId: userIdNum }
            });

            // Delete AccountBalance if exists
            await tx.accountBalance.deleteMany({
                where: { userId: userIdNum }
            });

            // Finally, delete the User
            await tx.user.delete({
                where: { id: userIdNum }
            });
        });

        return NextResponse.json({ message: "Staff deleted successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Error deleting staff:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
