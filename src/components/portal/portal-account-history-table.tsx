"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMonthValue } from "@/utils/month";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

const formatDateTime = (value: string | Date) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatMoney = (value: number) => `Rs ${Number(value).toLocaleString("en-IN")}`;

interface PortalAccountHistoryTableProps {
  title: string;
  emptyLabel: string;
  showMonthlySummary?: boolean;
}

export function PortalAccountHistoryTable({
  title,
  emptyLabel,
  showMonthlySummary = false,
}: PortalAccountHistoryTableProps) {
  const [month, setMonth] = useState(getMonthValue());
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams({
      month,
      page: String(page),
      pageSize: String(pageSize),
    });

    return `/api/portal/history?${params.toString()}`;
  }, [month, page]);

  const { data, error } = useSWR(requestUrl, fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load account history.");
    }
  }, [error]);

  const ledger = data?.ledger ?? [];
  const totalPages = data?.totalPages ?? 0;
  const monthlyStats = data?.monthlyStats;
  const role = data?.role; // "SELLER" | "BUYER"
  const formatLitres = (value: number) => `${Number(value).toFixed(2)} L`;

  // Format balance after cell helper
  const renderBalanceAfter = (balance: number, userRole: string | undefined) => {
    if (balance == null) return "--";
    const absVal = formatMoney(Math.abs(balance));

    if (userRole === "SELLER") {
      if (balance < 0) {
        return (
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {absVal} <span className="text-[9px] uppercase tracking-wider text-amber-500/80 font-bold">Owed</span>
          </span>
        );
      }
      if (balance > 0) {
        return (
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {absVal} <span className="text-[9px] uppercase tracking-wider text-blue-500/80 font-bold">Advance</span>
          </span>
        );
      }
    } else if (userRole === "BUYER") {
      if (balance > 0) {
        return (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {absVal} <span className="text-[9px] uppercase tracking-wider text-emerald-500/80 font-bold">Owed</span>
          </span>
        );
      }
      if (balance < 0) {
        return (
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {absVal} <span className="text-[9px] uppercase tracking-wider text-blue-500/80 font-bold">Advance</span>
          </span>
        );
      }
    }
    return <span className="text-muted-foreground font-semibold text-xs">Settled</span>;
  };

  return (
    <div className="space-y-6">
      {showMonthlySummary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Milk volume</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-foreground">{formatLitres(monthlyStats?.litres ?? 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{data?.monthLabel ?? "Selected month"}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Amount value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-foreground">{formatMoney(monthlyStats?.amount ?? 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Milk transaction value in period</p>
            </CardContent>
          </Card>
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Entries In Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-black text-foreground">{monthlyStats?.entryCount ?? 0}</p>
              <p className="mt-1 text-xs text-muted-foreground">Recorded entries</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="border border-border/80 shadow-sm bg-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4 bg-muted/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-base font-bold">{title}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {data?.monthLabel ? `Showing ledger details for ${data.monthLabel}` : "Choose a month to review history."}
              </p>
            </div>
            <div className="w-full max-w-xs space-y-1">
              <Label htmlFor="portal-account-history-month" className="text-xs font-semibold">Select Month</Label>
              <Input
                id="portal-account-history-month"
                type="month"
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                  setPage(1);
                }}
                className="h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/10">
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Date & Time</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Balance After</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                      {emptyLabel}
                    </TableCell>
                  </TableRow>
                ) : (
                  ledger.map((item: any) => {
                    const isPayment = item.type === "PAYMENT";
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="text-xs font-semibold text-muted-foreground">{formatDateTime(item.date)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`font-semibold text-[10px] px-2.5 py-0.5 ${
                              isPayment
                                ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                : "border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            }`}
                          >
                            {isPayment ? "Payment Transaction" : "Milk Supply Entry"}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right text-xs font-bold ${
                          isPayment ? "text-red-500" : "text-emerald-500"
                        }`}>
                          {isPayment ? "- " : "+ "}{formatMoney(item.amount)}
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold">
                          {renderBalanceAfter(item.balanceAfter, role)}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground/80">{item.note}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4 bg-muted/5 p-2 rounded-xl">
              <span className="text-xs text-muted-foreground font-semibold">
                Page {data?.page ?? page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={(data?.page ?? page) <= 1}
                  className="gap-1 cursor-pointer h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((value) => Math.min(totalPages || 1, value + 1))}
                  disabled={!totalPages || (data?.page ?? page) >= totalPages}
                  className="gap-1 cursor-pointer h-8 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
