import { getOwnerPortalOverview } from "@/lib/owner-dairies";
import { NextResponse } from "next/server";

export async function GET( request:Request,context:{params:Promise<{ownerId:string}>}){
    try{

        const {ownerId}= await context.params;
        const ownerIdNum = Number(ownerId);
        if (isNaN(ownerIdNum)) {
            return NextResponse.json({ message: "Invalid owner ID" }, { status: 400 });
        }

        const overview = await getOwnerPortalOverview(ownerIdNum);

        return NextResponse.json({ overview }, { status: 200 });
    }catch(error){
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}