import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { parsePositiveInt } from "@/lib/api-access";
import { authOptions } from "@/lib/auth";
import { getOwnedDairy } from "@/lib/owner-dairies";

export async function GET(
  _request: Request,
  context: { params: Promise<{ dairyId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (session.user.role !== "OWNER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { dairyId: dairyIdParam } = await context.params;
    const dairyId = parsePositiveInt(dairyIdParam);

    if (!dairyId) {
      return NextResponse.json({ message: "Invalid dairy ID" }, { status: 400 });
    }

    const dairy = await getOwnedDairy(session.user.id, dairyId);

    if (!dairy) {
      return NextResponse.json({ message: "Dairy not found" }, { status: 404 });
    }

    return NextResponse.json({ dairy }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch dairy overview:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
