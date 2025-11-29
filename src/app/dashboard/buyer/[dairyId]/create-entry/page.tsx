
"use client";

import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { useParams } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { User } from "@prisma/client";
import SearchUser from "./SearchUser";
import { BuyerEntryForm } from "./EntryForm";


const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function BuyerEntryPage() {
  const { dairyId } = useParams();
  const [buyer, setBuyer] = useState<User>();

  const { data, isLoading } = useSWR(`/api/dairies/${dairyId}`, fetcher, {
    revalidateOnFocus: false,
  });

  const dairy = data?.dairy;
  const pricingMode = dairy?.pricingMode;

  const buyers = dairy?.users?.filter(
    (u: any) => u.role === "BUYER"
  ) || [];

  const handleSelectUser = (id: number) => {
    console.log(id)
    const selectedUser = dairy?.users?.filter(
      (u: any) => u.id === id
    )[0] || {};
    setBuyer(selectedUser)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl--- mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Buyer Milk Entry
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm">
            <span className="font-medium">Dairy:</span> {dairy?.name}
          </p>

          {/* <p className="text-sm">
            <span className="font-medium">Pricing Mode:</span>{" "}
            {pricingMode === "FAT_LR" ? "Fat + LR Based" : "Mawa Based"}
          </p> */}

          {/* {pricingMode === "MAWA" && (
            <p className="text-sm">
              <span className="font-medium">Mawa Price Per KG:</span>{" "}
              ₹{dairy?.mawaPricePerKg}
            </p>
          )} */}

          <Separator />
        </CardContent>
      </Card>

      {
        isLoading ? "Loading" : <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Buyer</CardTitle>
            <SearchUser sellers={buyers} handleUser={handleSelectUser} />
          </CardHeader>
          <CardContent>
            {!buyer && (
              <p className="text-xs text-muted-foreground mt-2">
                Select a seller to continue
              </p>
            )}
            <Select
              value={buyer?.id ? String(buyer.id) : ""} onValueChange={(v) => handleSelectUser(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a buyer" />
              </SelectTrigger>
              <SelectContent>
                {buyers.map((s: any) => (
                  <SelectItem className="" key={s.id} value={String(s.id)}>
                    {s?.firstName} {s?.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      }


      {buyer && (
        <> <BuyerEntryForm buyers={buyer} dairy={dairy} setSelectedSeller={setBuyer}/>
        </>
      )}
    </div>
  );
}

