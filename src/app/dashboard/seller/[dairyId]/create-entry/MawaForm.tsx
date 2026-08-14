"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const getCurrentDateTimeParts = () => {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join(":");

  return { date, time };
};

const combineDateAndTime = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
};

export function MawaForm({ 
  seller, 
  dairy, 
  dairyId, 
  setSelectedSeller 
}: { 
  seller: any; 
  dairy: any; 
  dairyId: any; 
  setSelectedSeller: any; 
}) {
  const [litres, setLitres] = useState<number | undefined>(undefined);
  const [mawa, setMawa] = useState<number | undefined>(undefined);
  const [shift, setShift] = useState<"MORNING" | "EVENING">("MORNING");
  const [date, setDate] = useState(getCurrentDateTimeParts().date);
  const [time, setTime] = useState(getCurrentDateTimeParts().time);
  
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const [totalGrams, setTotalGrams] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mawaPricePerKg = dairy?.mawaPricePerKg || 0;

  // Auto calculate when inputs change
  useEffect(() => {
    if (litres != null && mawa != null && mawaPricePerKg > 0) {
      const rate = mawa * (mawaPricePerKg / 1000);
      const total = litres * rate;
      const grams = litres * mawa;
      
      setCalculatedRate(Number(rate.toFixed(2)));
      setCalculatedTotal(Number(total.toFixed(2)));
      setTotalGrams(Number(grams.toFixed(2)));
    } else {
      setCalculatedRate(null);
      setCalculatedTotal(null);
      setTotalGrams(null);
    }
  }, [litres, mawa, mawaPricePerKg]);

  const submit = async () => {
    if (isSubmitting) return;

    if (litres == null || mawa == null) {
      toast.error("Please enter litres and mawa grams.");
      return;
    }

    if (calculatedRate == null || calculatedTotal == null) {
      toast.error("Invalid calculation. Check your pricing mode settings.");
      return;
    }

    try {
      setIsSubmitting(true);
      const entryDate = combineDateAndTime(date, time);

      const response = await axios.post(`/api/milk-entries/seller/${seller.id}`, {
        dairyId: Number(dairyId),
        sellerId: seller.id,
        fat: null,
        lr: null,
        litres,
        milkType: "COW", // default type required by backend validation schema
        rate: calculatedRate,
        totalAmount: calculatedTotal,
        shift,
        date: entryDate,
      });

      if (!response.status.toString().startsWith("2")) {
        throw new Error("Failed to submit entry");
      }

      toast.success("Mawa milk entry recorded successfully!");
      setSelectedSeller(undefined);
      
      // Reset form
      const nextTime = getCurrentDateTimeParts();
      setLitres(undefined);
      setMawa(undefined);
      setShift("MORNING");
      setDate(nextTime.date);
      setTime(nextTime.time);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border/80 shadow-sm bg-card overflow-hidden">
      <CardHeader className="bg-muted/15 border-b border-border/40 pb-4">
        <CardTitle className="text-base font-bold">
          Seller Details
          <div className="flex flex-col mt-2 space-y-1 text-xs font-medium text-muted-foreground">
            <span>Name: <strong className="text-foreground">{seller?.firstName} {seller?.lastName}</strong></span>
            <span>Mobile: <strong className="text-foreground">{seller?.phone}</strong></span>
            <span>Address: <strong className="text-foreground">{seller?.address || "N/A"}</strong></span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Litres input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Litres *</Label>
            <Input
              type="number"
              step="any"
              placeholder="e.g. 10.5"
              value={litres ?? ""}
              onChange={(e) => setLitres(e.target.value === "" ? undefined : Number(e.target.value))}
              className="h-10"
              disabled={isSubmitting}
            />
          </div>

          {/* Mawa grams input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Mawa (grams per litre) *</Label>
            <Input
              type="number"
              step="any"
              placeholder="e.g. 180"
              value={mawa ?? ""}
              onChange={(e) => setMawa(e.target.value === "" ? undefined : Number(e.target.value))}
              className="h-10"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Date and Time selectors */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Shift *</Label>
            <Select
              disabled={isSubmitting}
              value={shift}
              onValueChange={(v: "MORNING" | "EVENING") => setShift(v)}
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Morning Shift</SelectItem>
                <SelectItem value="EVENING">Evening Shift</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Date *</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Time *</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Calculation Box */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Mawa Price / Kg:</span>
            <span className="font-bold text-foreground">Rs {mawaPricePerKg}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Rate calculated:</span>
            <span className="font-bold text-foreground">
              {calculatedRate != null ? `Rs ${calculatedRate} / Litre` : "--"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Total Yield:</span>
            <span className="font-bold text-foreground">
              {totalGrams != null ? `${totalGrams} g` : "--"}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border/40">
            <span className="text-foreground font-semibold">Total Amount:</span>
            <span className="font-black text-primary text-base">
              {calculatedTotal != null ? `Rs ${calculatedTotal}` : "Rs --"}
            </span>
          </div>
        </div>

        {/* Submit */}
        <Button 
          type="button" 
          onClick={submit} 
          disabled={isSubmitting} 
          className="w-full h-11 text-sm font-semibold gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Recording Entry...
            </>
          ) : (
            "Submit Milk Entry"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
