"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SellerEntry } from "@prisma/client"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SellerMilkTable({ selectedDairyId }: { selectedDairyId: any }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("name_asc");


  const milkEntriesKey = selectedDairyId && `/api/dairies/${selectedDairyId}/sellers/milk-entries?page=${page}&limit=${limit}&sort=${sort}`;

  const { data: milkEntries, isLoading: milkEntriesLoading, mutate: milkEntriesMutate } = useSWR(milkEntriesKey ? milkEntriesKey : null, fetcher, { revalidateOnFocus: false, dedupingInterval: 2000, });
  
  const totalPages = milkEntries?.totalEntries ? Math.ceil(milkEntries?.totalEntries / limit) : 0;


  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Entries (Newest First)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Shift</TableHead>
                <TableHead className="text-right font-semibold">Quantity (L)</TableHead>
                {/* <TableHead className="text-right font-semibold">Mawa/L</TableHead> */}
                <TableHead className="text-right font-semibold">Rate/L</TableHead>
                <TableHead className="text-right font-semibold">Total Amount</TableHead>
                <TableHead className="font-semibold text-right">Remarks(Fat)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                milkEntriesLoading ? "Loading..." :
                  milkEntries?.entries?.length > 0 ? milkEntries?.entries?.map((entry: SellerEntry) => (
                    <TableRow key={entry.id} className="hover:bg-secondary/50">
                      <TableCell className="font-medium">  {new Date(entry?.date).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {entry.shift}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{entry.litres}</TableCell>
                      {/* <TableCell className="text-right">{entry.mawaWeight}</TableCell> */}
                      <TableCell className="text-right">₹{entry?.rate}</TableCell>
                      <TableCell className="text-right font-semibold">₹{entry?.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground text-right">{entry.fat}</TableCell>
                    </TableRow>
                  )) : "No entries found"
              }
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || !totalPages}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || !totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
