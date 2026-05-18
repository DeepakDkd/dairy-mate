"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const { data, error, mutate } = useSWR(
    dairyId ? `/api/dairies/${dairyId}/buyers/ledger` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (error) {
      toast.error("Failed to load buyer transactions.");
    }
  }, [error]);

  useEffect(() => {
    mutate();
  }, [mutate, refreshToken]);

  return (
    <Card className="shadow-md rounded-2xl border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Recent milk entries and payments across all buyers</p>
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
                  <TableRow key={item.id} className="border-b hover:bg-gray-50 transition-colors">
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
      </CardContent>
    </Card>
  );
}
