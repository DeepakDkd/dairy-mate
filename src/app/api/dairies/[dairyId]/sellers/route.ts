import { prisma } from "@/lib/db";
import { getPagination } from "@/utils/pagination";
import { getUserSearchFilter } from "@/utils/search";
import { getUserSort } from "@/utils/sort";
import { calculateSellerStats } from "@/utils/stats";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { dairyId: string } }
) {
  try {
    const dairyId = Number(params.dairyId);
    if (isNaN(dairyId)) {
      return NextResponse.json({ message: "Invalid dairy ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);

    const { page, pageSize, skip, take } = getPagination(searchParams);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "createdAt_desc";

    const searchFilter = getUserSearchFilter(search);
    const orderBy = getUserSort(sort);

    
    const sellers = await prisma.user.findMany({
      where: {
        role: "SELLER",
        dairyId,
        ...searchFilter,
      },
      include: {
        accountBalance: true,
      },
      orderBy,
      skip,
      take,
    });

    
    const total = await prisma.user.count({
      where: {
        role: "SELLER",
        dairyId,
        ...searchFilter,
      },
    });

    
    const allEntries = await prisma.sellerEntry.findMany({
      where: { dairyId },
      select: {
        litres: true,
        rate: true,
        date: true,
      },
    });

    const stats = calculateSellerStats(allEntries);

    return NextResponse.json(
      {
        data: sellers,
        total,
        page,
        pageSize,
        ...stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch sellers:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
