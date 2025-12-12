import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ dairyId: string }> }) {
    try {
        const { dairyId } = await context.params;
        const dairyIdNum = Number(dairyId)
        if (isNaN(dairyIdNum)) {
            return NextResponse.json(
                { message: "Invalid dairy ID" },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("pageSize") || 10);
        const search = searchParams.get("search") || "";
        const sort = searchParams.get("sort") || "createdAt_desc";

        const skip = (page - 1) * limit;

        // Handle sort options safely
        const sortMap: Record<string, any> = {
            name_asc: { firstName: "asc" },
            name_desc: { firstName: "desc" },
            createdAt_asc: { createdAt: "asc" },
            createdAt_desc: { createdAt: "desc" },
        };

        const orderBy = sortMap[sort] || { createdAt: "desc" };


        const entries = await prisma.sellerEntry.findMany({
            where: {
                dairyId: dairyIdNum,
                // seller: {
                //     OR: [
                //         { firstName: { contains: search, mode: "insensitive" } },
                //         { lastName: { contains: search, mode: "insensitive" } },
                //         { email: { contains: search, mode: "insensitive" } },
                //     ],
                // }
            },
            include: {
                seller: true,
                dairy: true
            },
            // orderBy,
            // skip,
            // take: limit,
        })
        if (!entries) {
            return NextResponse.json({ message: "No entries found", status: 404 })
        }
        const totalEntries = await prisma.sellerEntry.count({
            where: {
                dairyId: dairyIdNum
            }
        }) || 0;

        // console.log("Entries :: ", entries)
        return NextResponse.json({ entries, totalEntries }, { status: 200 })

    } catch (error) {
        console.log("Failed to get milk entries : ", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })

    }
}