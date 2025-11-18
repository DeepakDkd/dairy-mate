// import { db } from "@/lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { NextResponse } from "next/server";
// import { z } from "zod";

// const transactionSchema = z.object({
//   date: z.string(),
//   remarks: z.string().optional(),
//   paidAmount: z.number().positive(),
// });

// export async function POST(request: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return new NextResponse("Unauthorized", { status: 401 });
//   }

//   try {
//     const json = await request.json();
//     const body = transactionSchema.parse(json);

//     const user = await db.user.findUnique({
//       where: { id: session.user.id },
//       select: { balanceAmount: true },
//     });

//     if (!user) {
//       return new NextResponse("User not found", { status: 404 });
//     }

//     const transaction = await db.customerTransaction.create({
//       data: {
//         date: new Date(body.date),
//         remarks: body.remarks,
//         paidAmount: body.paidAmount,
//         transactionType: "PAYMENT",
//         customerId: session.user.id,
//         balanceAfter: user.balanceAmount - body.paidAmount,
//       },
//     });

//     // Update user's balance
//     await db.user.update({
//       where: { id: session.user.id },
//       data: {
//         balanceAmount: { decrement: body.paidAmount },
//       },
//     });

//     return NextResponse.json(transaction);
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
//     const dateStr = searchParams.get("date");
//     const startDate = dateStr ? new Date(dateStr) : new Date();
//     startDate.setHours(0, 0, 0, 0);
    
//     const endDate = new Date(startDate);
//     endDate.setHours(23, 59, 59, 999);

//     const transactions = await db.customerTransaction.findMany({
//       where: {
//         customerId: session.user.role === "ADMIN" ? undefined : session.user.id,
//         date: {
//           gte: startDate,
//           lte: endDate,
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

//     return NextResponse.json(transactions);
//   } catch (error) {
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }