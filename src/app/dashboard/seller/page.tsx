"use server"
import { SellerOverviewCards } from "@/components/dashboard/seller/overview-cards"
import { SellerMilkTable } from "@/components/dashboard/seller/milk-table"
import { SellerTransactionsTable } from "@/components/dashboard/seller/transactions-table"
import Header from "@/components/dashboard/seller/header"
import { getServerActionUser } from "@/fetchers/user/action";
import { SellerListTable } from "@/components/dashboard/seller/seller-list-table"

export default async function SellerDashboardPage() {

  const sessionUser =  await getServerActionUser();
  // console.log("sessionUser in SellerDashboardPage:", sessionUser?.id);

  return (
    <div className="p-6 space-y-6  ">
      {/* Header Section */}
      <Header userId={sessionUser?.id} />

      {/* Overview Cards */}
      <SellerOverviewCards />

      {/* Seller list Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-montserrat text-foreground">Seller List</h2>
        <SellerListTable />
      </div>
      {/* Milk Entries Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-montserrat text-foreground">Milk Entries</h2>
        <SellerMilkTable />
      </div>

      {/* Transactions Section */}

      <SellerTransactionsTable />

    </div>
  )
}
