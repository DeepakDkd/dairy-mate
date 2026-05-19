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

interface BuyerPaymentsTableProps {
  dairyId: number;
  refreshToken?: number;
}

export function BuyerPaymentsTable({ dairyId, refreshToken = 0 }: BuyerPaymentsTableProps) {
  const [month, setMonth] = useState(getMonthValue());
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const requestUrl = useMemo(() => {
    if (!dairyId) return null;

    const params = new URLSearchParams({
      month,
      page: String(page),
      pageSize: String(pageSize),
    });

    return `/api/dairies/${dairyId}/buyers/ledger?${params.toString()}`;
  }, [dairyId, month, page]);

  const { data, error, mutate } = useSWR(requestUrl, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load buyer transactions.");
    }
  }, [error]);

  useEffect(() => {
    mutate();
  }, [mutate, refreshToken]);

  useEffect(() => {
    setPage(1);
  }, [month, dairyId]);

  return (
    <Card className="shadow-md rounded-2xl border">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data?.monthLabel ? `Showing ${data.monthLabel}` : "Recent milk entries and payments across all buyers"}
            </p>
          </div>
          <div className="w-full max-w-xs space-y-2">
            <Label htmlFor="buyer-ledger-month">Month</Label>
            <Input
              id="buyer-ledger-month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Buyer</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Type</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Amount (Rs)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Balance (Rs)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.ledger?.length > 0 ? (
                data.ledger.map((item: any) => (
                  <TableRow key={item.id} className="border-b hover:bg-secondary/50 transition-colors">
                    <TableCell className="text-sm text-foreground">
                      {formatDateTime(item.date)}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{item.buyerName}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.type === "PAYMENT"
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                            : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"
                        }
                        variant="outline"
                      >
                        {item.type === "PAYMENT" ? "Payment" : "Milk Entry"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-foreground font-medium">
                      Rs {Number(item.amount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${item.balanceAfter < 0 ? "text-red-600" : "text-green-600"}`}>
                        Rs {Number(item.balanceAfter).toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.note}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            Page {data?.page ?? page} of {data?.totalPages ?? 0}
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
              onClick={() => setPage((value) => Math.min(data?.totalPages ?? 1, value + 1))}
              disabled={!data?.totalPages || (data?.page ?? page) >= data.totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
