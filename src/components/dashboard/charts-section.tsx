"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartsSectionProps {
  timeFilter: string
}

export function ChartsSection({ timeFilter }: ChartsSectionProps) {
  // Mock data for milk collection trend
  const milkTrendData = [
    { day: "Mon", litres: 450 },
    { day: "Tue", litres: 520 },
    { day: "Wed", litres: 480 },
    { day: "Thu", litres: 620 },
    { day: "Fri", litres: 580 },
    { day: "Sat", litres: 550 },
    { day: "Sun", litres: 490 },
  ]

  // Mock data for revenue overview
  const revenueData = [
    { week: "Week 1", paid: 28000, pending: 4000 },
    { week: "Week 2", paid: 32000, pending: 3500 },
    { week: "Week 3", paid: 25000, pending: 5000 },
    { week: "Week 4", paid: 30000, pending: 2800 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Milk Collection Trend */}
      <Card className="bg-white--- shadow-md rounded-2xl border border-gray-100---">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Milk Collection Trend</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Daily litres collected this month</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={milkTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
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

      {/* Revenue Overview */}
      <Card className="bg-white--- shadow-md rounded-2xl border border-gray-100---">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Compare paid vs pending per week</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="paid" fill="#008ED6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#F6BD26" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
