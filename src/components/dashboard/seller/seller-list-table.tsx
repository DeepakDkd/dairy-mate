"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useSWRConfig } from "swr";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SellerListTable() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { mutate: globalMutate } = useSWRConfig();

  const [selectedDairyId, setSelectedDairyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState("name_asc");



  const { data: dairiesData } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );


  useEffect(() => {
    if (dairiesData?.dairies?.length > 0 && !selectedDairyId) {
      setSelectedDairyId(dairiesData.dairies[0].id);
    }
  }, [dairiesData]);


  const sellerKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/sellers?page=${page}&limit=${limit}&sort=${sort}`;

  const {
    data: sellerData,
    error: sellerError,
    isLoading: sellerLoading,
    mutate: sellerMutate,
  } = useSWR(sellerKey ? sellerKey : null, fetcher, { revalidateOnFocus: false, dedupingInterval: 2000, });

  // if (sellerError) return <p>Error loading sellers...</p>;

  const sellers = sellerData?.sellers ?? [];
  const pagination = sellerData?.totalpage;

  const refreshSellers = () => {
    if (sellerKey) {
      sellerMutate();
      globalMutate(sellerKey);
    }
  };

  const handleSelectDairy = (id: number) => {
    setSelectedDairyId(id);
    setPage(1);
    refreshSellers();
  };


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Seller List</h2>


      <div className="flex gap-3 overflow-x-auto pb-2">
        {dairiesData?.dairies?.map((d: any) => (
          <div
            key={d.id}
            onClick={() => handleSelectDairy(d.id)}
            className={`p-4 border rounded-lg cursor-pointer w-48
                ${selectedDairyId === d.id ? "border-blue-500 bg-blue-50---" : "border-gray-300---"}
            `}
          >
            <h3 className="font-semibold">{d.name}</h3>
            <p className="text-xs text-gray-500---">{d.address || "No address"}</p>
            <p className="text-xs mt-1">
              Sellers: {d.users?.filter((u: any) => u.role === "SELLER").length || 0}
            </p>
          </div>
        ))}
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sellers of Dairy #{selectedDairyId}</CardTitle>
        </CardHeader>
        <CardContent>
          {sellerLoading ? (
            <p>Loading sellers...</p>
          ) : sellers.length === 0 ? (
            <p>No sellers found for this dairy.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {sellers.map((seller: any) => (
                    <TableRow key={seller.id}>
                      <TableCell>
                        {seller.firstName} {seller.lastName}
                      </TableCell>
                      <TableCell>{seller.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            seller.status === "active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {seller.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}


          {pagination && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>

              <span>
                Page {pagination.page} of {pagination.totalSellers}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
