"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import useSWR from "swr"
import { SellerEntry } from "@prisma/client"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { PortalTableSkeleton } from "@/components/portal/portal-skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export function SellerMilkTable({ selectedDairyId }: { selectedDairyId: any }) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [sort] = useState("name_asc")

  const milkEntriesKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/sellers/milk-entries?page=${page}&limit=${limit}&sort=${sort}`

  const {
    data: milkEntries,
    error: milkEntriesError,
    isLoading: milkEntriesLoading,
  } = useSWR(milkEntriesKey ? milkEntriesKey : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  })

  const totalPages = milkEntries?.totalEntries
    ? Math.ceil(milkEntries?.totalEntries / limit)
    : 0

  useEffect(() => {
    if (milkEntriesError) {
      toast.error("Failed to load seller milk entries.")
    }
  }, [milkEntriesError])

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Recent Entries (Newest First)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {milkEntriesLoading ? (
          <PortalTableSkeleton rows={5} columns={6} framed={false} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Shift</TableHead>
                  <TableHead className="text-right font-semibold">Quantity (L)</TableHead>
                  <TableHead className="text-right font-semibold">Rate/L</TableHead>
                  <TableHead className="text-right font-semibold">Total Amount</TableHead>
                  <TableHead className="text-right font-semibold">Remarks (Fat)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milkEntries?.entries?.length > 0 ? (
                  milkEntries.entries.map((entry: SellerEntry) => (
                    <TableRow key={entry.id} className="hover:bg-secondary/50">
                      <TableCell className="font-medium">
                        {new Date(entry.date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-blue-700"
                        >
                          {entry.shift}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{entry.litres}</TableCell>
                      <TableCell className="text-right">Rs {entry.rate}</TableCell>
                      <TableCell className="text-right font-semibold">
                        Rs {entry.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {entry.fat}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No entries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || !totalPages}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || !totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
