// "use client";

// import { User } from "@prisma/client";
// import axios from "axios";
// import { useParams } from "next/navigation";
// import React from "react";
// import useSWR from "swr";


// interface dariyType {
//   pricingMode: "FAT_LR" | "MAWA"
// }


// const fetcher = async (url: string) => {
//   const response = await axios.get(url);
//   return response.data;
// };

// function Page() {
//   const { dairyId } = useParams();

//   const { data, isLoading, error } = useSWR(
//     `/api/dairies/${dairyId}`,
//     fetcher,
//     { revalidateOnFocus: false }
//   );

//   const dairyType = data?.dairy?.pricingMode
//   const users: User[] =
//     data?.dairy?.users?.filter((u: User) => u.role === "SELLER") || [];


//   return (
//     <>
//       <div>{dairyId}</div>

//       {isLoading ? (
//         "loading..."
//       ) : (
//         users.map((user) => (
//           <div key={user.id}>
//             {user.firstName} - {user.role}
//           </div>
//         ))
//       )}
//     </>
//   );
// }

// export default Page;
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";


const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function SellerEntryPage() {
  const { dairyId } = useParams();
  const [selectedSeller, setSelectedSeller] = useState<string>("");

  const { data, isLoading } = useSWR(`/api/dairies/${dairyId}`, fetcher, {
    revalidateOnFocus: false,
  });

  const dairy = data?.dairy;
  const pricingMode = dairy?.pricingMode;

  const sellers = dairy?.users?.filter(
    (u: any) => u.role === "SELLER"
  ) || [];

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

      {/* Seller Selector */}
      {
        isLoading ? "Loading":<Card>
        <CardHeader>
          <CardTitle className="text-base">Select Seller</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(v) => setSelectedSeller(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a seller" />
            </SelectTrigger>
            <SelectContent>
              {sellers.map((seller: any) => (
                <SelectItem className="" key={seller.id} value={String(seller.id)}>
                  {seller.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!selectedSeller && (
            <p className="text-xs text-muted-foreground mt-2">
              Select a seller to continue
            </p>
          )}
        </CardContent>
      </Card>
      }
      

      {/* Conditional Forms */}
      {selectedSeller && (
        <>
          {pricingMode === "FAT_LR" ? (
            <FatLRForm sellerId={selectedSeller} dairyId={dairyId} />
          ) : (
            <MawaForm sellerId={selectedSeller} dairy={dairy} dairyId={dairyId} />
          )}
        </>
      )}
    </div>
  );
}


/* ------------------------------------------------------------------
    FAT + LR BASED ENTRY FORM
------------------------------------------------------------------ */
function FatLRForm({ sellerId, dairyId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">FAT + LR Entry</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Litres */}
        <div>
          <Label>Litres</Label>
          <Input type="number" placeholder="Enter litres" />
        </div>

        {/* Fat */}
        <div>
          <Label>Fat %</Label>
          <Input type="number" placeholder="Enter fat (e.g. 4.2)" />
        </div>

        {/* LR */}
        <div>
          <Label>LR</Label>
          <Input type="number" placeholder="Enter LR (e.g. 28)" />
        </div>

        {/* Milk Type */}
        <div>
          <Label>Milk Type</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COW">Cow Milk</SelectItem>
              <SelectItem value="BUFFALO">Buffalo Milk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto Calculation Box */}
        <Card className="p-3 bg-muted">
          <p className="text-sm">Rate: ₹ -- </p>
          <p className="text-sm">Total Amount: ₹ -- </p>
        </Card>

        {/* Submit */}
        <Button className="w-full">Submit Entry</Button>
      </CardContent>
    </Card>
  );
}


/* ------------------------------------------------------------------
    MAWA BASED ENTRY FORM
------------------------------------------------------------------ */
function MawaForm({ sellerId, dairy, dairyId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mawa Based Entry</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Litres */}
        <div>
          <Label>Litres</Label>
          <Input type="number" placeholder="Enter litres" />
        </div>

        {/* Mawa per Litre */}
        <div>
          <Label>Mawa (grams per litre)</Label>
          <Input type="number" placeholder="e.g. 180" />
        </div>

        {/* Auto Calculation Box */}
        <Card className="p-3 bg-muted">
          <p className="text-sm">Total Grams: -- g</p>
          <p className="text-sm">Total Amount: ₹ -- </p>
          <p className="text-sm">Rate: ₹ -- / litre</p>
        </Card>

        {/* Submit */}
        <Button className="w-full">Submit Entry</Button>
      </CardContent>
    </Card>
  );
}
