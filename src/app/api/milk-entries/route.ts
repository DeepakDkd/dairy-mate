// import { db } from "@/lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { NextResponse } from "next/server";
// import { z } from "zod";

// const milkEntrySchema = z.object({
//   date: z.string(),
//   shift: z.enum(["MORNING", "EVENING"]),
//   milkQuantity: z.number().positive(),
//   mawaWeightPerLitre: z.number().positive(),
//   ratePerLitre: z.number().positive(),
//   totalAmount: z.number().positive(),
//   remarks: z.string().optional(),
// });

// export async function POST(request: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return new NextResponse("Unauthorized", { status: 401 });
//   }

//   try {
//     const json = await request.json();
//     const body = milkEntrySchema.parse(json);

//     const milkEntry = await db.milkEntry.create({
//       data: {
//         ...body,
//         customerId: session.user.id,
//         date: new Date(body.date),
//       },
//     });

//     // Create a transaction record for this milk entry
//     await db.customerTransaction.create({
//       data: {
//         date: milkEntry.date,
//         remarks: `Milk entry for ${milkEntry.shift.toLowerCase()} shift`,
//         milkQuantity: milkEntry.milkQuantity,
//         ratePerLitre: milkEntry.ratePerLitre,
//         totalAmount: milkEntry.totalAmount,
//         transactionType: "MILK_ENTRY",
//         customerId: session.user.id,
//         balanceAfter: session.user.customerType === "SELLER" 
//           ? session.user.balanceAmount + milkEntry.totalAmount
//           : session.user.balanceAmount - milkEntry.totalAmount,
//       },
//     });

//     // Update user's balance
//     await db.user.update({
//       where: { id: session.user.id },
//       data: {
//         balanceAmount: {
//           [session.user.customerType === "SELLER" ? "increment" : "decrement"]: milkEntry.totalAmount,
//         },
//       },
//     });

//     return NextResponse.json(milkEntry);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return new NextResponse("Invalid request data", { status: 422 });
//     }
    
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }

// export async function GET(request: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return new NextResponse("Unauthorized", { status: 401 });
//   }

//   try {
//     const { searchParams } = new URL(request.url);
//     const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
//     const date = new Date(dateStr);
//     const startOfDay = new Date(date.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(date.setHours(23, 59, 59, 999));

//     const milkEntries = await db.milkEntry.findMany({
//       where: {
//         customerId: session.user.role === "ADMIN" ? undefined : session.user.id,
//         date: {
//           gte: startOfDay,
//           lte: endOfDay,
//         },
//       },
//       include: {
//         customer: {
//           select: {
//             name: true,
//             mobile: true,
//             customerType: true,
//           },
//         },
//       },
//       orderBy: {
//         date: "desc",
//       },
//     });

//     return NextResponse.json(milkEntries);
//   } catch (error) {
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }