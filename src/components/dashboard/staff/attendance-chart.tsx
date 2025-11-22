"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Staff {
  name: string
  attendance: number
}

interface AttendanceChartProps {
  staff: Staff[]
}

export function AttendanceChart({ staff }: AttendanceChartProps) {
  const chartData = staff.map((member) => ({
    name: member.name.split(" ")[0],
    attendance: member.attendance,
  }))

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis domain={[0, 100]} label={{ value: "Attendance %", angle: -90, position: "insideLeft" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          />
          <Legend />
          <Bar dataKey="attendance" fill="var(--color-primary)" name="Attendance %" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
