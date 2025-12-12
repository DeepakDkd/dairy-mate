"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

import Header from "@/components/dashboard/seller/header";
import { SellerOverviewCards } from "@/components/dashboard/seller/overview-cards";
import { SellerMilkTable } from "@/components/dashboard/seller/milk-table";
import { SellerTransactionsTable } from "@/components/dashboard/seller/transactions-table";
import { SellerRosterTable } from "@/components/dashboard/seller/seller-roster-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [selectedDairyId, setSelectedDairyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const LIMIT = 10;
  const SORT = "name_asc";

  
  const { data: dairiesData, isLoading: dairiesLoading } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (dairiesData?.dairies?.length && !selectedDairyId) {
      setSelectedDairyId(dairiesData.dairies[0].id);
    }
  }, [dairiesData, selectedDairyId]);

  const statsKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/sellers/stats`;

  const { data: sellerStats } = useSWR(statsKey ? statsKey : undefined, fetcher, {
    revalidateOnFocus: false,
  });

  
  const sellerKey = useMemo(() => {
    if (!selectedDairyId) return null;
    return `/api/dairies/${selectedDairyId}/sellers?page=${page}&limit=${LIMIT}&sort=${SORT}`;
  }, [selectedDairyId, page]);

  const {
    data: sellerData,
    isLoading: sellersLoading,
    mutate: sellersMutate,
  } = useSWR(sellerKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  const totalPages = sellerData?.total
    ? Math.ceil(sellerData.total / LIMIT)
    : 0;

  const handleSelectDairy = (id: number) => {
    if (id === selectedDairyId) return;
    setSelectedDairyId(id);
    setPage(1);
  };

  
  return (
    <div className="p-6 space-y-6">
      <Header userId={userId} />


      <div className="flex gap-3 overflow-x-auto pb-2">
        {dairiesData?.dairies?.map((d: any) => (
          <div
            key={d.id}
            onClick={() => handleSelectDairy(d.id)}
            className={`p-4 border rounded-lg cursor-pointer w-48 transition
              ${selectedDairyId === d.id
                ? "border-blue-500 bg-blue-50 dark:bg-accent"
                : "border-gray-300"
              }
            `}
          >
            <h3 className="font-semibold">{d.name}</h3>
            <p className="text-xs text-muted-foreground">
              {d.address || "No address"}
            </p>
            <p className="text-xs mt-1">
              Sellers: {d.stats?.sellers ?? 0}
            </p>
          </div>
        ))}
      </div>

      
      
      <SellerOverviewCards
        totalMonthlyLitres={sellerStats?.totalMonthlyLitres}
        todaysMilkLitres={sellerStats?.todaysMilkLitres}
        totalMonthlyExpense={sellerStats?.totalMonthlyExpense}
      />

      <hr />

      <Card>
        <CardHeader>
          <CardTitle>Seller List</CardTitle>
          <CardDescription>
            Manage all sellers under this dairy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SellerRosterTable
            seller={sellerData?.data}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            onRefresh={sellersMutate}
          />
        </CardContent>
      </Card>

      <hr />


      <div className="space-y-4">
        <h2 className="text-xl font-bold">Milk Entries</h2>
        <SellerMilkTable selectedDairyId={selectedDairyId} />
      </div>

      <hr />


      <SellerTransactionsTable />
    </div>
  );
}
