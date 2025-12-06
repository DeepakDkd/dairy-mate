import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Milk, Banknote, Calendar, Wallet } from "lucide-react"

export function SellerOverviewCards({ sellers }: { sellers: any }) {
  
  const totalMonthlyLitres = sellers?.reduce((total: number, seller: any) => {
    // console.log(seller?.firstName, "Processing seller entries:", seller.sellerEntries);
    const sellerTotalLitres = seller?.sellerEntries?.reduce((subTotal: number, entry: any) => {
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
    total += sellerTotalLitres;
    return total;
  }, 0) || 0;


  const todaysMilkLitres = sellers?.reduce((total: number, seller: any) => {
    // console.log(seller?.firstName, "Processing seller entries:", seller.sellerEntries);
    const sellerTotalLitres = seller?.sellerEntries?.reduce((subTotal: number, entry: any) => {
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
    total += sellerTotalLitres;
    return total;
  }, 0) || 0;


  const totalMonthlyExpense = sellers?.reduce((total: number, seller: any) => {
    const sellerTotalLitresPrice = seller?.sellerEntries?.reduce((subTotal: number, entry: any) => {
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
    total += sellerTotalLitresPrice;
    return total;
  }, 0) || 0;


  const monthlyExpense = totalMonthlyExpense
  const balanceAmount = -5000 // negative means pending, positive means advance
  const todayMilk = todaysMilkLitres // litres
  const todayRate = 60 // ₹

  const cards = [
    {
      title: "Total Milk Sold",
      value: totalMonthlyLitres,
      unit: "Litres",
      subtitle: "This Month",
      icon: Milk,
      color: "bg-blue-50",
      iconColor: "text-primary",
    },
    {
      title: "Total Earnings",
      value: `₹${totalMonthlyExpense.toFixed(2)}`,
      unit: "Amount to be received",
      badge: "Pending ₹12,300",
      badgeColor: "bg-red-100 text-red-800",
      icon: Banknote,
      color: "bg-yellow-50",
      iconColor: "text-accent",
    },
    {
      title: "Today's Milk Sold",
      value: `${todaysMilkLitres}`,
      unit: "Litres @ ₹40/L",
      subtitle: "Today",
      icon: Calendar,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Current Balance",
      value: "₹45,000",
      unit: "To Receive",
      badge: "Positive",
      badgeColor: "bg-green-100 text-green-800",
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
          <Card key={index} className={`${card.color} dark:bg-accent border-0 shadow-sm rounded-lg`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
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
        )
      })}
    </div>
  )
}
