import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SellerPortalPage() {
  const user = await getServerActionUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "SELLER") {
    redirect("/portal/owner/dairies");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [seller, monthlyStats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: {
        dairy: {
          select: {
            id: true,
            name: true,
          },
        },
        accountBalance: true,
        sellerEntries: {
          orderBy: {
            date: "desc",
          },
          take: 10,
        },
      },
    }),
    prisma.sellerEntry.aggregate({
      where: {
        sellerId: user.id,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        litres: true,
        totalAmount: true,
      },
    }),
  ]);

  if (!seller) {
    redirect("/portal");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Seller Portal</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {seller.firstName}. You can review only your own milk collection data here.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Dairy: {seller.dairy?.name || "No dairy assigned"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs {seller.accountBalance?.currentBalance?.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Monthly Litres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {monthlyStats._sum.litres?.toFixed(2) ?? "0.00"} L
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Monthly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs {monthlyStats._sum.totalAmount?.toFixed(2) ?? "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Milk Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Litres</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seller.sellerEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No milk entries yet.
                  </TableCell>
                </TableRow>
              ) : (
                seller.sellerEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.shift}</Badge>
                    </TableCell>
                    <TableCell>{entry.litres}</TableCell>
                    <TableCell>Rs {entry.rate.toFixed(2)}</TableCell>
                    <TableCell>Rs {entry.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
