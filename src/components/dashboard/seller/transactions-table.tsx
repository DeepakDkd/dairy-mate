"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { AddPaymentDialog } from "./add-payment-dialog";
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

interface PartyOption {
  id: number;
  name: string;
}

interface SellerTransactionsTableProps {
  dairyId: number;
  sellers: PartyOption[];
  onPaymentCreated?: () => void;
  refreshToken?: number;
}

export function SellerTransactionsTable({
  dairyId,
  sellers,
  onPaymentCreated,
  refreshToken = 0,
}: SellerTransactionsTableProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
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

    return `/api/dairies/${dairyId}/sellers/ledger?${params.toString()}`;
  }, [dairyId, month, page]);

  const { data, error, mutate } = useSWR(requestUrl, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load seller transactions.");
    }
  }, [error]);

  useEffect(() => {
    mutate();
  }, [mutate, refreshToken]);

  useEffect(() => {
    setPage(1);
  }, [month, dairyId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-montserrat text-foreground">Transaction History</h2>
        <Button onClick={() => setShowPaymentDialog(true)} variant="outline" className="gap-2" disabled={!dairyId || sellers.length === 0}>
          <Plus className="w-4 h-4" />
          Add Payment
        </Button>
      </div>
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.monthLabel ? `Showing ${data.monthLabel}` : "Review transactions month by month."}
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <Label htmlFor="seller-ledger-month">Month</Label>
              <Input
                id="seller-ledger-month"
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
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Seller</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="text-right font-semibold">Paid Amount</TableHead>
                  <TableHead className="text-right font-semibold">Total Amount</TableHead>
                  <TableHead className="text-right font-semibold">Balance After</TableHead>
                  <TableHead className="font-semibold">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.ledger?.length > 0 ? (
                  data.ledger.map((transaction: any) => (
                    <TableRow key={transaction.id} className="hover:bg-secondary/50">
                      <TableCell className="font-medium">
                        {formatDateTime(transaction.date)}
                      </TableCell>
                      <TableCell>{transaction.sellerName}</TableCell>
                      <TableCell>
                        {transaction.type === "PAYMENT" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Payment</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Milk Entry</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.paidAmount ? `Rs ${Number(transaction.paidAmount).toLocaleString("en-IN")}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs {Number(transaction.totalAmount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        Rs {Number(transaction.balanceAfter).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{transaction.note}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
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
      <AddPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        dairyId={dairyId}
        sellers={sellers}
        onSuccess={() => {
          mutate();
          onPaymentCreated?.();
        }}
      />
    </div>
  );
}
