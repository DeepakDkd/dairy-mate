import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Calendar, Milk, Wallet } from "lucide-react";

interface SellerOverviewCardsProps {
  todaysMilkLitres?: number;
  totalMonthlyExpense?: number;
  totalMonthlyLitres?: number;
  sellerBalance?: number;
  activeSellers?: number;
  entriesTodayCount?: number;
  periodEntryCount?: number;
  monthLabel?: string;
  isCurrentMonth?: boolean;
}

const formatLitres = (value: number) =>
  Number(value.toFixed(2)).toLocaleString("en-IN");

const formatMoney = (value: number) =>
  `Rs ${Math.round(Math.abs(value)).toLocaleString("en-IN")}`;

export function SellerOverviewCards({
  todaysMilkLitres = 0,
  totalMonthlyExpense = 0,
  totalMonthlyLitres = 0,
  sellerBalance = 0,
  activeSellers = 0,
  entriesTodayCount = 0,
  periodEntryCount = 0,
  monthLabel = "This Month",
  isCurrentMonth = true,
}: SellerOverviewCardsProps) {
  const balanceStatus =
    sellerBalance > 0 ? "To Receive" : sellerBalance < 0 ? "Advance Paid" : "Settled";
  const balanceBadge =
    sellerBalance > 0 ? "Receivable" : sellerBalance < 0 ? "Advance" : "Settled";
  const balanceBadgeColor =
    sellerBalance > 0
      ? "bg-amber-100 text-amber-800"
      : sellerBalance < 0
        ? "bg-blue-100 text-blue-800"
        : "bg-green-100 text-green-800";

  const cards = [
    {
      title: "Total Milk Collected",
      value: formatLitres(totalMonthlyLitres),
      unit: "Litres",
      subtitle: isCurrentMonth ? "This Month" : monthLabel,
      icon: Milk,
      color: "bg-blue-50",
      iconColor: "text-primary",
    },
    {
      title: "Monthly Seller Payout",
      value: formatMoney(totalMonthlyExpense),
      unit: "Amount",
      badge: `${activeSellers} active sellers`,
      badgeColor: "bg-slate-100 text-slate-700",
      icon: Banknote,
      color: "bg-yellow-50",
      iconColor: "text-accent",
    },
    {
      title: isCurrentMonth ? "Today's Collection" : "Entries In Month",
      value: isCurrentMonth ? formatLitres(todaysMilkLitres) : String(periodEntryCount),
      unit: isCurrentMonth ? "Litres" : "Entries",
      subtitle: isCurrentMonth ? `${entriesTodayCount} entries today` : monthLabel,
      icon: Calendar,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Current Seller Balance",
      value: formatMoney(sellerBalance),
      unit: balanceStatus,
      badge: balanceBadge,
      badgeColor: balanceBadgeColor,
      icon: Wallet,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={`${card.color} dark:bg-accent border-0 shadow-sm rounded-lg`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{card.value}</span>
                  <span className="text-xs text-muted-foreground">{card.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{card.subtitle}</span>
                  {card.badge && (
                    <Badge variant="secondary" className={card.badgeColor}>
                      {card.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
