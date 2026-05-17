import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Milk, TrendingUp, Wallet } from "lucide-react";

interface BuyerOverviewCardsProps {
  totalMonthlyLitres?: number;
  todaysMilkLitres?: number;
  totalMonthlyExpense?: number;
  buyerBalance?: number;
  activeBuyers?: number;
  entriesTodayCount?: number;
}

const formatLitres = (value: number) =>
  Number(value.toFixed(2)).toLocaleString("en-IN");

const formatMoney = (value: number) =>
  `Rs ${Math.round(Math.abs(value)).toLocaleString("en-IN")}`;

export function BuyerOverviewCards({
  totalMonthlyLitres = 0,
  todaysMilkLitres = 0,
  totalMonthlyExpense = 0,
  buyerBalance = 0,
  activeBuyers = 0,
  entriesTodayCount = 0,
}: BuyerOverviewCardsProps) {
  const balanceTitle = buyerBalance >= 0 ? "Amount Due" : "Advance Balance";
  const balanceUnit = buyerBalance >= 0 ? "To Collect" : "In Account";
  const balanceBadge = buyerBalance >= 0 ? "Receivable" : "Advance";
  const balanceBadgeColor =
    buyerBalance >= 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";

  const cards = [
    {
      title: "Total Milk Supplied",
      value: formatLitres(totalMonthlyLitres),
      unit: "Litres",
      subtitle: "This Month",
      icon: Milk,
      color: "bg-blue-50",
      iconColor: "text-primary",
    },
    {
      title: balanceTitle,
      value: formatMoney(buyerBalance),
      unit: balanceUnit,
      badge: `${activeBuyers} active buyers`,
      badgeColor: "bg-slate-100 text-slate-700",
      icon: TrendingUp,
      color: buyerBalance >= 0 ? "bg-red-50" : "bg-green-50",
      iconColor: buyerBalance >= 0 ? "text-red-600" : "text-green-600",
    },
    {
      title: "Today's Supply",
      value: formatLitres(todaysMilkLitres),
      unit: "Litres",
      subtitle: `${entriesTodayCount} entries today`,
      icon: Calendar,
      color: "bg-yellow-50",
      iconColor: "text-accent",
    },
    {
      title: "Monthly Buyer Billing",
      value: formatMoney(totalMonthlyExpense),
      unit: "Total Amount",
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
