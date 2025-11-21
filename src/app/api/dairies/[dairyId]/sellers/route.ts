import { getServerActionUser } from "@/fetchers/user/action";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { dairyId: string } }) {
    try {

        const { dairyId } = params;
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("pageSize") || "10";
        const sort = searchParams.get("sort") || "createdAt";
        const search = searchParams.get("search") || "";

        const skip = (parseInt(page) - 1) * parseInt(limit);

        console.log("Fetching sellers for dairyId:", dairyId, { page, limit, sort, search });

        let orderBy = {};
        if (sort === "name_asc") orderBy = { firstName: "asc" }
        else if (sort === "name_desc") orderBy = { firstName: "desc" }
        else if (sort === "createdAt_asc") orderBy = { createdAt: "asc" }
        else if (sort === "createdAt_desc") orderBy = { createdAt: "desc" }

        const sellers = await prisma.user.findMany({
            where: {
                role: "SELLER",
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
        // console.log("Sellers fetched:", sellers);
        const totalSellers = await prisma.user.count({
            where: {
                role: "SELLER",
                dairyId: parseInt(dairyId),
            }
        });
        if (!sellers) {
            return NextResponse.json({ message: "No sellers found for this dairy" }, {
                status: 404
            })
        }

        console.log("Sellers fetched for dairyId", dairyId, sellers,totalSellers);
        return NextResponse.json({ sellers, totalSellers }, {
            status: 200
        })

    } catch (error) {
        console.log("Failed to get owner's details", error);
        return NextResponse.json({ message: "Internal Server Error", error }, {
            status: 500
        })
    }
}