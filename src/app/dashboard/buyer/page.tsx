"use client"

import { useState } from "react"
import { BuyerOverviewCards } from "@/components/dashboard/buyer/overview-cards"
import { MonthlyConsumptionChart } from "@/components/dashboard/buyer/monthly-consumption-chart"
import { BuyerMilkEntriesTable } from "@/components/dashboard/buyer/milk-entries-table"
import { BuyerPaymentsTable } from "@/components/dashboard/buyer/payments-table"
import { AddPaymentDialog } from "@/components/dashboard/buyer/add-payment-dialog"

export default function BuyerDashboardPage() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Greeting Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Buyer Dashboard</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your milk consumption and payment summary.</p>
      </div>

      {/* Overview Cards */}
      <BuyerOverviewCards />

      {/* Monthly Consumption Chart */}
      <MonthlyConsumptionChart />

      {/* Milk Entries and Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BuyerMilkEntriesTable />
        </div>
        <div className="space-y-4">
          <BuyerPaymentsTable />
          <button
            onClick={() => setIsPaymentDialogOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Payment
          </button>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <AddPaymentDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} />
    </div>
  )
}
