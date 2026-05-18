import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { getSellerPortalHistory } from "@/lib/party-history";
import { PortalAccountActions } from "@/components/portal/portal-account-actions";
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

const formatMoney = (value: number) => `Rs ${Number(value).toLocaleString("en-IN")}`;
const formatLitres = (value: number) => `${Number(value).toFixed(2)} L`;
const formatDateTime = (value: string | Date) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function SellerPortalPage() {
  const user = await getServerActionUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "SELLER") {
    redirect("/portal/owner/dairies");
  }

  const data = await getSellerPortalHistory(user.id);

  if (!data) {
    redirect("/portal");
  }

  const currentBalance = data.seller.accountBalance?.currentBalance ?? 0;
  const balanceLabel =
    currentBalance < 0 ? "Amount to receive" : currentBalance > 0 ? "Advance received" : "Settled";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Seller Portal</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {data.seller.firstName}. Your account history and milk collection details are shown below.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Dairy: {data.seller.dairy?.name || "No dairy assigned"}
          </p>
        </div>
        <PortalAccountActions />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(Math.abs(currentBalance))}</p>
            <p className="mt-1 text-xs text-muted-foreground">{balanceLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Milk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatLitres(data.monthlyStats.litres)}</p>
            <p className="mt-1 text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatMoney(data.monthlyStats.amount)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Milk value this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Entries This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.monthlyStats.entryCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Milk collection records</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dairy Contact Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="mt-1 text-sm">{data.seller.dairy?.address || "Not available"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <p className="mt-1 text-sm">{data.seller.dairy?.phone || "Not available"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="mt-1 text-sm">{data.seller.dairy?.email || "Not available"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No account history yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDateTime(item.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.type === "PAYMENT" ? "Payment" : "Milk Entry"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(item.amount)}</TableCell>
                    <TableCell className="text-right">{formatMoney(Math.abs(item.balanceAfter))}</TableCell>
                    <TableCell>{item.note}</TableCell>
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
