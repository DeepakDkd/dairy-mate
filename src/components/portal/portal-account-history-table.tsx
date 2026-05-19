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
  const formatLitres = (value: number) => `${Number(value).toFixed(2)} L`;

  return (
    <div className="space-y-6">
      {showMonthlySummary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Monthly Milk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatLitres(monthlyStats?.litres ?? 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{data?.monthLabel ?? "Selected month"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Monthly Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatMoney(monthlyStats?.amount ?? 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Milk value in this period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Entries In Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{monthlyStats?.entryCount ?? 0}</p>
              <p className="mt-1 text-xs text-muted-foreground">Recorded milk entries</p>
            </CardContent>
          </Card>
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.monthLabel ? `Showing ${data.monthLabel}` : "Choose a month to review history."}
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <Label htmlFor="portal-account-history-month">Month</Label>
              <Input
                id="portal-account-history-month"
                type="month"
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              ) : (
                ledger.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDateTime(item.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.type === "PAYMENT" ? "Payment" : "Milk Entry"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatMoney(item.amount)}</TableCell>
                    <TableCell className="text-right">{formatMoney(Math.abs(item.balanceAfter))}</TableCell>
                    <TableCell>{item.note}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Page {data?.page ?? page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={(data?.page ?? page) <= 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.min(totalPages || 1, value + 1))}
                disabled={!totalPages || (data?.page ?? page) >= totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
