import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { getBuyerPortalHistory } from "@/lib/party-history";
import { PortalAccountHistoryTable } from "@/components/portal/portal-account-history-table";
import { PortalAccountActions } from "@/components/portal/portal-account-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatMoney = (value: number) => `Rs ${Number(value).toLocaleString("en-IN")}`;
export default async function BuyerPortalPage() {
  const user = await getServerActionUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "BUYER") {
    redirect("/portal/owner/dairies");
  }

  const data = await getBuyerPortalHistory(user.id);

  if (!data) {
    redirect("/portal");
  }

  const currentBalance = data.buyer.accountBalance?.currentBalance ?? 0;
  const balanceLabel =
    currentBalance > 0 ? "Amount to pay" : currentBalance < 0 ? "Advance in account" : "Settled";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Buyer Portal</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {data.buyer.firstName}. Your account history and milk supply records are shown below.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Dairy: {data.buyer.dairy?.name || "No dairy assigned"}
          </p>
        </div>
        <PortalAccountActions />
      </div>

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
        <CardHeader>
          <CardTitle>Dairy Contact Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="mt-1 text-sm">{data.buyer.dairy?.address || "Not available"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <p className="mt-1 text-sm">{data.buyer.dairy?.phone || "Not available"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="mt-1 text-sm">{data.buyer.dairy?.email || "Not available"}</p>
          </div>
        </CardContent>
      </Card>
      <PortalAccountHistoryTable
        title="Account History"
        emptyLabel="No account history found for this month."
        showMonthlySummary
      />
    </div>
  );
}
