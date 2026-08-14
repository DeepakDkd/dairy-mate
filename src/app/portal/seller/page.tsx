import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { getSellerPortalHistory } from "@/lib/party-history";
import { PortalAccountHistoryTable } from "@/components/portal/portal-account-history-table";
import { PortalAccountActions } from "@/components/portal/portal-account-actions";
import { BalanceHelpTooltip } from "@/components/portal/balance-help-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatMoney = (value: number) => `Rs ${Number(value).toLocaleString("en-IN")}`;

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
  
  // Color-coded styling variables based on balance
  let balanceColorClass = "text-muted-foreground";
  let balanceBgClass = "bg-muted/10 border-border/80";
  let balanceLabel = "Settled";
  
  if (currentBalance < 0) {
    // Owner owes seller money
    balanceColorClass = "text-amber-600 dark:text-amber-400";
    balanceBgClass = "bg-amber-500/[0.03] border-amber-500/20";
    balanceLabel = "Amount to receive";
  } else if (currentBalance > 0) {
    // Seller has taken an advance
    balanceColorClass = "text-blue-600 dark:text-blue-400";
    balanceBgClass = "bg-blue-500/[0.03] border-blue-500/20";
    balanceLabel = "Advance received";
  }

  const balanceHelpText =
    currentBalance < 0
      ? "The dairy still needs to pay you this amount."
      : currentBalance > 0
        ? "You have already received extra money in advance from the dairy."
        : "Your account is settled. Nothing is pending to receive or return right now.";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight">Seller Portal</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Welcome back, <strong className="text-foreground capitalize">{data.seller.firstName}</strong>. Your account history and milk collection details are shown below.
          </p>
          <p className="mt-1 text-xs text-muted-foreground font-semibold">
            Dairy Business: <span className="text-primary font-bold">{data.seller.dairy?.name || "No dairy assigned"}</span>
          </p>
        </div>
        <PortalAccountActions />
      </div>

      {/* Grid: Balance Card & Contact Card side-by-side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Balance Card */}
        <Card className={`border rounded-2xl shadow-sm ${balanceBgClass}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current Account Balance
              <BalanceHelpTooltip content={balanceHelpText} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-black tracking-tight ${balanceColorClass}`}>
              {formatMoney(Math.abs(currentBalance))}
            </p>
            <p className="mt-1.5 text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${
                currentBalance < 0 ? "bg-amber-500" : currentBalance > 0 ? "bg-blue-500" : "bg-muted-foreground/50"
              }`} />
              {balanceLabel}
            </p>
          </CardContent>
        </Card>

        {/* Dairy Contact Details Card */}
        <Card className="border border-border/80 rounded-2xl shadow-sm bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dairy Business Contact Info
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address</p>
              <p className="mt-1 text-xs font-semibold text-foreground break-words">{data.seller.dairy?.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone</p>
              <p className="mt-1 text-xs font-semibold text-foreground break-words">{data.seller.dairy?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="mt-1 text-xs font-semibold text-foreground break-words">{data.seller.dairy?.email || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <PortalAccountHistoryTable
        title="Account Collection History"
        emptyLabel="No account ledger transactions found for this month."
        showMonthlySummary
      />
    </div>
  );
}
