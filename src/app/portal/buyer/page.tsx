import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { getBuyerPortalHistory } from "@/lib/party-history";
import { PortalAccountHistoryTable } from "@/components/portal/portal-account-history-table";
import { PortalAccountActions } from "@/components/portal/portal-account-actions";
import { BalanceHelpTooltip } from "@/components/portal/balance-help-tooltip";
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
  
  // Color-coded styling variables based on balance for Buyers
  let balanceColorClass = "text-muted-foreground";
  let balanceBgClass = "bg-muted/10 border-border/80";
  let balanceLabel = "Settled";
  
  if (currentBalance > 0) {
    // Buyer owes money to dairy (Receivable)
    balanceColorClass = "text-emerald-600 dark:text-emerald-400";
    balanceBgClass = "bg-emerald-500/[0.03] border-emerald-500/20";
    balanceLabel = "Amount to pay";
  } else if (currentBalance < 0) {
    // Buyer paid extra in advance
    balanceColorClass = "text-blue-600 dark:text-blue-400";
    balanceBgClass = "bg-blue-500/[0.03] border-blue-500/20";
    balanceLabel = "Advance in account";
  }

  const balanceHelpText =
    currentBalance > 0
      ? "You still need to pay this amount to the dairy."
      : currentBalance < 0
        ? "You have already paid extra. This amount is kept as advance in your account."
        : "Your account is settled. No payment is pending right now.";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl tracking-tight">Buyer Portal</h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Welcome back, <strong className="text-foreground capitalize">{data.buyer.firstName}</strong>. Your account history and milk supply records are shown below.
          </p>
          <p className="mt-1 text-xs text-muted-foreground font-semibold">
            Dairy Business: <span className="text-primary font-bold">{data.buyer.dairy?.name || "No dairy assigned"}</span>
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
                currentBalance > 0 ? "bg-emerald-500" : currentBalance < 0 ? "bg-blue-500" : "bg-muted-foreground/50"
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
              <p className="mt-1 text-xs font-semibold text-foreground break-words">{data.buyer.dairy?.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone</p>
              <p className="mt-1 text-xs font-semibold text-foreground break-words">{data.buyer.dairy?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="mt-1 text-xs font-semibold text-foreground break-words">{data.buyer.dairy?.email || "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <PortalAccountHistoryTable
        title="Account Supply History"
        emptyLabel="No account ledger transactions found for this month."
        showMonthlySummary
      />
    </div>
  );
}
