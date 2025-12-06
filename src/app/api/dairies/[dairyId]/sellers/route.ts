import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { dairyId: string } }
) {
  try {
    const dairyId = Number(params.dairyId);

    if (isNaN(dairyId)) {
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

    console.log("Fetching sellers for dairyId:", dairyId, {
      page,
      limit,
      sort,
      search,
    });

    const sellers = await prisma.user.findMany({
      where: {
        role: "SELLER",
        dairyId,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }, include: {
        accountBalance: true,
        sellerEntries: true
      },
      orderBy,
      skip,
      take: limit,
    });

    const totalSellers = await prisma.user.count({
      where: {
        role: "SELLER",
        dairyId,
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
    });

    return NextResponse.json(
      {
        data: sellers,
        total: totalSellers,
        page,
        pageSize: limit,
        message: "Sellers fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch sellers", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
