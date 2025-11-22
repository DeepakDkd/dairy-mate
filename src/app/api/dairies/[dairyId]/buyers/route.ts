import { getServerActionUser } from "@/fetchers/user/action";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { dairyId: string } }) {
    try {

        const { dairyId } = context.params;
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("pageSize") || "10";
        const sort = searchParams.get("sort") || "createdAt";
        const search = searchParams.get("search") || "";

        const skip = (parseInt(page) - 1) * parseInt(limit);

        console.log("Fetching buyers for dairyId:", dairyId, { page, limit, sort, search });

        let orderBy = {};
        if (sort === "name_asc") orderBy = { firstName: "asc" }
        else if (sort === "name_desc") orderBy = { firstName: "desc" }
        else if (sort === "createdAt_asc") orderBy = { createdAt: "asc" }
        else if (sort === "createdAt_desc") orderBy = { createdAt: "desc" }

        const buyers = await prisma.user.findMany({
            where: {
                role: "BUYER",
                dairyId: parseInt(dairyId),
                OR: [
                    {
                        firstName: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        lastName: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                    {
                        email: {
                            contains: search,
                            mode: "insensitive"
                        }
                    },
                ]
            },
            orderBy: orderBy,
            skip: skip,
            take: parseInt(limit),
        });
        console.log("Buyers fetched:", buyers);
        const totalBuyers = await prisma.user.count({
            where: {
                role: "BUYER",
                dairyId: parseInt(dairyId),
            }
        });
        if (!buyers) {
            return NextResponse.json({ message: "No buyers found for this dairy" }, {
                status: 404
            })
        }

        // console.log("Buyers fetched for dairyId", dairyId, buyers,totalBuyers);
        return NextResponse.json({ buyers, totalBuyers }, {
            status: 200
        })

    } catch (error) {
        console.log("Failed to get owner's details", error);
        return NextResponse.json({ message: "Internal Server Error", error }, {
            status: 500
        })
    }
}