
import { SellerOverviewCards } from "@/components/dashboard/seller/overview-cards"
import { SellerMilkTable } from "@/components/dashboard/seller/milk-table"
import { SellerTransactionsTable } from "@/components/dashboard/seller/transactions-table"
import Header from "@/components/dashboard/seller/header"
import { getServerActionUser } from "@/fetchers/user/action";

export default async function SellerDashboardPage() {

  const sessionUser =  await getServerActionUser();

  return (
    <div className="p-6 space-y-6  ">
      {/* Header Section */}
      <Header userId={sessionUser?.id} />

      {/* Overview Cards */}
      <SellerOverviewCards />

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
