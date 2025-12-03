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

export function BuyerListTable() {
  const { data: session } = useSession();
  const userId = session?.user?.id;


  const { mutate: globalMutate } = useSWRConfig();

  const [selectedDairyId, setSelectedDairyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort, setSort] = useState("name_asc");



  const { data: dairiesData, error: dairiesError, isLoading: dairiesLoading } = useSWR(
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


  const buyerKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/buyers?page=${page}&limit=${limit}&sort=${sort}`;

  const {
    data: buyerData,
    error: buyerError,
    isLoading: buyerLoading,
    mutate: buyerMutate,
  } = useSWR(buyerKey ? buyerKey : null, fetcher, { revalidateOnFocus: false, dedupingInterval: 2000, });



  const buyers = buyerData?.buyers ?? [];
  const pagination = buyerData?.totalpage;

  const refreshBuyers = () => {
    if (buyerKey) {
      buyerMutate();
      globalMutate(buyerKey);
    }
  };

  const handleSelectDairy = (id: number) => {
    setSelectedDairyId(id);
    setPage(1);
    refreshBuyers();
  };

  return (
    <div className="space-y-6">
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
              Buyers: {d.users?.filter(
                (u: any) => u.role === "BUYER"
              ).length || 0
              }
            </p>
          </div>
        ))}
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buyers of  {dairiesData?.dairies?.find((d:any) => d.id === selectedDairyId)?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {buyerLoading ? (
            <p>Loading buyers...</p>
          ) : buyers.length === 0 ? (
            <p>No buyers found for this dairy.</p>
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
                  {buyers.map((buyer: any) => (
                    <TableRow key={buyer.id}>
                      <TableCell>
                        {buyer.firstName} {buyer.lastName}
                      </TableCell>
                      <TableCell>{buyer.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            buyer.status === "active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {buyer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(buyer.createdAt).toLocaleDateString()}
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
