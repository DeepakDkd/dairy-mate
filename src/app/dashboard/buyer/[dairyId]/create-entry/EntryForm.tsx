"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { Dairy } from "@prisma/client";
import { Loader2 } from "lucide-react";

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

const buyerEntrySchema = z.object({
  litres: z.number().min(0.1, "Enter a valid litres amount"),
  rate: z.number().min(1, "Rate must be at least 1"),
  date: z.date({ message: "Date is required" }),
  shift: z.enum(["MORNING", "EVENING"]),
});

export function BuyerEntryForm({
  buyers,
  dairy,
  setSelectedSeller,
}: {
  buyers: any;
  dairy: Dairy;
  setSelectedSeller: any;
}) {
  const [total, setTotal] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialDateTime = getCurrentDateTimeParts();

  const [data, setData] = useState({
    litres: undefined as number | undefined,
    rate: undefined as number | undefined,
    date: initialDateTime.date,
    time: initialDateTime.time,
    shift: "MORNING" as "MORNING" | "EVENING",
  });

  // Auto calculate total when litres or rate changes
  useEffect(() => {
    if (data.litres != null && data.rate != null && data.litres > 0 && data.rate > 0) {
      setTotal(Number((data.litres * data.rate).toFixed(2)));
    } else {
      setTotal(null);
    }
  }, [data.litres, data.rate]);

  const submit = async () => {
    if (isSubmitting) return;

    try {
      const entryDate = combineDateAndTime(data.date, data.time);
      const parsed = buyerEntrySchema.parse({
        litres: data.litres,
        rate: data.rate,
        date: entryDate,
        shift: data.shift,
      });

      if (total === null) {
        toast.error("Please enter valid litres and rate details.");
        return;
      }

      setIsSubmitting(true);

      const response = await axios.post(
        `/api/milk-entries/buyer/${buyers.id}`,
        {
          dairyId: dairy.id,
          buyerId: buyers.id,
          litres: parsed.litres,
          rate: parsed.rate,
          totalAmount: total,
          shift: parsed.shift,
          date: parsed.date,
        }
      );

      if (!response.status.toString().startsWith("2")) {
        throw new Error("Failed to submit entry");
      }

      toast.success("Milk entry submitted successfully!");
      setSelectedSeller(undefined);
      
      const nextDefaultDateTime = getCurrentDateTimeParts();
      setData({
        litres: undefined,
        rate: undefined,
        date: nextDefaultDateTime.date,
        time: nextDefaultDateTime.time,
        shift: "MORNING",
      });
      setTotal(null);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit milk entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border/80 shadow-sm bg-card overflow-hidden">
      <CardHeader className="bg-muted/15 border-b border-border/40 pb-4">
        <CardTitle className="text-base font-bold">
          Buyer Details
          <div className="flex flex-col mt-2 space-y-1 text-xs font-medium text-muted-foreground">
            <span>Name: <strong className="text-foreground">{buyers?.firstName} {buyers?.lastName}</strong></span>
            <span>Mobile: <strong className="text-foreground">{buyers?.phone}</strong></span>
            <span>Address: <strong className="text-foreground">{buyers?.address || "N/A"}</strong></span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Litres */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Total Liters *</Label>
            <Input
              type="number"
              step="any"
              placeholder="e.g. 50"
              value={data.litres ?? ""}
              onChange={(e) =>
                setData({ ...data, litres: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              className="h-10"
              disabled={isSubmitting}
            />
          </div>

          {/* Rate */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Rate (per Litre) *</Label>
            <Input
              type="number"
              step="any"
              placeholder="e.g. 60"
              value={data.rate ?? ""}
              onChange={(e) =>
                setData({ ...data, rate: e.target.value === "" ? undefined : Number(e.target.value) })
              }
              className="h-10"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Date, Time and Shift inputs */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Shift *</Label>
            <Select
              value={data.shift}
              onValueChange={(v: "MORNING" | "EVENING") =>
                setData({ ...data, shift: v })
              }
              disabled={isSubmitting}
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
              value={data.date}
              onChange={(e) =>
                setData({ ...data, date: e.target.value })
              }
              className="h-10"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Time *</Label>
            <Input
              type="time"
              value={data.time}
              onChange={(e) =>
                setData({ ...data, time: e.target.value })
              }
              className="h-10"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Dynamic Calculation receipt container */}
        {total !== null && (
          <div className="rounded-xl border border-border/85 bg-muted/20 p-4 space-y-3.5 shadow-sm">
            <h3 className="text-xs font-bold text-center border-b border-border/40 pb-2 text-foreground">
              Milk Supply Receipt Preview
            </h3>

            <div className="text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Dairy Name:</span>
                <span className="font-semibold text-foreground">{dairy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Shift:</span>
                <span className="font-semibold text-foreground">{data.shift}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Date & Time:</span>
                <span className="font-semibold text-foreground">
                  {combineDateAndTime(data.date, data.time).toLocaleString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Rate:</span>
                <span className="font-semibold text-foreground">Rs {data.rate} / Litre</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Liters:</span>
                <span className="font-semibold text-foreground">{data.litres} L</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/40 text-sm font-bold">
                <span className="text-foreground">Total Amount:</span>
                <span className="text-primary font-black text-base">Rs {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={submit}
          disabled={total === null || isSubmitting}
          className="w-full h-11 text-sm font-semibold gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Entry...
            </>
          ) : (
            "Submit Buyer Entry"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
