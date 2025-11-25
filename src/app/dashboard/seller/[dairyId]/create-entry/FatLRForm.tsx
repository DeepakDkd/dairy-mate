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
import { getMilkRate } from "@/app/lib/rateUtils";
import { useEffect, useState } from "react";

interface Data {
    type: "COW" | "BUFFALO";
    lr: number | undefined;
    fat: number | undefined;
    liter: number | undefined;
}

export function FatLRForm({ user, dairyId }: any) {
    const [rate, setRate] = useState(0);
    const [total, setTotal] = useState(0);

    const [data, setData] = useState<Data>({
        type: "COW",
        lr: undefined,
        fat: undefined,
        liter: undefined,
    });
    const calculate = () => {
        console.log("Clicked",data.type, data.lr, data.fat)
        
        if (data.lr == null || data.fat == null) return;
        const r = getMilkRate(data.type, data.fat, data.lr);
        console.log(r)
        setRate(r);
        
        if (data.liter == null) return;
        setTotal(rate * data.liter);
        console.log(rate,total)
    }

    // 👉 Calculate rate whenever type, lr or fat changes
    // useEffect(() => {
    //     if (data.lr == null || data.fat == null) return;

    //     const r = getMilkRate(data.type, data.lr, data.fat);
    //     setRate(r);
    // }, [data.type, data.lr, data.fat]);

    // // 👉 Calculate total whenever rate or liter changes
    // useEffect(() => {
    //     if (data.liter == null) return;
    //     setTotal(rate * data.liter);
    // }, [rate, data.liter]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">
                    Seller - {user?.firstName}
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
                <Button className="cursor-pointer" onClick={() => calculate()} >Calculate</Button>
                {/* Milk Type */}
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

                {/* Auto Calculation */}
                <Card className="p-3 bg-muted">
                    <p className="text-sm">Rate: ₹ {rate}</p>
                    <p className="text-sm">Total Amount: ₹ {total.toFixed(2)}</p>
                </Card>

                {/* Submit */}
                <Button className="w-full">Submit Entry</Button>
            </CardContent>
        </Card>
    );
}
