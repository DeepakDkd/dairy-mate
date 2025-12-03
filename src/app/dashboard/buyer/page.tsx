"use client"

import { useState } from "react"
import { BuyerOverviewCards } from "@/components/dashboard/buyer/overview-cards"
import { MonthlyConsumptionChart } from "@/components/dashboard/buyer/monthly-consumption-chart"
import { BuyerMilkEntriesTable } from "@/components/dashboard/buyer/milk-entries-table"
import { BuyerPaymentsTable } from "@/components/dashboard/buyer/payments-table"
import { AddPaymentDialog } from "@/components/dashboard/buyer/add-payment-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import AddBuyerDialog from "@/components/Dialog/buyer/add-buyer"
import { useSession } from "next-auth/react"
import { BuyerListTable } from "@/components/dashboard/buyer/buyer-list-table"
import { AddBuyerMilkEntryDialog } from "@/components/Dialog/buyer/add-milk-entry-dialog"

export default function BuyerDashboardPage() {
  const session = useSession();
  const userId = session.data?.user?.id;
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [showAddBuyer, setShowAddBuyer] = useState(false)
  const [showMilkDialog, setShowMilkDialog] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Greeting Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buyer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s your milk consumption and payment summary.</p>
        </div>
       <div className="grid md:grid-cols-2 gap-2 md:gap-5" >
         <Button onClick={() => setShowAddBuyer(true)} className="bg-primary hover:bg-primary/90 cursor-pointer text-white  gap-2">
          <Plus className="w-4 h-4" />
          Add Buyer
        </Button>
        <Button onClick={() => setShowMilkDialog(true)} className="bg-primary hover:bg-primary/90 cursor-pointer text-white  gap-2">
          <Plus className="w-4 h-4" />
          Add Milk Entry
        </Button>
       </div>
      </div>


      {/* Overview Cards */}
      <BuyerOverviewCards />
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-montserrat text-foreground">Buyer List</h2>
        <BuyerListTable />
      </div>

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
      <AddBuyerDialog open={showAddBuyer} onOpenChange={setShowAddBuyer} userId={userId} />
      <AddBuyerMilkEntryDialog open={showMilkDialog} onOpenChange={setShowMilkDialog} />
    </div>
  )
}
