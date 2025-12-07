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
            include: {
                accountBalance: true,
                buyerEntries: true
            },
            orderBy: orderBy,
            skip: skip,
            take: parseInt(limit),
        });
        const buyersOverview = await prisma.user.findMany({
            where: {
                role: "BUYER",
                dairyId: parseInt(dairyId),

            },
            include: {
                accountBalance: true,
                buyerEntries: true
            },
        });

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

        const totalMonthlyLitres = buyersOverview?.reduce((total: number, buyer: any) => {
            const buyerTotalLitres = buyer?.buyerEntries?.reduce((subTotal: number, entry: any) => {
                const entryDate = new Date(entry.date);
                const now = new Date();

                const isSameMonth =
                    entryDate.getMonth() === now.getMonth() &&
                    entryDate.getFullYear() === now.getFullYear();

                if (isSameMonth) {
                    subTotal += entry.litres;
                }
                return subTotal;
            }, 0) || 0;
            total += buyerTotalLitres;
            return total;
        }, 0) || 0;


        const todaysMilkLitres = buyersOverview?.reduce((total: number, buyer: any) => {
            const buyerTotalLitres = buyer?.buyerEntries?.reduce((subTotal: number, entry: any) => {
                const entryDate = new Date(entry.date);
                const now = new Date();


                const isSameDay =
                    entryDate.getDate() === now.getDate() &&
                    entryDate.getMonth() === now.getMonth() &&
                    entryDate.getFullYear() === now.getFullYear();
                if (isSameDay) {
                    subTotal += entry.litres;
                }
                return subTotal;
            }, 0) || 0;
            total += buyerTotalLitres;
            return total;
        }, 0) || 0;


        const totalMonthlyExpense = buyersOverview?.reduce((total: number, buyer: any) => {
            const buyerTotalLitresPrice = buyer?.buyerEntries?.reduce((subTotal: number, entry: any) => {
                const entryDate = new Date(entry.date);
                const now = new Date();

                const isSameMonth =
                    entryDate.getMonth() === now.getMonth() &&
                    entryDate.getFullYear() === now.getFullYear();
                const ratePerLitre = entry?.rate;
                if (isSameMonth) {
                    subTotal += entry.litres * ratePerLitre;
                }
                return subTotal;
            }, 0) || 0;
            total += buyerTotalLitresPrice;
            return total;
        }, 0) || 0;

        return NextResponse.json({ buyers, totalBuyers, totalMonthlyLitres, todaysMilkLitres, totalMonthlyExpense }, {
            status: 200
        })

    } catch (error) {
        console.log("Failed to get owner's details", error);
        return NextResponse.json({ message: "Internal Server Error", error }, {
            status: 500
        })
    }
}