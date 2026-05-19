"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import useSWR from "swr"
import { SellerEntry } from "@prisma/client"
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
import { getMilkRate } from "@/lib/rateUtils"
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

type SellerEntryRow = SellerEntry & {
  seller?: {
    firstName?: string
    lastName?: string
  }
}

export function SellerMilkTable({
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
  const [editingEntry, setEditingEntry] = useState<SellerEntryRow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    litres: "",
    rate: "",
    fat: "",
    lr: "",
    milkType: "COW" as "COW" | "BUFFALO",
    date: "",
    time: "",
    shift: "MORNING" as "MORNING" | "EVENING",
  })
  const month = controlledMonth ?? internalMonth

  const milkEntriesKey =
    selectedDairyId &&
    `/api/dairies/${selectedDairyId}/sellers/milk-entries?page=${page}&pageSize=${limit}&month=${month}`

  const {
    data: milkEntries,
    error: milkEntriesError,
    isLoading: milkEntriesLoading,
    mutate,
  } = useSWR(milkEntriesKey ? milkEntriesKey : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  })

  const totalPages = milkEntries?.totalPages ?? 0
  const openEditDialog = (entry: SellerEntryRow) => {
    const dateTime = splitDateTime(entry.date)
    setEditingEntry(entry)
    setEditForm({
      litres: String(entry.litres),
      rate: String(entry.rate),
      fat: entry.fat == null ? "" : String(entry.fat),
      lr: entry.lr == null ? "" : String(entry.lr),
      milkType: entry.milkType,
      date: dateTime.date,
      time: dateTime.time,
      shift: entry.shift,
    })
  }

  const handleSave = async () => {
    if (!editingEntry) return

    const litres = Number(editForm.litres)
    const rate = Number(editForm.rate)
    const fat = editForm.fat === "" ? null : Number(editForm.fat)
    const lr = editForm.lr === "" ? null : Number(editForm.lr)

    if (!Number.isFinite(litres) || litres <= 0 || !Number.isFinite(rate) || rate <= 0) {
      toast.error("Enter valid litres and rate.")
      return
    }

    if (fat != null && (!Number.isFinite(fat) || fat < 0)) {
      toast.error("Enter a valid fat value.")
      return
    }

    if (lr != null && (!Number.isFinite(lr) || lr < 0)) {
      toast.error("Enter a valid LR value.")
      return
    }

    try {
      setIsSubmitting(true)
      await axios.put(`/api/milk-entries/seller/${editingEntry.sellerId}`, {
        entryId: editingEntry.id,
        dairyId: editingEntry.dairyId,
        sellerId: editingEntry.sellerId,
        litres,
        rate,
        totalAmount: litres * rate,
        fat,
        lr,
        milkType: editForm.milkType,
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

  const handleDelete = async (entry: SellerEntryRow) => {
    if (!window.confirm("Delete this milk entry? This will update balances.")) {
      return
    }

    try {
      await axios.delete(`/api/milk-entries/seller/${entry.sellerId}`, {
        data: {
          entryId: entry.id,
          dairyId: entry.dairyId,
          sellerId: entry.sellerId,
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

  useEffect(() => {
    if (milkEntriesError) {
      toast.error("Failed to load seller milk entries.")
    }
  }, [milkEntriesError])

  useEffect(() => {
    setPage(1)
  }, [month, selectedDairyId])

  useEffect(() => {
    if (!editingEntry || editForm.fat === "" || editForm.lr === "") {
      return
    }

    const fat = Number(editForm.fat)
    const lr = Number(editForm.lr)

    if (!Number.isFinite(fat) || !Number.isFinite(lr) || fat < 0 || lr < 0) {
      return
    }

    const computedRate = getMilkRate(editForm.milkType, fat, lr)

    if (computedRate == null) {
      return
    }

    setEditForm((current) =>
      current.rate === String(computedRate)
        ? current
        : { ...current, rate: String(computedRate) }
    )
  }, [editingEntry, editForm.fat, editForm.lr, editForm.milkType])

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Entries
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {milkEntries?.monthLabel ? `Showing ${milkEntries.monthLabel}` : "Review entries month by month."}
              </p>
            </div>
            {showMonthPicker ? (
              <div className="w-full max-w-xs space-y-2">
                <Label htmlFor="seller-milk-month">Month</Label>
                <Input
                  id="seller-milk-month"
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
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Shift</TableHead>
                    <TableHead className="text-right font-semibold">Quantity (L)</TableHead>
                    <TableHead className="text-right font-semibold">Rate/L</TableHead>
                    <TableHead className="text-right font-semibold">Total Amount</TableHead>
                    <TableHead className="text-right font-semibold">Remarks (Fat)</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milkEntries?.entries?.length > 0 ? (
                    milkEntries.entries.map((entry: SellerEntryRow) => (
                      <TableRow key={entry.id} className="hover:bg-secondary/50">
                        <TableCell className="font-medium">
                          {new Date(entry.date).toLocaleString("en-IN")}
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
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Page {milkEntries?.page ?? page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={(milkEntries?.page ?? page) === 1 || !totalPages}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={(milkEntries?.page ?? page) === totalPages || !totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Seller Milk Entry</DialogTitle>
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
              <Label>Fat</Label>
              <Input
                type="number"
                value={editForm.fat}
                onChange={(event) => setEditForm((current) => ({ ...current, fat: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>LR</Label>
              <Input
                type="number"
                value={editForm.lr}
                onChange={(event) => setEditForm((current) => ({ ...current, lr: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Milk Type</Label>
              <select
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={editForm.milkType}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    milkType: event.target.value as "COW" | "BUFFALO",
                  }))
                }
              >
                <option value="COW">Cow Milk</option>
                <option value="BUFFALO">Buffalo Milk</option>
              </select>
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
            <div className="space-y-2 md:col-span-2">
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
