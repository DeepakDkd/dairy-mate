"use client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { BuyerEntry } from "@prisma/client"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MilkEntry {
  id: string
  date: string
  shift: "Morning" | "Evening"
  quantity: number
  ratePerLitre: number
  totalAmount: number
  remarks: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());
export function BuyerMilkEntriesTable({ selectedDairyId }: { selectedDairyId: any }) {

  const [currentPage, setCurrentPage] = useState(1)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("name_asc");

  const milkEntriesKey = selectedDairyId && `/api/dairies/${selectedDairyId}/buyers/milk-entries?page=${page}&limit=${limit}&sort=${sort}`;

  const { data: milkEntries, isLoading: milkEntriesLoading, mutate: milkEntriesMutate } = useSWR(milkEntriesKey ? milkEntriesKey : null, fetcher, { revalidateOnFocus: false });
  console.log("Milk entries  :::", milkEntries)


  const totalPages = milkEntries?.totalEntries ? Math.ceil(milkEntries?.totalEntries / limit) : 0;

  return (
    <Card className="bg-white--- shadow-md rounded-2xl border border-gray-100---">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Milk Entries</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Last 10 entries (newest first)</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200--- hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Shift</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Quantity (L)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Rate (₹/L)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Amount (₹)
                </TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                milkEntriesLoading ? "Loading..." :
                  milkEntries?.entries?.length > 0 ? milkEntries?.entries?.map((entry: BuyerEntry) => (
                    <TableRow key={entry.id} className="border-b border-gray-100--- hover:bg-gray-50--- transition-colors">
                      <TableCell className="text-sm text-foreground">
                        {new Date(entry.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {entry?.buyer?.firstName} {entry?.buyer?.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${entry.shift === "MORNING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                        >
                          {entry.shift}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-foreground font-medium">{entry.litres}L</TableCell>
                      <TableCell className="text-right text-foreground">₹{entry.rate}</TableCell>
                      <TableCell className="text-right text-foreground font-medium">
                        ₹{entry.totalAmount.toLocaleString()}
                      </TableCell>
                      {/* <TableCell className="text-sm text-muted-foreground">{entry.totalAmount || "—"}</TableCell> */}
                    </TableRow>
                  )) : <div className="w-full text-center" >
                    <p>No entries found</p>
                  </div>

              }
            </TableBody>
          </Table>
          
        <div className="flex items-center justify-between   w-full p-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  )
}
