"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import useSWR from "swr";

import AddBuyerDialog from "@/components/Dialog/buyer/add-buyer";
import { AddBuyerMilkEntryDialog } from "@/components/Dialog/buyer/add-milk-entry-dialog";
import {
  PortalDairyRailSkeleton,
  PortalStatsSkeleton,
  PortalTableSkeleton,
} from "@/components/portal/portal-skeletons";
import { AddPaymentDialog } from "@/components/dashboard/buyer/add-payment-dialog";
import { BuyerMilkEntriesTable } from "@/components/dashboard/buyer/milk-entries-table";
import { BuyerOverviewCards } from "@/components/dashboard/buyer/overview-cards";
import { BuyerPaymentsTable } from "@/components/dashboard/buyer/payments-table";
import { BuyerRosterTable } from "@/components/dashboard/buyer/buyer-roster-table";
import { MonthlyConsumptionChart } from "@/components/dashboard/buyer/monthly-consumption-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMonthValue } from "@/utils/month";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

interface OwnerBuyerDashboardProps {
  dairyId: number;
  basePath: string;
}

export default function OwnerBuyerDashboard({
  dairyId,
  basePath,
}: OwnerBuyerDashboardProps) {
  const router = useRouter();
  const session = useSession();
  const userId = session.data?.user?.id;

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [showAddBuyer, setShowAddBuyer] = useState(false);
  const [showMilkDialog, setShowMilkDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [paymentRefreshToken, setPaymentRefreshToken] = useState(0);
  const [limit] = useState(10);
  const [sort] = useState("name_asc");
  const [selectedMonth, setSelectedMonth] = useState(getMonthValue());

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

  const buyerKey = `/api/dairies/${dairyId}/buyers?page=${page}&limit=${limit}&sort=${sort}`;

  const {
    data: buyerData,
    error: buyerDataError,
    isLoading: buyerDataLoading,
    mutate: buyerDataMutate,
  } = useSWR(buyerKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  const {
    data: buyerStats,
    error: buyerStatsError,
    isLoading: buyerStatsLoading,
    mutate: buyerStatsMutate,
  } = useSWR(
    `/api/dairies/${dairyId}/buyers/stats?month=${selectedMonth}`,
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );

  const totalPages = buyerData?.totalBuyers
    ? Math.ceil(buyerData.totalBuyers / limit)
    : 0;

  useEffect(() => {
    if (dairiesError) {
      toast.error("Failed to load dairies.");
    }
  }, [dairiesError]);

  useEffect(() => {
    if (buyerStatsError) {
      toast.error("Failed to load buyer stats.");
    }
  }, [buyerStatsError]);

  useEffect(() => {
    if (buyerDataError) {
      toast.error("Failed to load buyer list.");
    }
  }, [buyerDataError]);

  const handleSelectDairy = (id: number) => {
    if (id === dairyId) return;
    router.push(`${basePath}/${id}/buyers`);
  };

  const buyerOptions =
    buyerData?.buyers?.map((buyer: any) => ({
      id: buyer.id,
      name: `${buyer.firstName} ${buyer.lastName}`,
    })) ?? [];

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <Link
        href={`${basePath}/${dairyId}`}
        className="inline-flex text-sm text-primary hover:underline"
      >
        Back to dairy overview
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buyer Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s your milk consumption and payment summary.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:gap-5">
          <Button
            onClick={() => setShowAddBuyer(true)}
            className="w-full gap-2 bg-primary text-white hover:bg-primary/90 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Buyer
          </Button>
          <Button
            onClick={() => setShowMilkDialog(true)}
            className="w-full gap-2 bg-primary text-white hover:bg-primary/90 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Milk Entry
          </Button>
        </div>
      </div>

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
              <p className="mt-1 text-xs">Buyers: {dairy.stats?.buyers ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {buyerStatsLoading ? (
        <PortalStatsSkeleton count={4} />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <Label htmlFor="owner-buyer-month">Month</Label>
              <Input
                id="owner-buyer-month"
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            </div>
          </div>
          <BuyerOverviewCards
            totalMonthlyLitres={buyerStats?.totalMonthlyLitres}
            todaysMilkLitres={buyerStats?.todaysMilkLitres}
            totalMonthlyExpense={buyerStats?.totalMonthlyExpense}
            buyerBalance={buyerStats?.buyerBalance}
            activeBuyers={buyerStats?.activeBuyers}
            entriesTodayCount={buyerStats?.entriesTodayCount}
            periodEntryCount={buyerStats?.periodEntryCount}
            monthLabel={buyerStats?.monthLabel}
            isCurrentMonth={buyerStats?.isCurrentMonth}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Buyer List</CardTitle>
          <CardDescription>Manage all buyers entries</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {buyerDataLoading ? (
            <PortalTableSkeleton rows={5} columns={6} framed={false} />
          ) : (
            <BuyerRosterTable
              buyer={buyerData?.buyers}
              setPage={setPage}
              page={page}
              totalPages={totalPages}
              getLedgerHref={(buyerId) =>
                `${basePath}/${dairyId}/buyers/${buyerId}/ledger`
              }
            />
          )}
        </CardContent>
      </Card>

      <MonthlyConsumptionChart />

      <BuyerMilkEntriesTable selectedDairyId={dairyId} month={selectedMonth} showMonthPicker={false} />

      <div className="space-y-4">
        <BuyerPaymentsTable
          dairyId={dairyId}
          refreshToken={paymentRefreshToken}
          month={selectedMonth}
          showMonthPicker={false}
        />
        <button
          onClick={() => setIsPaymentDialogOpen(true)}
          className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Add Payment
        </button>
      </div>

      <AddPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        dairyId={dairyId}
        buyers={buyerOptions}
        onSuccess={() => {
          buyerStatsMutate();
          buyerDataMutate();
          setPaymentRefreshToken((value) => value + 1);
        }}
      />
      <AddBuyerDialog
        open={showAddBuyer}
        onOpenChange={setShowAddBuyer}
        userId={userId}
      />
      <AddBuyerMilkEntryDialog
        open={showMilkDialog}
        onOpenChange={setShowMilkDialog}
        getEntryHref={(selectedDairyId) =>
          `${basePath}/${selectedDairyId}/buyers/create-entry`
        }
      />
    </div>
  );
}
