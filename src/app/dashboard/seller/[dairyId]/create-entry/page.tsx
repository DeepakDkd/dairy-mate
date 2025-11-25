
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
import { FatLRForm } from "./FatLRForm";
import { MawaForm } from "./MawaForm";
import SearchUser from "./SearchUser";
import { User } from "@prisma/client";


const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function SellerEntryPage() {
  const { dairyId } = useParams();
  const [user, setUser] = useState<User>();

  const { data, isLoading } = useSWR(`/api/dairies/${dairyId}`, fetcher, {
    revalidateOnFocus: false,
  });

  const dairy = data?.dairy;
  const pricingMode = dairy?.pricingMode;

  const sellers = dairy?.users?.filter(
    (u: any) => u.role === "SELLER"
  ) || [];

  const handleSelectUser = (id: number) => {
    console.log(id)
    const selectedUser = dairy?.users?.filter(
      (u: any) => u.id === id
    )[0] || {};
    setUser(selectedUser)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl--- mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Seller Milk Entry
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm">
            <span className="font-medium">Dairy:</span> {dairy?.name}
          </p>

          <p className="text-sm">
            <span className="font-medium">Pricing Mode:</span>{" "}
            {pricingMode === "FAT_LR" ? "Fat + LR Based" : "Mawa Based"}
          </p>

          {pricingMode === "MAWA" && (
            <p className="text-sm">
              <span className="font-medium">Mawa Price Per KG:</span>{" "}
              ₹{dairy?.mawaPricePerKg}
            </p>
          )}

          <Separator />
        </CardContent>
      </Card>

      {
        isLoading ? "Loading" : <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Seller</CardTitle>
            <SearchUser sellers={sellers} handleUser={handleSelectUser} />
          </CardHeader>
          <CardContent>
            {!user && (
              <p className="text-xs text-muted-foreground mt-2">
                Select a seller to continue
              </p>
            )}
            <Select
              value={user?.id ? String(user.id) : ""} onValueChange={(v) => handleSelectUser(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a seller" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller: any) => (
                  <SelectItem className="" key={seller.id} value={String(seller.id)}>
                    {seller?.firstName} {seller?.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      }


      {user && (
        <>
          {pricingMode === "FAT_LR" ? (
            <FatLRForm user={user}  />
          ) : (
            <MawaForm user={user} dairy={dairy} dairyId={dairyId} />
          )}
        </>
      )}
    </div>
  );
}

