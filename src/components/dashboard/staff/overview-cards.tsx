"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCheck, UserX, DollarSign } from "lucide-react"

interface StaffOverviewCardsProps {
  staffData: Array<{
    id: number
    name: string
    role: string
    status: string
    salary: number
    attendance: number
  }>
}

export function StaffOverviewCards({ staffData }: StaffOverviewCardsProps) {
  const totalStaff = staffData.length
  const activeStaff = staffData.filter((s) => s.status === "Active").length
  const inactiveStaff = staffData.filter((s) => s.status === "Inactive").length
  const totalMonthlySalary = staffData.reduce((sum, s) => sum + s.salary, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Staff */}
      <Card className="border-l-4 border-l-[#008ED6]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Staff</p>
              <p className="text-2xl font-bold text-foreground mt-2">{totalStaff}</p>
            </div>
            <div className="p-3 bg-[#008ED6]/10 rounded-lg">
              <Users className="h-6 w-6 text-[#008ED6]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Staff */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Staff</p>
              <p className="text-2xl font-bold text-foreground mt-2">{activeStaff}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inactive Staff */}
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Inactive Staff</p>
              <p className="text-2xl font-bold text-foreground mt-2">{inactiveStaff}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Salary */}
      <Card className="border-l-4 border-l-[#F6BD26]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Monthly Salary</p>
              <p className="text-2xl font-bold text-foreground mt-2">₹{totalMonthlySalary.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-[#F6BD26]/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-[#F6BD26]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
