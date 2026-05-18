"use client";

import type React from "react";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

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
  sellers: PartyOption[];
  onSuccess?: () => void;
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  dairyId,
  sellers,
  onSuccess,
}: AddPaymentDialogProps) {
  const [sellerId, setSellerId] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [method, setMethod] = useState("CASH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSellerId("");
    setAmount("");
    setRemarks("");
    setMethod("CASH");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dairyId) {
      toast.error("Select a dairy first");
      return;
    }

    if (!sellerId) {
      toast.error("Select a seller");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/api/payments/seller", {
        dairyId,
        sellerId: Number(sellerId),
        amount: Number(amount),
        method,
        notes: remarks,
      });

      toast.success("Seller payment recorded");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to record seller payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-montserrat">Add Seller Payment</DialogTitle>
          <DialogDescription>Record a payment made to a seller.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Seller</Label>
            <Select value={sellerId} onValueChange={setSellerId} disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose seller" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={String(seller.id)}>
                    {seller.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="font-medium">
              Payment Amount (Rs) *
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter payment amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
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

          <div className="space-y-2">
            <Label htmlFor="remarks" className="font-medium">
              Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Add payment notes or reference"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90 text-white">
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
