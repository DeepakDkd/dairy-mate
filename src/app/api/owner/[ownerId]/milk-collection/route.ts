import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request:Request, context:{params:Promise<{ownerId:string}>}) {
  try {
    const {ownerId }= await context.params;
    const ownerIdNum = Number(ownerId)
    if (isNaN(ownerIdNum)) {
      return NextResponse.json({ message: "Invalid owner ID" }, { status: 400 });
    }

    const owner = await prisma.user.findFirst({
      where: { id: ownerIdNum },
      include: {
        ownedDairies: {
          include: {
            sellerEntries: true
          }
        }
      }
    });

    if (!owner) {
      return NextResponse.json(
        { message: "Owner not found" },
        { status: 404 }
      );
    }

    const dairies = owner.ownedDairies;

const allEntries = dairies.flatMap(d => d.sellerEntries);


const last7Days = [...Array(7)].map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i); 
  return {
    day: date.toLocaleString("en-US", { weekday: "short" }),
    dateString: date.toISOString().split("T")[0],
    litres: 0
  };
}).reverse();


for (let entry of allEntries) {
  const entryDate = new Date(entry.date);
  const entryDayString = entryDate.toISOString().split("T")[0];

  const match = last7Days.find(day => day.dateString === entryDayString);
  if (match) {
    match.litres += entry.litres;
  }
}
return NextResponse.json({ last7Days }, { status: 200 });


  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
