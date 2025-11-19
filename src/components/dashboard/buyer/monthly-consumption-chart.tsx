"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function MonthlyConsumptionChart() {
  // Mock data for monthly milk consumption
  const consumptionData = [
    { date: "Nov 1", litres: 35 },
    { date: "Nov 2", litres: 40 },
    { date: "Nov 3", litres: 38 },
    { date: "Nov 4", litres: 45 },
    { date: "Nov 5", litres: 42 },
    { date: "Nov 6", litres: 48 },
    { date: "Nov 7", litres: 50 },
    { date: "Nov 8", litres: 42 },
  ]

  return (
    <Card className="bg-white--- shadow-md rounded-2xl border border-gray-100---">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Monthly Milk Consumption</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Daily litres consumed this month</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={consumptionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="litres" stroke="#008ED6" dot={{ fill: "#008ED6", r: 5 }} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
