"use client"
import { SellerOverviewCards } from "@/components/dashboard/seller/overview-cards"
import { SellerMilkTable } from "@/components/dashboard/seller/milk-table"
import { SellerTransactionsTable } from "@/components/dashboard/seller/transactions-table"
import Header from "@/components/dashboard/seller/header"
import { getServerActionUser } from "@/fetchers/user/action";
import { SellerListTable } from "@/components/dashboard/seller/seller-list-table"
import { useSession } from "next-auth/react"
import useSWR, { useSWRConfig } from "swr"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SellerRosterTable } from "@/components/dashboard/seller/seller-roster-table"


const fetcher = (url: string) => fetch(url).then((r) => r.json());


export default  function SellerDashboardPage() {

  const session = useSession();
  const userId = session.data?.user?.id;


  
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

  const sellerKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/sellers?page=${page}&limit=${limit}&sort=${sort}`;


  const { data: sellerData, isLoading, error, mutate: staffMutate } = useSWR(sellerKey ? sellerKey : null, fetcher, { revalidateOnFocus: false, dedupingInterval: 2000, });
  
  if(isLoading){
    console.log("Loading seller data...");
  }

  const refreshSellers = () => {
    if (sellerKey) {
      staffMutate();
      globalMutate(sellerKey);
    }
  };

  const handleSelectDairy = (id: number) => {
    setSelectedDairyId(id);
    setPage(1);
    refreshSellers();
  };

  const totalPages = sellerData?.total ? Math.ceil(sellerData.total / limit) : 0;

  


  return (
    <div className="p-6 space-y-6  ">
         <Header userId={userId} />
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
              Sellers: {d.users?.filter(
                (u: any) => u.role === "SELLER"
              ).length || 0
              }
            </p>
          </div>
        ))}
      </div>
      {/* Header Section */}

      {/* Overview Cards */}
      <SellerOverviewCards />
      <hr />
      {/* Seller list Section */}
      <div className="space-y-4">
        {/* <h2 className="text-xl font-bold font-montserrat text-foreground">Seller List</h2> */}
        {/* <SellerListTable /> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Seller List</CardTitle>
          <CardDescription>Manage all sellers entries</CardDescription>
        </CardHeader>
        <CardContent>
          <SellerRosterTable seller={sellerData?.data} setPage={setPage} page={page} totalPages={totalPages} />
        </CardContent>
      </Card>
      <hr />
      {/* Milk Entries Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-montserrat text-foreground">Milk Entries</h2>
        <SellerMilkTable />
      </div>
      <hr />

      {/* Transactions Section */}

      <SellerTransactionsTable />

    </div>
  )
}
