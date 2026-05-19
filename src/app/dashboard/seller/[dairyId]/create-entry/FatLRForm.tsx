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
import { getMilkRate } from "@/lib/rateUtils";
import { useState } from "react";
import toast from "react-hot-toast";
import { Dairy } from "@prisma/client";
import axios from "axios";
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

interface Data {
    type: "COW" | "BUFFALO";
    lr: number | undefined;
    fat: number | undefined;
    liter: number | undefined;
    shift: "MORNING" | "EVENING";
    date: string;
    time: string;
}

export function FatLRForm({ seller, dairy ,setSelectedSeller}: { seller: any; dairy: Dairy,setSelectedSeller:any }) {
    const [rate, setRate] = useState<number | null>(null);
    const [total, setTotal] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialDateTime = getCurrentDateTimeParts();

    const [data, setData] = useState<Data>({
        type: "COW",
        lr: undefined,
        fat: undefined,
        liter: undefined,
        shift: "MORNING",
        date: initialDateTime.date,
        time: initialDateTime.time,
    });

    const calculate = () => {
        if (data.lr == null || data.fat == null) return;

        // Auto detect milk type based on fat
        const milkType: "COW" | "BUFFALO" =
            data.fat <= 5 ? "COW" : "BUFFALO";

        if (data.fat <= 3 || data.fat > 10) {
            toast.error("Please enter a valid fat percentage between 3 and 10.");
            // alert("Please enter a valid fat percentage between 3 and 10.");
            return;
        }
        const lrList = [25, 26, 27, 28, 29, 30];
        if (!lrList.includes(data.lr)) {
            toast.error("Please enter a valid LR value like 25 | 26 | 27 | 28 | 29 | 30.");
            // alert("Please enter a valid LR value between 25 and 30.");
            return;
        }

        // Update type in state
        setData((prev) => ({
            ...prev,
            type: milkType,
        }));

        console.log("Calculating rate for:", { ...data, type: milkType });

        // Calculate rate using updated type
        const r = getMilkRate(milkType, data.fat, data.lr);
        setRate(r);

        if (data.liter == null) return;

        setTotal(r * data.liter);
    };

    async function submit() {
        if (isSubmitting) {
            return;
        }

        try {
            if (data.liter == null || data.fat == null || data.lr == null) {
                toast.error("Please fill all the fields before submitting.");
                return;
            }
            if (rate == null || total == null) {
                toast.error("Please calculate the rate and total before submitting.");
                return;
            }

            setIsSubmitting(true);
            const entryDate = combineDateAndTime(data.date, data.time);

            const response = await axios.post(`/api/milk-entries/seller/${seller.id}`, {
                dairyId: dairy.id,
                sellerId: seller.id,
                fat: data.fat,
                lr: data.lr,
                litres: data.liter,
                milkType: data.type,
                rate,
                totalAmount: total,
                shift: data.shift,
                date: entryDate,
            });
            if (!response.status.toString().startsWith("2")) {
                throw new Error("Failed to submit milk entry");
            }
            toast.success("Milk entry submitted successfully!");
            setSelectedSeller(undefined)
            const nextDefaultDateTime = getCurrentDateTimeParts();
            setData({
                type: "COW",
                lr: undefined,
                fat: undefined,
                liter: undefined,
                shift: "MORNING",
                date: nextDefaultDateTime.date,
                time: nextDefaultDateTime.time,
            });
            setRate(null);
            setTotal(null);

        } catch (error) {
            console.error("Error submitting milk entry:", error);
            toast.error("Failed to submit milk entry. Please try again.");
            return;
        } finally {
            setIsSubmitting(false);
        }

        console.log("Submitting data:", {
            ...data,
            rate,
            total,
            dairyId: dairy.id,
            userId: seller.id,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    Seller :
                    <div className="flex flex-col mt-2 space-y-1 text-sm font-normal">
                        <span>Name: {seller?.firstName} {seller?.lastName}</span>
                        <span>Mobile no. : {seller?.phone}</span>
                        <span>Address: {seller?.address}</span>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

                {/* Litres */}
                <div>
                    <Label>Litres</Label>
                    <Input
                        type="number"
                        placeholder="Enter litres"
                        value={data.liter ?? ""}
                        onChange={(e) =>
                            setData({ ...data, liter: Number(e.target.value) })
                        }
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                    <div>
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={data.date}
                            onChange={(e) =>
                                setData({ ...data, date: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <Label>Time</Label>
                        <Input
                            type="time"
                            value={data.time}
                            onChange={(e) =>
                                setData({ ...data, time: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* Fat */}
                <div>
                    <Label>Fat %</Label>
                    <Input
                        type="number"
                        placeholder="Enter fat (e.g. 4.2)"
                        value={data.fat ?? ""}
                        onChange={(e) =>
                            setData({ ...data, fat: Number(e.target.value) })
                        }
                    />
                </div>

                {/* LR */}
                <div>
                    <Label>LR</Label>
                    <Input
                        type="number"
                        placeholder="Enter LR (e.g. 28)"
                        value={data.lr ?? ""}
                        onChange={(e) =>
                            setData({ ...data, lr: Number(e.target.value) })
                        }
                    />
                </div>

                {/* Milk Type (auto updated) */}
               <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                 <div>
                    <Label>Milk Type</Label>
                    <Select
                        value={data.type}
                        onValueChange={(v: any) =>
                            setData({ ...data, type: v as "COW" | "BUFFALO" })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="COW">Cow Milk</SelectItem>
                            <SelectItem value="BUFFALO">Buffalo Milk</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Shift</Label>
                    <Select
                        value={data.shift}
                        onValueChange={(v: any) =>
                            setData({ ...data, shift: v as "MORNING" | "EVENING" })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MORNING">Morning</SelectItem>
                            <SelectItem value="EVENING">Evening</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
               </div>

                <Button onClick={calculate} className="cursor-pointer" disabled={isSubmitting}>
                    Calculate
                </Button>

                {/* Rate & Total */}
                {rate !== null && total !== null && (
                    <Card className="p-4 border border-gray-300--- rounded-lg bg-white--- shadow-sm">

                        {/* Receipt Header */}
                        <h3 className="text-md font-semibold text-center mb-3 border-b pb-2">
                            Milk Collection Receipt
                        </h3>

                        {/* Top Info */}
                        <div className="text-sm space-y-1 mb-3">
                            {/* <div className="flex justify-between">
                                <span className="font-medium">Receipt No:</span>
                                <span>{Math.floor(100000 + Math.random() * 900000)}</span>
                            </div> */}

                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium">Dairy Name:</span>
                                <span>{dairy.name}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium">Date & Time:</span>
                                <span>
                                    {combineDateAndTime(data.date, data.time).toLocaleString("en-IN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium">Seller:</span>
                                <span>{seller?.firstName} {seller?.lastName}</span>
                            </div>
                        </div>

                        {/* Milk Info */}
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium">Milk Type:</span>
                                <span>{data.type}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium">Fat %:</span>
                                <span>{data.fat}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium">LR:</span>
                                <span>{data.lr}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium">Litres:</span>
                                <span>{data.liter}</span>
                            </div>

                            <div className="flex justify-between pt-2 border-t mt-2">
                                <span className="font-semibold">Rate:</span>
                                <span className="font-semibold">₹ {rate}</span>
                            </div>

                            <div className="flex justify-between text-base font-bold pt-2 border-t mt-2">
                                <span>Total Amount:</span>
                                <span>₹ {total.toFixed(2)}</span>
                            </div>
                        </div>

                    </Card>
                )}


                <Button
                    onClick={submit}
                    disabled={total === null || isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving Entry...
                        </>
                    ) : (
                        "Submit Entry"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
