"use client"

import React from 'react'
import { useState } from "react";

import {
  Banknote,
  Building2,
  CalendarDays,
  Milk,
  TrendingUp,
  Users,
  UserStar,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OwnerOverviewCharts } from './owner-overview-charts'; 
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMonthValue } from "@/utils/month";


const formatNumber = (value: number) => value?.toLocaleString("en-IN");
const formatMoney = (value: number) => `Rs ${Math.round(value).toLocaleString("en-IN")}`;
const formatLitres = (value: number) =>
  `${Number(value?.toFixed(2)).toLocaleString("en-IN")} L`;



const fetcher = async ([_, userId, month]: [string, any, string]) => {
 try {
    const response = await axios.get(`/api/owner/${userId}/overview?month=${month}`);
    return response.data.overview;
  } catch (error) {
    throw new Error(`Failed to fetch overview for user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
  }
};


function OwnerOverview({overview:initialOverview }:any) {
    // console.log("Received owner portal overview data as prop:", initialOverview );

    const session = useSession();
    const user = session.data?.user;
    const [selectedMonth, setSelectedMonth] = useState(
      initialOverview?.selectedMonth ?? getMonthValue()
    );


      const { data:overview, isLoading, error } = useSWR(user?.id ? ["owner-portal-overview", user.id, selectedMonth] : null, fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: true,
      fallbackData: initialOverview, 
    }
  )

  console.log("Owner portal overview data:", overview, "Loading:", isLoading, "Error:", error);
  


      const { totals } = overview;
    //   const totals  = overview?.totals || {
    //     dairies: 0,
    //     sellers: 0,
    //     buyers: 0,
    //     monthlyMilkCollected: 0,
    //     todayCollected: 0,
    //     monthlyMilkSupplied: 0,
    //     todaySupplied: 0,
    //     staff: 0,
    //     monthlySellerAmount: 0,
    //     monthlyBuyerAmount: 0,
    //     sellerBalance: 0,
    //     buyerBalance: 0
    //   };

      const summaryCards = [
    {
      title: "Total Dairies",
      value: formatNumber(totals?.dairies),
      detail: `${formatNumber(totals?.sellers)} sellers, ${formatNumber(totals?.buyers)} buyers`,
      icon: Building2,
      color: "bg-blue-50 text-primary",
    },
    {
      title: "Monthly Collection",
      value: formatLitres(totals?.monthlyMilkCollected),
      detail: overview?.isCurrentMonth
        ? `${formatLitres(totals?.todayCollected)} collected today`
        : `${overview?.monthLabel} total`,
      icon: Milk,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Monthly Supply",
      value: formatLitres(totals?.monthlyMilkSupplied),
      detail: overview?.isCurrentMonth
        ? `${formatLitres(totals?.todaySupplied)} supplied today`
        : `${overview?.monthLabel} total`,
      icon: TrendingUp,
      color: "bg-cyan-50 text-cyan-700",
    },
    {
      title: "Staff Members",
      value: formatNumber(totals?.staff),
      detail: "Across all owned dairies",
      icon: UserStar,
      color: "bg-violet-50 text-violet-700",
    },
  ];

  const financeCards = [
    {
      title: "Seller Purchases",
      value: formatMoney(totals?.monthlySellerAmount),
      detail: `Milk amount payable in ${overview?.monthLabel ?? "this month"}`,
      icon: Banknote,
    },
    {
      title: "Seller Balance",
      value: formatMoney(totals?.sellerBalance),
      detail: "Current seller account balance",
      icon: Users,
    },
    {
      title: "Buyer Sales",
      value: formatMoney(totals?.monthlyBuyerAmount),
      detail: `Milk amount billed in ${overview?.monthLabel ?? "this month"}`,
      icon: Wallet,
    },
    {
      title: "Buyer Balance",
      value: formatMoney(totals?.buyerBalance),
      detail: "Current buyer account balance",
      icon: CalendarDays,
    },
  ];

  const revenueData = [
    { label: "Purchases", amount: totals?.monthlySellerAmount },
    { label: "Sales", amount: totals?.monthlyBuyerAmount },
  ];


  return (
    <>
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <Label htmlFor="owner-overview-month">Month</Label>
            <Input
              id="owner-overview-month"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            />
          </div>
        </div>
        
         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>


        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {financeCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>


      <OwnerOverviewCharts
        data={overview.last7Days}
        revenueData={revenueData}
        monthLabel={overview.monthLabel}
        isCurrentMonth={overview.isCurrentMonth}
      />

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Recent Milk Entries</CardTitle>
          <p className="text-sm text-muted-foreground">
            {overview?.isCurrentMonth
              ? "Latest seller and buyer entries from this month across all dairies."
              : `Latest seller and buyer entries from ${overview?.monthLabel} across all dairies.`}
          </p>
        </CardHeader>
        <CardContent>
          {overview.recentTransactions?.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {`No milk entries found for ${overview?.monthLabel ?? "this month"}.`}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dairy</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Litres</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview?.recentTransactions && overview.recentTransactions.map((transaction:any) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.dairyName}</TableCell>
                    <TableCell>{transaction.personName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          transaction.type === "Seller"
                            ? "border-blue-200 bg-blue-50 text-primary"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatLitres(transaction.litres)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </>
  )
}

export default OwnerOverview
