"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"

interface AddSellerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: number | undefined
}


const DairySchema = z.object({
  dairyName: z.string().optional(),
  dairyAddress: z.string().optional(),
  dairyEmail: z.string().optional(),
  dairyPhone: z.string().optional(),
  dairyMode: z.enum(["FAT_LR", "MAWA"]).optional(),
})

type DairyFormData = z.infer<typeof DairySchema>

export default function CreateDairyDialog({ open, onOpenChange, userId }: AddSellerDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<DairyFormData>({
    resolver: zodResolver(DairySchema),

  })
  const onSubmit = async (data: DairyFormData) => {
    try {
      console.log("userId in CreateDairyDialog:", userId);

      const res = await axios.post("/api/dairies/create", {
        ...data,
        createdById: userId
      });
      console.log("Submitting:", data)
      // TODO: call your API
      // await fetch("/api/sellers", { method: "POST", body: JSON.stringify(finalData) })

      toast.success("Dairy created successfully")
      reset()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to create dairy")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-montserrat">
        <DialogHeader>
          <DialogTitle>Add New Dairy</DialogTitle>
          <DialogDescription>Enter dairy details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Dairy Name *</Label>
              <Input {...register("dairyName")} />
              {errors.dairyName && <p className="text-red-500 text-xs">{errors.dairyName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Dairy Address *</Label>
              <Input {...register("dairyAddress")} />
              {errors.dairyAddress && <p className="text-red-500 text-xs">{errors.dairyAddress.message}</p>}
            </div>
          </div>

        
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input {...register("dairyPhone")} />
              {errors.dairyPhone && <p className="text-red-500 text-xs">{errors.dairyPhone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("dairyEmail")} />
              {errors.dairyEmail && <p className="text-red-500 text-xs">{errors.dairyEmail.message}</p>}
            </div>
          </div>

        

          <div>
            <Label>Pricing Mode*</Label>
            <Select
              onValueChange={(v) => setValue("dairyMode", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pricing mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FAT_LR">FAT + LR</SelectItem>
                <SelectItem value="MAWA">MAWA</SelectItem>
              </SelectContent>
            </Select>
            {errors.dairyMode && <p className="text-red-500 text-xs">{errors.dairyMode.message}</p>}
          </div>
          <div className="w-full grid md:grid-cols-2 gap-5">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Dairy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
