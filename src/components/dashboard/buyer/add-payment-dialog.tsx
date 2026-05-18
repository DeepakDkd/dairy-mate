"use client";

import type React from "react";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PartyOption {
  id: number;
  name: string;
}

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dairyId: number;
  buyers: PartyOption[];
  onSuccess?: () => void;
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  dairyId,
  buyers,
  onSuccess,
}: AddPaymentDialogProps) {
  const [buyerId, setBuyerId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [method, setMethod] = useState("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setBuyerId("");
    setPaymentAmount("");
    setRemarks("");
    setMethod("CASH");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!dairyId) {
      toast.error("Select a dairy first");
      return;
    }

    if (!buyerId) {
      toast.error("Select a buyer");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/api/payments/buyer", {
        dairyId,
        buyerId: Number(buyerId),
        amount: Number(paymentAmount),
        method,
        notes: remarks,
      });

      toast.success("Buyer payment recorded");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to record buyer payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Buyer Payment</DialogTitle>
          <DialogDescription>Record a payment received from a buyer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Buyer</Label>
            <Select value={buyerId} onValueChange={setBuyerId} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose buyer" />
              </SelectTrigger>
              <SelectContent>
                {buyers.map((buyer) => (
                  <SelectItem key={buyer.id} value={String(buyer.id)}>
                    {buyer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment-amount">Payment Amount (Rs)</Label>
            <Input
              id="payment-amount"
              type="number"
              placeholder="Enter payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
              min="1"
              step="0.01"
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={method} onValueChange={setMethod} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="BANK">Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              placeholder="Enter any remarks or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Payment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
