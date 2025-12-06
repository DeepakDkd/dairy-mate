import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Milk, TrendingUp, Calendar, Wallet } from "lucide-react"
import { en } from "zod/v4/locales";

export function BuyerOverviewCards({ buyers }: { buyers: any }) {


  const totalMonthlyLitres = buyers?.reduce((total: number, buyer: any) => {
    // console.log(buyer?.firstName, "Processing buyer entries:", buyer.buyerEntries);
    const buyerTotalLitres = buyer?.buyerEntries?.reduce((subTotal: number, entry: any) => {
      // console.log("  Entry:", entry, "Litres:", entry.litres);
      const entryDate = new Date(entry.date);
      const now = new Date();

      const isSameMonth =
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear();

      if (isSameMonth) {
        subTotal += entry.litres;
      }
      return subTotal;
    }, 0) || 0;
    total += buyerTotalLitres;
    return total;
  }, 0) || 0;

  console.log("Calculating Total Milk Taken...");
  console.log("Total Milk Taken:", totalMonthlyLitres);

  const todaysMilkLitres = buyers?.reduce((total: number, buyer: any) => {
    // console.log(buyer?.firstName, "Processing buyer entries:", buyer.buyerEntries);
    const buyerTotalLitres = buyer?.buyerEntries?.reduce((subTotal: number, entry: any) => {
      // console.log("  Entry:", entry, "Litres:", entry.litres);
      const entryDate = new Date(entry.date);
      const now = new Date();


      const isSameDay =
        entryDate.getDate() === now.getDate() &&
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear();
      if (isSameDay) {
        subTotal += entry.litres;
      }
      return subTotal;
    }, 0) || 0;
    total += buyerTotalLitres;
    return total;
  }, 0) || 0;


  const totalMonthlyExpense = buyers?.reduce((total: number, buyer: any) => {
    const buyerTotalLitresPrice = buyer?.buyerEntries?.reduce((subTotal: number, entry: any) => {
      const entryDate = new Date(entry.date);
      const now = new Date();

      const isSameMonth =
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear();
      const ratePerLitre = entry?.rate;
      if (isSameMonth) {
        subTotal += entry.litres * ratePerLitre;
      }
      return subTotal;
    }, 0) || 0;
    total += buyerTotalLitresPrice;
    return total;
  }, 0) || 0;


  const monthlyExpense = totalMonthlyExpense
  const balanceAmount = -5000 // negative means pending, positive means advance
  const todayMilk = todaysMilkLitres // litres
  const todayRate = 60 // ₹


  const cards = [
    {
      title: "Total Milk Taken",
      value: totalMonthlyLitres,
      unit: "Litres",
      subtitle: "This Month",
      icon: Milk,
      color: "bg-blue-50",
      iconColor: "text-primary",
    },
    {
      title: balanceAmount < 0 ? "Amount Due" : "Advance Balance",
      value: `₹${Math.abs(balanceAmount).toLocaleString()}`,
      unit: balanceAmount < 0 ? "To Pay" : "In Account",
      badge: balanceAmount < 0 ? "Pending" : "Advance",
      badgeColor: balanceAmount < 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800",
      icon: TrendingUp,
      color: balanceAmount < 0 ? "bg-red-50" : "bg-green-50",
      iconColor: balanceAmount < 0 ? "text-red-600" : "text-green-600",
    },
    {
      title: "Today's Milk Taken",
      value: todayMilk,
      // unit: `@ ₹${todayRate}/L`,
      unit: `Litres`,
      subtitle: "Today",
      icon: Calendar,
      color: "bg-yellow-50",
      iconColor: "text-accent",
    },
    {
      title: "Monthly Expense",
      value: `₹${monthlyExpense.toLocaleString()}`,
      unit: "Total Amount",
      subtitle: "This Month",
      icon: Wallet,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className={`${card.color} dark:bg-accent   border-0 shadow-sm rounded-lg`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  {/* <span className="text-2xl font-bold text-foreground">{card.value}</span> */}
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
        )
      })}
    </div>
  )
}
