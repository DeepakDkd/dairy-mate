import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { dairyId: string } }) {
    try {
        const { dairyId } = context.params;

        const url = new URL(req.url);
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 10;
        const sort = url.searchParams.get("sort") || "name_asc";


        const dairyIdNum = Number(dairyId);
        if (isNaN(dairyIdNum)) {
            return NextResponse.json({ message: "Invalid dairyId" }, { status: 400 });
        }
        const staffData = await prisma.user.findMany({
            where: {
                dairyId: dairyIdNum,
                role: 'STAFF'
            },
            include:{
                staffProfile:true
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: sort === "name_asc" ? { firstName: "asc" } : { firstName: "desc" },
        });
          if(!staffData){
            return NextResponse.json({ message: "No staff found for this dairy" }, { status: 404 });
        }
         const totalStaff = await prisma.user.count({
            where: {
                role: "STAFF",
                dairyId: parseInt(dairyId),
            }
        });
        return NextResponse.json({ staff:staffData, totalStaff }, { status: 200 });
        
    } catch (error:any) {
        console.error("Error fetching dairies:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

