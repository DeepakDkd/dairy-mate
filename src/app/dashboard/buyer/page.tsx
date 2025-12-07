"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import AddBuyerDialog from "@/components/Dialog/buyer/add-buyer"
import { BuyerPaymentsTable } from "@/components/dashboard/buyer/payments-table"
import { BuyerOverviewCards } from "@/components/dashboard/buyer/overview-cards"
import { AddPaymentDialog } from "@/components/dashboard/buyer/add-payment-dialog"
import { BuyerRosterTable } from "@/components/dashboard/buyer/buyer-roster-table"
import { BuyerMilkEntriesTable } from "@/components/dashboard/buyer/milk-entries-table"
import { AddBuyerMilkEntryDialog } from "@/components/Dialog/buyer/add-milk-entry-dialog"
import { MonthlyConsumptionChart } from "@/components/dashboard/buyer/monthly-consumption-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import useSWR, { useSWRConfig } from "swr"



const fetcher = (url: string) => fetch(url).then((r) => r.json());


export default function BuyerDashboardPage() {
  const session = useSession();
  const userId = session.data?.user?.id;
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [showAddBuyer, setShowAddBuyer] = useState(false)
  const [showMilkDialog, setShowMilkDialog] = useState(false)



  const { mutate: globalMutate } = useSWRConfig();

  const [selectedDairyId, setSelectedDairyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("name_asc");

  const { data: dairiesData, error: dairiesError, isLoading: dairiesLoading } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  useEffect(() => {
    if (dairiesData?.dairies?.length > 0 && !selectedDairyId) {
      setSelectedDairyId(dairiesData.dairies[0].id);
    }
  }, [dairiesData, selectedDairyId]);

  const buyerKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/buyers?page=${page}&limit=${limit}&sort=${sort}`;


  const { data: buyerData, isLoading, error, mutate: staffMutate } = useSWR(buyerKey ? buyerKey : null, fetcher, { revalidateOnFocus: false, dedupingInterval: 2000, });

  if (isLoading) {
    console.log("Loading buyer data...");
  }

  const refreshBuyers = () => {
    if (buyerKey) {
      staffMutate();
      globalMutate(buyerKey);
    }
  };

  const handleSelectDairy = (id: number) => {
    setSelectedDairyId(id);
    setPage(1);
    refreshBuyers();
  };

  const totalPages = buyerData?.totalBuyers ? Math.ceil(buyerData.totalBuyers / limit) : 0;





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
      <div className="flex gap-3 overflow-x-auto pb-2">
        {dairiesData?.dairies?.map((d: any) => (
          <div
            key={d.id}
            onClick={() => handleSelectDairy(d.id)}
            className={`p-4 border rounded-lg cursor-pointer w-48
                ${selectedDairyId === d.id ? "border-blue-500 bg-blue-50---" : "border-gray-300---"}
            `}
          >
            <h3 className="font-semibold">{d.name}</h3>
            <p className="text-xs text-gray-500---">{d.address || "No address"}</p>
            <p className="text-xs mt-1">
              Buyers: {d.users?.filter(
                (u: any) => u.role === "BUYER"
              ).length || 0
              }
            </p>
          </div>
        ))}
      </div>



      {/* Overview Cards */}
      <BuyerOverviewCards buyers={buyerData?.buyers} />

      <Card>
        <CardHeader>
          <CardTitle>Buyer List</CardTitle>
          <CardDescription>Manage all buyers  entries</CardDescription>
        </CardHeader>
        <CardContent>
          <BuyerRosterTable buyer={buyerData?.buyers} setPage={setPage} page={page} totalPages={totalPages} />
        </CardContent>
      </Card>

      {/* Monthly Consumption Chart */}
      <MonthlyConsumptionChart />

      {/* Milk Entries and Payments */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> */}
        {/* <div className="lg:col-span-2"> */}
          <BuyerMilkEntriesTable selectedDairyId={selectedDairyId} />
        {/* </div> */}
        <div className="space-y-4">
          <BuyerPaymentsTable />
          <button
            onClick={() => setIsPaymentDialogOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Payment
          </button>
        </div>
      {/* </div> */}

      {/* Add Payment Dialog */}
      <AddPaymentDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} />
      <AddBuyerDialog open={showAddBuyer} onOpenChange={setShowAddBuyer} userId={userId} />
      <AddBuyerMilkEntryDialog open={showMilkDialog} onOpenChange={setShowMilkDialog} />
    </div>
  )
}
