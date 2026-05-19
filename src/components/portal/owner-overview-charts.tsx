"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OwnerOverviewChartsProps {
  data: {
    day: string;
    collected: number;
    supplied: number;
  }[];
  revenueData: {
    label: string;
    amount: number;
  }[];
  monthLabel?: string;
  isCurrentMonth?: boolean;
}

export function OwnerOverviewCharts({
  data,
  revenueData,
  monthLabel = "this month",
  isCurrentMonth = true,
}: OwnerOverviewChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Milk Movement</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isCurrentMonth
              ? "Litres collected from sellers and supplied to buyers in the last 7 days."
              : `Litres collected from sellers and supplied to buyers in the final 7 days of ${monthLabel}.`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
                <Line
                  type="monotone"
                  dataKey="collected"
                  name="Collected"
                  stroke="#008ED6"
                  strokeWidth={2}
                  dot={{ fill: "#008ED6", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="supplied"
                  name="Supplied"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ fill: "#16a34a", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Amounts</CardTitle>
          <p className="text-sm text-muted-foreground">
            {`Seller purchase amount compared with buyer sales amount in ${monthLabel}.`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => [`Rs ${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="amount" fill="#008ED6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
