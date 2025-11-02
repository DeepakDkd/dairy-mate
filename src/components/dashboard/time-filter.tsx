"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimeFilterProps {
  value: string
  onChange: (value: string) => void
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="flex gap-4 items-center">
      <label className="text-sm font-medium text-foreground">Filter by:</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Today">Today</SelectItem>
          <SelectItem value="This Week">This Week</SelectItem>
          <SelectItem value="This Month">This Month</SelectItem>
          <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
