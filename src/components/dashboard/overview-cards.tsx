import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface OverviewCardsProps {
  timeFilter: string
}

export function OverviewCards({ timeFilter }: OverviewCardsProps) {
  // Mock data - would be dynamic based on timeFilter
  const cards = [
    {
      title: "Total Milk Sold",
      value: "2,450",
      unit: "Litres",
      trend: 12,
      positive: true,
    },
    {
      title: "Total Earnings",
      value: "₹98,500",
      unit: "This Month",
      trend: 8,
      positive: true,
    },
    {
      title: "Pending Payments",
      value: "₹12,300",
      unit: "Due Soon",
      trend: 5,
      positive: false,
    },
    {
      title: "Advance Balance",
      value: "₹45,000",
      unit: "Received",
      trend: 3,
      positive: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white shadow-md rounded-2xl border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{card.value}</span>
                <span className="text-xs text-muted-foreground">{card.unit}</span>
              </div>
              <div className="flex items-center gap-1">
                {card.positive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                )}
                <span className={`text-xs font-medium ${card.positive ? "text-green-500" : "text-orange-500"}`}>
                  {card.trend}% from last month
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
