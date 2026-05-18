"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { Plus } from "lucide-react";

import { AddPaymentDialog } from "./add-payment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const { data, error, mutate } = useSWR(
    dairyId ? `/api/dairies/${dairyId}/sellers/ledger` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (error) {
      toast.error("Failed to load seller transactions.");
    }
  }, [error]);

  useEffect(() => {
    mutate();
  }, [mutate, refreshToken]);

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
          <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
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
