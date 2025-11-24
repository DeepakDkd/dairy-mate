"use client"

import type React from "react"
import { z } from "zod";
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import axios from "axios";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddMilkEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
}
const milkEntrySchema = z.object({
  quantity: z.number().min(0, "Quantity must be a positive number"),
  mawaWeight: z.number().min(0, "Mawa weight must be a positive number"),
  ratePerLitre: z.number().min(0, "Rate per litre must be a positive number"),
  shift: z.enum(["Morning", "Evening"]),
  remarks: z.string().optional(),
})

export function AddMilkEntryDialog({ open, onOpenChange }: AddMilkEntryDialogProps) {

  const router = useRouter();

  const session = useSession();

  const userId = session.data?.user?.id;
  const { data, error, isLoading } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const [dairyId,setDairyId]= useState();

  // const [formData, setFormData] = useState({
  //   quantity: "",
  //   mawaWeight: "",
  //   ratePerLitre: "",
  //   shift: "Morning",
  //   remarks: "",
  // })

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   // Handle form submission
  //   console.log("Milk Entry Submitted:", formData)
  //   setFormData({
  //     quantity: "",
  //     mawaWeight: "",
  //     ratePerLitre: "",
  //     shift: "Morning",
  //     remarks: "",
  //   })
  //   onOpenChange(false)
  // }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-montserrat">Add New Milk Entry</DialogTitle>
          <DialogDescription>Record a new milk collection entry</DialogDescription>
        </DialogHeader>
          <div className="space-y-2 w-full">
            <Label>Select Dairy</Label>

            {isLoading ? (
              <Loader />
            ) : (
              <Select
                onValueChange={(value) => router.push(`/dashboard/seller/${value}/create-entry`)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dairy" />
                </SelectTrigger>
                <SelectContent>
                  {
                    data?.dairies?.map((dairy: { id: number, name: string }) => (
                      <SelectItem key={dairy.id} value={(String(dairy.id))}>{dairy.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            )}
          </div>

        {/* <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="font-medium">
              Milk Quantity (Litres) *
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
            {formData.quantity && milkEntrySchema.shape.quantity.safeParse(Number(formData.quantity)).success === false && (
              <p className="text-red-500 text-sm">Quantity must be a positive number</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mawa" className="font-medium">
              Mawa Weight Per Litre *
            </Label>
            <Input
              id="mawa"
              type="number"
              step="0.1"
              placeholder="Enter mawa weight"
              value={formData.mawaWeight}
              onChange={(e) => setFormData({ ...formData, mawaWeight: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate" className="font-medium">
              Rate Per Litre (₹) *
            </Label>
            <Input
              id="rate"
              type="number"
              placeholder="Enter rate"
              value={formData.ratePerLitre}
              onChange={(e) => setFormData({ ...formData, ratePerLitre: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift" className="font-medium">
              Shift *
            </Label>
            <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
              <SelectTrigger id="shift">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks" className="font-medium">
              Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Add any remarks or notes"
              value={formData.remarks}
              onChange={(e: any) => setFormData({ ...formData, remarks: e.target.value })}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white">
              Submit Entry
            </Button>
          </div>
        </form> */}
      </DialogContent>
    </Dialog>
  )
}
