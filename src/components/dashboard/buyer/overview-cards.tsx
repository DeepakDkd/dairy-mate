import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Milk, TrendingUp, Calendar, Wallet } from "lucide-react"

export function BuyerOverviewCards({ totalMonthlyLitres,todaysMilkLitres,totalMonthlyExpense }:any ) {



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
      value: `₹${Math.abs(balanceAmount)}`,
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
      value: `₹${monthlyExpense}`,
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
