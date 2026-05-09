"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import useSWR from "swr";

import Header from "@/components/dashboard/seller/header";
import { SellerOverviewCards } from "@/components/dashboard/seller/overview-cards";
import { SellerMilkTable } from "@/components/dashboard/seller/milk-table";
import { SellerTransactionsTable } from "@/components/dashboard/seller/transactions-table";
import { SellerRosterTable } from "@/components/dashboard/seller/seller-roster-table";
import {
  PortalDairyRailSkeleton,
  PortalStatsSkeleton,
  PortalTableSkeleton,
} from "@/components/portal/portal-skeletons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

interface OwnerSellerDashboardProps {
  dairyId: number;
  basePath: string;
}

export default function OwnerSellerDashboard({
  dairyId,
  basePath,
}: OwnerSellerDashboardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [page, setPage] = useState(1);

  const limit = 10;
  const sort = "name_asc";

  useEffect(() => {
    setPage(1);
  }, [dairyId]);

  const {
    data: dairiesData,
    error: dairiesError,
    isLoading: dairiesLoading,
  } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const sellerKey = useMemo(() => {
    return `/api/dairies/${dairyId}/sellers?page=${page}&limit=${limit}&sort=${sort}`;
  }, [dairyId, limit, page, sort]);

  const {
    data: sellerStats,
    error: sellerStatsError,
    isLoading: sellerStatsLoading,
  } = useSWR(
    `/api/dairies/${dairyId}/sellers/stats`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const {
    data: sellerData,
    error: sellerDataError,
    isLoading: sellerDataLoading,
    mutate: sellersMutate,
  } = useSWR(
    sellerKey,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  const totalPages = sellerData?.total
    ? Math.ceil(sellerData.total / limit)
    : 0;

  useEffect(() => {
    if (dairiesError) {
      toast.error("Failed to load dairies.");
    }
  }, [dairiesError]);

  useEffect(() => {
    if (sellerStatsError) {
      toast.error("Failed to load seller stats.");
    }
  }, [sellerStatsError]);

  useEffect(() => {
    if (sellerDataError) {
      toast.error("Failed to load seller list.");
    }
  }, [sellerDataError]);

  const handleSelectDairy = (id: number) => {
    if (id === dairyId) return;
    router.push(`${basePath}/${id}/sellers`);
  };

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <Link
        href={`${basePath}/${dairyId}`}
        className="inline-flex text-sm text-primary hover:underline"
      >
        Back to dairy overview
      </Link>

      <Header
        userId={userId}
        getEntryHref={(selectedDairyId) =>
          `${basePath}/${selectedDairyId}/sellers/create-entry`
        }
      />

      {dairiesLoading ? (
        <PortalDairyRailSkeleton />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dairiesData?.dairies?.map((dairy: any) => (
            <div
              key={dairy.id}
              onClick={() => handleSelectDairy(dairy.id)}
              className={`w-44 shrink-0 cursor-pointer rounded-lg border p-4 transition sm:w-48 ${
                dairyId === dairy.id
                  ? "border-blue-500 bg-blue-50 dark:bg-accent"
                  : "border-gray-300"
              }`}
            >
              <h3 className="font-semibold">{dairy.name}</h3>
              <p className="text-xs text-muted-foreground">
                {dairy.address || "No address"}
              </p>
              <p className="mt-1 text-xs">Sellers: {dairy.stats?.sellers ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {sellerStatsLoading ? (
        <PortalStatsSkeleton count={4} />
      ) : (
        <SellerOverviewCards
          totalMonthlyLitres={sellerStats?.totalMonthlyLitres}
          todaysMilkLitres={sellerStats?.todaysMilkLitres}
          totalMonthlyExpense={sellerStats?.totalMonthlyExpense}
        />
      )}

      <hr />

      <Card>
        <CardHeader>
          <CardTitle>Seller List</CardTitle>
          <CardDescription>Manage all sellers under this dairy</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {sellerDataLoading ? (
            <PortalTableSkeleton rows={5} columns={6} framed={false} />
          ) : (
            <SellerRosterTable
              seller={sellerData?.data}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              onRefresh={sellersMutate}
            />
          )}
        </CardContent>
      </Card>

      <hr />

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Milk Entries</h2>
        <SellerMilkTable selectedDairyId={dairyId} />
      </div>

      <hr />

      <SellerTransactionsTable />
    </div>
  );
}
