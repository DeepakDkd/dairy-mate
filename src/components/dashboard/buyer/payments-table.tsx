"use client";

import axios from "axios";
import { ChevronLeft, ChevronRight, Download, Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

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
import { downloadFile } from "@/utils/download";
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

type PaymentMethod = "CASH" | "UPI" | "BANK";

type BuyerLedgerRow = {
  id: string;
  date: string | Date;
  type: "MILK_ENTRY" | "PAYMENT";
  buyerName: string;
  buyerId: number;
  amount: number;
  balanceAfter: number;
  note: string;
  paymentId: number | null;
  method: PaymentMethod | null;
};

interface BuyerPaymentsTableProps {
  dairyId: number;
  refreshToken?: number;
  month?: string;
  showMonthPicker?: boolean;
  onPaymentChanged?: () => void;
  isMonthClosed?: boolean;
  monthLabel?: string;
}

export function BuyerPaymentsTable({
  dairyId,
  refreshToken = 0,
  month: controlledMonth,
  showMonthPicker = true,
  onPaymentChanged,
  isMonthClosed = false,
  monthLabel,
}: BuyerPaymentsTableProps) {
  const [internalMonth, setInternalMonth] = useState(getMonthValue());
  const month = controlledMonth ?? internalMonth;
  const [page, setPage] = useState(1);
  const [editingPayment, setEditingPayment] = useState<BuyerLedgerRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

    return `/api/dairies/${dairyId}/buyers/ledger?${params.toString()}`;
  }, [dairyId, month, page]);
  const exportUrl = useMemo(() => {
    if (!dairyId) return null;

    const params = new URLSearchParams({
      report: "buyer-ledger",
      month,
    });

    return `/api/dairies/${dairyId}/exports?${params.toString()}`;
  }, [dairyId, month]);

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

  const openEditDialog = (payment: BuyerLedgerRow) => {
    if (isMonthClosed) {
      toast.error(`${monthLabel ?? "Selected month"} is closed for edits.`);
      return;
    }

    if (!payment.paymentId) {
      return;
    }

    const dateTime = splitDateTime(payment.date);
    setEditingPayment(payment);
    setEditForm({
      amount: String(payment.amount),
      method: payment.method ?? "CASH",
      note: payment.note === "Buyer payment" ? "" : payment.note,
      date: dateTime.date,
      time: dateTime.time,
    });
  };

  const handleSave = async () => {
    if (!editingPayment?.paymentId) {
      return;
    }

    if (isMonthClosed) {
      toast.error(`${monthLabel ?? "Selected month"} is closed for edits.`);
      return;
    }

    const amount = Number(editForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.put("/api/payments/buyer", {
        paymentId: editingPayment.paymentId,
        dairyId,
        buyerId: editingPayment.buyerId,
        amount,
        method: editForm.method,
        notes: editForm.note,
        date: combineDateAndTime(editForm.date, editForm.time),
      });
      toast.success("Payment updated.");
      setEditingPayment(null);
      await mutate();
      onPaymentChanged?.();
    } catch (error) {
      console.error("Failed to update buyer payment:", error);
      toast.error("Failed to update payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (payment: BuyerLedgerRow) => {
    if (!payment.paymentId) {
      return;
    }

    if (isMonthClosed) {
      toast.error(`${monthLabel ?? "Selected month"} is closed for edits.`);
      return;
    }

    if (!window.confirm("Delete this payment? This will recalculate the buyer balance.")) {
      return;
    }

    try {
      await axios.delete("/api/payments/buyer", {
        data: {
          paymentId: payment.paymentId,
          dairyId,
          buyerId: payment.buyerId,
        },
      });
      toast.success("Payment deleted.");
      await mutate();
      onPaymentChanged?.();
    } catch (error) {
      console.error("Failed to delete buyer payment:", error);
      toast.error("Failed to delete payment.");
    }
  };

  const handleExport = async () => {
    if (!exportUrl || isExporting) {
      return;
    }

    try {
      setIsExporting(true);
      await downloadFile(exportUrl);
    } catch (error) {
      console.error("Failed to export buyer ledger:", error);
      toast.error("Failed to export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Card className="shadow-md rounded-2xl border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data?.monthLabel ? `Showing ${data.monthLabel}` : "Recent milk entries and payments across all buyers"}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {showMonthPicker ? (
                <div className="w-full max-w-xs space-y-2">
                  <Label htmlFor="buyer-ledger-month">Month</Label>
                  <Input
                    id="buyer-ledger-month"
                    type="month"
                    value={month}
                    onChange={(event) => setInternalMonth(event.target.value)}
                  />
                </div>
              ) : null}
              {exportUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {isExporting ? "Exporting..." : "Export CSV"}
                </Button>
              ) : null}
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
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.ledger?.length > 0 ? (
                  data.ledger.map((item: BuyerLedgerRow) => (
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
                      <TableCell className="text-right">
                        {item.type === "PAYMENT" && item.paymentId ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                              disabled={isMonthClosed}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(item)} disabled={isMonthClosed}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {isMonthClosed ? "Locked" : "-"}
                          </span>
                        )}
                      </TableCell>
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

      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Buyer Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="buyer-payment-amount">Amount (Rs)</Label>
              <Input
                id="buyer-payment-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={editForm.amount}
                onChange={(event) => setEditForm((current) => ({ ...current, amount: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer-payment-method">Method</Label>
              <Select
                value={editForm.method}
                onValueChange={(value) =>
                  setEditForm((current) => ({ ...current, method: value as PaymentMethod }))
                }
              >
                <SelectTrigger id="buyer-payment-method">
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
              <Label htmlFor="buyer-payment-date">Date</Label>
              <Input
                id="buyer-payment-date"
                type="date"
                value={editForm.date}
                onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer-payment-time">Time</Label>
              <Input
                id="buyer-payment-time"
                type="time"
                value={editForm.time}
                onChange={(event) => setEditForm((current) => ({ ...current, time: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="buyer-payment-note">Remarks</Label>
              <Textarea
                id="buyer-payment-note"
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
    </>
  );
}
