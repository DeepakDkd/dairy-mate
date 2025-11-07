"use client"

import { useState } from "react"
import { SellerOverviewCards } from "@/components/dashboard/seller/overview-cards"
import { SellerMilkTable } from "@/components/dashboard/seller/milk-table"
import { SellerTransactionsTable } from "@/components/dashboard/seller/transactions-table"
import { AddMilkEntryDialog } from "@/components/dashboard/seller/add-milk-entry-dialog"
import { AddPaymentDialog } from "@/components/dashboard/seller/add-payment-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function SellerDashboardPage() {
  const [showMilkDialog, setShowMilkDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your milk entries and track earnings</p>
        </div>
        <Button onClick={() => setShowMilkDialog(true)} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Milk Entry
        </Button>
      </div>

      {/* Overview Cards */}
      <SellerOverviewCards />

      {/* Milk Entries Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-montserrat text-foreground">Milk Entries</h2>
        <SellerMilkTable />
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-montserrat text-foreground">Transactions</h2>
          <Button onClick={() => setShowPaymentDialog(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Payment
          </Button>
        </div>
        <SellerTransactionsTable />
      </div>

      {/* Dialogs */}
      <AddMilkEntryDialog open={showMilkDialog} onOpenChange={setShowMilkDialog} />
      <AddPaymentDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog} />
    </div>
  )
}
