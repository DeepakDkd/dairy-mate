"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import useSWR from "swr"
import { BuyerEntry } from "@prisma/client"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { PortalTableSkeleton } from "@/components/portal/portal-skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getMonthValue } from "@/utils/month"

const fetcher = (url: string) => fetch(url).then((response) => response.json())

export function BuyerMilkEntriesTable({
  selectedDairyId,
  month: controlledMonth,
  showMonthPicker = true,
}: {
  selectedDairyId: any;
  month?: string;
  showMonthPicker?: boolean;
}) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [internalMonth, setInternalMonth] = useState(getMonthValue())
  const month = controlledMonth ?? internalMonth

  const milkEntriesKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/buyers/milk-entries?page=${page}&pageSize=${limit}&month=${month}`

  const {
    data: milkEntries,
    error: milkEntriesError,
    isLoading: milkEntriesLoading,
  } = useSWR(milkEntriesKey ? milkEntriesKey : null, fetcher, {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (milkEntriesError) {
      toast.error("Failed to load buyer milk entries.")
    }
  }, [milkEntriesError])

  useEffect(() => {
    setPage(1)
  }, [month, selectedDairyId])

  const totalPages = milkEntries?.totalPages ?? 0

  return (
    <Card className="rounded-2xl border border-gray-100 shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Milk Entries</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {milkEntries?.monthLabel ? `Showing ${milkEntries.monthLabel}` : "Review entries month by month."}
            </p>
          </div>
          {showMonthPicker ? (
            <div className="w-full max-w-xs space-y-2">
              <Label htmlFor="buyer-milk-month">Month</Label>
              <Input
                id="buyer-milk-month"
                type="month"
                value={month}
                onChange={(event) => setInternalMonth(event.target.value)}
              />
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {milkEntriesLoading ? (
          <PortalTableSkeleton rows={5} columns={6} framed={false} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                    Shift
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                    Quantity (L)
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                    Rate (Rs/L)
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                    Amount (Rs)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {milkEntries?.entries?.length > 0 ? (
                  milkEntries.entries.map((entry: BuyerEntry) => (
                    <TableRow key={entry.id} className="transition-colors hover:bg-secondary/50">
                      <TableCell className="text-sm text-foreground">
                        {new Date(entry.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {
                          //@ts-ignore
                          entry?.buyer?.firstName} {entry?.buyer?.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            entry.shift === "MORNING"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {entry.shift}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {entry.litres}L
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        Rs {entry.rate}
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        Rs {entry.totalAmount.toLocaleString()}
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

            <div className="flex w-full items-center justify-between p-2">
              <span className="text-sm text-muted-foreground">
                Page {milkEntries?.page ?? page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={(milkEntries?.page ?? page) === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={!totalPages || (milkEntries?.page ?? page) === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
