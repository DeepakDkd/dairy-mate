"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import useSWR from "swr"
import { BuyerEntry } from "@prisma/client"
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import axios from "axios"

import { PortalTableSkeleton } from "@/components/portal/portal-skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getMonthValue } from "@/utils/month"

const fetcher = (url: string) => fetch(url).then((response) => response.json())
const splitDateTime = (value: string | Date) => {
  const date = new Date(value)

  return {
    date: [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-"),
    time: [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
    ].join(":"),
  }
}

const combineDateAndTime = (date: string, time: string) => new Date(`${date}T${time}:00`)

type BuyerEntryRow = BuyerEntry & {
  buyer?: {
    firstName?: string
    lastName?: string
  }
}

export function BuyerMilkEntriesTable({
  selectedDairyId,
  month: controlledMonth,
  showMonthPicker = true,
  onEntryChanged,
}: {
  selectedDairyId: any;
  month?: string;
  showMonthPicker?: boolean;
  onEntryChanged?: () => void;
}) {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [internalMonth, setInternalMonth] = useState(getMonthValue())
  const [editingEntry, setEditingEntry] = useState<BuyerEntryRow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    litres: "",
    rate: "",
    date: "",
    time: "",
    shift: "MORNING" as "MORNING" | "EVENING",
  })
  const month = controlledMonth ?? internalMonth

  const milkEntriesKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/buyers/milk-entries?page=${page}&pageSize=${limit}&month=${month}`

  const {
    data: milkEntries,
    error: milkEntriesError,
    isLoading: milkEntriesLoading,
    mutate,
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
  const openEditDialog = (entry: BuyerEntryRow) => {
    const dateTime = splitDateTime(entry.date)
    setEditingEntry(entry)
    setEditForm({
      litres: String(entry.litres),
      rate: String(entry.rate),
      date: dateTime.date,
      time: dateTime.time,
      shift: entry.shift,
    })
  }

  const handleSave = async () => {
    if (!editingEntry) return

    const litres = Number(editForm.litres)
    const rate = Number(editForm.rate)

    if (!Number.isFinite(litres) || litres <= 0 || !Number.isFinite(rate) || rate <= 0) {
      toast.error("Enter valid litres and rate.")
      return
    }

    try {
      setIsSubmitting(true)
      await axios.put(`/api/milk-entries/buyer/${editingEntry.buyerId}`, {
        entryId: editingEntry.id,
        dairyId: editingEntry.dairyId,
        buyerId: editingEntry.buyerId,
        litres,
        rate,
        totalAmount: litres * rate,
        shift: editForm.shift,
        date: combineDateAndTime(editForm.date, editForm.time),
      })
      toast.success("Milk entry updated.")
      setEditingEntry(null)
      await mutate()
      onEntryChanged?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update milk entry.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (entry: BuyerEntryRow) => {
    if (!window.confirm("Delete this milk entry? This will update balances.")) {
      return
    }

    try {
      await axios.delete(`/api/milk-entries/buyer/${entry.buyerId}`, {
        data: {
          entryId: entry.id,
          dairyId: entry.dairyId,
          buyerId: entry.buyerId,
        },
      })
      toast.success("Milk entry deleted.")
      await mutate()
      onEntryChanged?.()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete milk entry.")
    }
  }

  return (
    <>
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
            <PortalTableSkeleton rows={5} columns={7} framed={false} />
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
                    <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milkEntries?.entries?.length > 0 ? (
                    milkEntries.entries.map((entry: BuyerEntryRow) => (
                      <TableRow key={entry.id} className="transition-colors hover:bg-secondary/50">
                        <TableCell className="text-sm text-foreground">
                          {new Date(entry.date).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {entry?.buyer?.firstName} {entry?.buyer?.lastName}
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(entry)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(entry)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Buyer Milk Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Litres</Label>
              <Input
                type="number"
                value={editForm.litres}
                onChange={(event) => setEditForm((current) => ({ ...current, litres: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Rate</Label>
              <Input
                type="number"
                value={editForm.rate}
                onChange={(event) => setEditForm((current) => ({ ...current, rate: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={editForm.time}
                onChange={(event) => setEditForm((current) => ({ ...current, time: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <select
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={editForm.shift}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    shift: event.target.value as "MORNING" | "EVENING",
                  }))
                }
              >
                <option value="MORNING">Morning</option>
                <option value="EVENING">Evening</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                value={`Rs ${(Number(editForm.litres || 0) * Number(editForm.rate || 0)).toFixed(2)}`}
                readOnly
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
