"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AddMilkEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMilkEntryDialog({ open, onOpenChange }: AddMilkEntryDialogProps) {
  const [formData, setFormData] = useState({
    quantity: "",
    mawaWeight: "",
    ratePerLitre: "",
    shift: "Morning",
    remarks: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Milk Entry Submitted:", formData)
    setFormData({
      quantity: "",
      mawaWeight: "",
      ratePerLitre: "",
      shift: "Morning",
      remarks: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-montserrat">Add New Milk Entry</DialogTitle>
          <DialogDescription>Record a new milk collection entry</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Milk Quantity */}
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
          </div>

          {/* Mawa Weight */}
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

          {/* Rate Per Litre */}
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

          {/* Shift Selection */}
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

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks" className="font-medium">
              Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Add any remarks or notes"
              value={formData.remarks}
              onChange={(e:any) => setFormData({ ...formData, remarks: e.target.value })}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white">
              Submit Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
