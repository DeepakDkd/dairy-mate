"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";

import { AddPaymentDialog } from "./add-payment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getMonthValue } from "@/utils/month";

const fetcher = (url: string) => fetch(url).then((response) => response.json());
const splitDateTime = (value: string | Date) => {
  const date = new Date(value);

  return {
    date: [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-"),
    time: [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
    ].join(":"),
  };
};
const combineDateAndTime = (date: string, time: string) => new Date(`${date}T${time}:00`);

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

type PaymentMethod = "CASH" | "UPI" | "BANK";

type SellerLedgerRow = {
  id: string;
  date: string | Date;
  type: "MILK_ENTRY" | "PAYMENT";
  sellerName: string;
  sellerId: number;
  paidAmount: number | null;
  totalAmount: number;
  balanceAfter: number;
  note: string;
  paymentId: number | null;
  method: PaymentMethod | null;
};

interface SellerTransactionsTableProps {
  dairyId: number;
  sellers: PartyOption[];
  onPaymentCreated?: () => void;
  refreshToken?: number;
  month?: string;
  showMonthPicker?: boolean;
}

export function SellerTransactionsTable({
  dairyId,
  sellers,
  onPaymentCreated,
  refreshToken = 0,
  month: controlledMonth,
  showMonthPicker = true,
}: SellerTransactionsTableProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [internalMonth, setInternalMonth] = useState(getMonthValue());
  const month = controlledMonth ?? internalMonth;
  const [page, setPage] = useState(1);
  const [editingPayment, setEditingPayment] = useState<SellerLedgerRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: "",
    method: "CASH" as PaymentMethod,
    note: "",
    date: "",
    time: "",
  });
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

  const openEditDialog = (payment: SellerLedgerRow) => {
    if (!payment.paymentId) {
      return;
    }

    const dateTime = splitDateTime(payment.date);
    setEditingPayment(payment);
    setEditForm({
      amount: String(payment.paidAmount ?? payment.totalAmount),
      method: payment.method ?? "CASH",
      note: payment.note === "Seller payment" ? "" : payment.note,
      date: dateTime.date,
      time: dateTime.time,
    });
  };

  const handleSave = async () => {
    if (!editingPayment?.paymentId) {
      return;
    }

    const amount = Number(editForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.put("/api/payments/seller", {
        paymentId: editingPayment.paymentId,
        dairyId,
        sellerId: editingPayment.sellerId,
        amount,
        method: editForm.method,
        notes: editForm.note,
        date: combineDateAndTime(editForm.date, editForm.time),
      });
      toast.success("Payment updated.");
      setEditingPayment(null);
      await mutate();
      onPaymentCreated?.();
    } catch (error) {
      console.error("Failed to update seller payment:", error);
      toast.error("Failed to update payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (payment: SellerLedgerRow) => {
    if (!payment.paymentId) {
      return;
    }

    if (!window.confirm("Delete this payment? This will recalculate the seller balance.")) {
      return;
    }

    try {
      await axios.delete("/api/payments/seller", {
        data: {
          paymentId: payment.paymentId,
          dairyId,
          sellerId: payment.sellerId,
        },
      });
      toast.success("Payment deleted.");
      await mutate();
      onPaymentCreated?.();
    } catch (error) {
      console.error("Failed to delete seller payment:", error);
      toast.error("Failed to delete payment.");
    }
  };

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
            {showMonthPicker ? (
              <div className="w-full max-w-xs space-y-2">
                <Label htmlFor="seller-ledger-month">Month</Label>
                <Input
                  id="seller-ledger-month"
                  type="month"
                  value={month}
                  onChange={(event) => setInternalMonth(event.target.value)}
                />
              </div>
            ) : null}
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
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.ledger?.length > 0 ? (
                  data.ledger.map((transaction: SellerLedgerRow) => (
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
                      <TableCell className="text-right">
                        {transaction.type === "PAYMENT" && transaction.paymentId ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(transaction)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(transaction)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
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
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Seller Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="seller-payment-amount">Amount (Rs)</Label>
              <Input
                id="seller-payment-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={editForm.amount}
                onChange={(event) => setEditForm((current) => ({ ...current, amount: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-payment-method">Method</Label>
              <Select
                value={editForm.method}
                onValueChange={(value) =>
                  setEditForm((current) => ({ ...current, method: value as PaymentMethod }))
                }
              >
                <SelectTrigger id="seller-payment-method">
                  <SelectValue placeholder="Choose method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-payment-date">Date</Label>
              <Input
                id="seller-payment-date"
                type="date"
                value={editForm.date}
                onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller-payment-time">Time</Label>
              <Input
                id="seller-payment-time"
                type="time"
                value={editForm.time}
                onChange={(event) => setEditForm((current) => ({ ...current, time: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="seller-payment-note">Remarks</Label>
              <Textarea
                id="seller-payment-note"
                rows={3}
                value={editForm.note}
                onChange={(event) => setEditForm((current) => ({ ...current, note: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPayment(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
