import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

import { getMonthFromSearchParams } from "@/utils/month";
import { getPagination } from "@/utils/pagination";

// get all milk entires
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
        const { page, pageSize, skip, take } = getPagination(searchParams);
        const selectedMonth = getMonthFromSearchParams(searchParams);


        const entries = await prisma.buyerEntry.findMany({
            where: {
                dairyId: dairyIdNum,
                date: {
                    gte: selectedMonth.start,
                    lt: selectedMonth.end,
                },
            },
            include: {
                buyer: true,
                dairy: true
            },
            orderBy: {
                date: "desc",
            },
            skip,
            take,
        })
        const totalEntries = await prisma.buyerEntry.count({
            where: {
                dairyId: dairyIdNum,
                date: {
                    gte: selectedMonth.start,
                    lt: selectedMonth.end,
                },
            }
        }) || 0;

        return NextResponse.json(
            {
                entries,
                totalEntries,
                page,
                pageSize,
                totalPages: Math.ceil(totalEntries / pageSize),
                selectedMonth: selectedMonth.value,
                monthLabel: selectedMonth.label,
            },
            { status: 200 }
        )

    } catch (error) {
        console.log("Failed to get milk entries : ", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })

    }
}
