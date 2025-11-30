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
import { useState } from "react";
import axios from "axios";
import { z } from "zod";
import { Dairy } from "@prisma/client";

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

  const [data, setData] = useState({
    litres: undefined as number | undefined,
    rate: undefined as number | undefined,
    date: undefined as Date | undefined,
    shift: "MORNING" as "MORNING" | "EVENING",
  });

  const calculate = () => {
    try {
      const parsed = buyerEntrySchema.parse({
        litres: data.litres,
        rate: data.rate,
        date: data.date,
        shift: data.shift,
      });

      setTotal(parsed.litres * parsed.rate);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
      }
    }
  };

  const submit = async () => {
    try {
      const parsed = buyerEntrySchema.parse({
        litres: data.litres,
        rate: data.rate,
        date: data.date,
        shift: data.shift,
      });

      if (total === null) {
        toast.error("Please calculate the total before submitting.");
        return;
      }

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

      toast.success("Milk entry submitted successfully!");

      setSelectedSeller(undefined);
      setData({
        litres: undefined,
        rate: undefined,
        date: undefined,
        shift: "MORNING",
      });
      setTotal(null);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
      toast.error("Failed to submit milk entry.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Buyer :
          <div className="flex flex-col mt-2 space-y-1 text-sm font-normal">
            <span>
              Name: {buyers?.firstName} {buyers?.lastName}
            </span>
            <span>Mobile: {buyers?.phone}</span>
            <span>Address: {buyers?.address}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2 md:gap-5">
          <div>
            <Label>Total Liters</Label>
            <Input
              type="number"
              placeholder="Enter total liters"
              value={data.litres ?? ""}
              onChange={(e) =>
                setData({ ...data, litres: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <Label>Rate</Label>
            <Input
              type="number"
              placeholder="Enter rate"
              value={data.rate ?? ""}
              onChange={(e) =>
                setData({ ...data, rate: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={data.date ? data.date.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setData({ ...data, date: new Date(e.target.value) })
              }
            />
          </div>

          <div>
            <Label>Shift</Label>
            <Select
              value={data.shift}
              onValueChange={(v: "MORNING" | "EVENING") =>
                setData({ ...data, shift: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MORNING">Morning</SelectItem>
                <SelectItem value="EVENING">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculate}>Calculate</Button>

        {total !== null && (
          <Card className="p-4 border rounded-lg  shadow-sm">
            <h3 className="text-md font-semibold text-center mb-3 border-b pb-2">
              Milk Collection Receipt
            </h3>

            <div className="text-sm space-y-1 mb-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Dairy Name:</span>
                <span>{dairy.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Buyer:</span>
                <span>
                  {buyers?.firstName} {buyers?.lastName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Shift:</span>
                <span className="">{data.shift}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>
                  {data.date?.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Rate:</span>
                <span>{data.rate}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Total Liters:</span>
                <span>{data.litres}</span>
              </div>

              <div className="flex justify-between pt-2 border-t mt-2 text-base font-bold">
                <span>Total Amount:</span>
                <span>₹ {total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        )}

        <Button
          onClick={submit}
          disabled={total === null}
          className="w-full"
        >
          Submit Entry
        </Button>
      </CardContent>
    </Card>
  );
}
