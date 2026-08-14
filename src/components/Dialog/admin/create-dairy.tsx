"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { CreateDairyInput, CreateDairySchema } from "@/lib/validators/dairy"

interface CreateDairyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateDairyDialog({ open, onOpenChange }: CreateDairyDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateDairyInput>({
    resolver: zodResolver(CreateDairySchema),
    defaultValues: {
      dairyName: "",
      dairyAddress: "",
      dairyEmail: "",
      dairyPhone: "",
    },
  })
  
  const onSubmit = async (data: CreateDairyInput) => {
    if (isSubmitting) return;

    try {
      await axios.post("/api/dairies/create", data);
      toast.success("Dairy created successfully")
      reset()
      onOpenChange(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.message || "Failed to create dairy")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95%] sm:max-w-lg rounded-2xl p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold">Add New Dairy</DialogTitle>
          <DialogDescription className="text-xs">
            Enter the details for your new dairy profile to begin managing sellers and buyers.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Dairy Name *</Label>
              <Input 
                {...register("dairyName")} 
                placeholder="e.g. Krishna Dairy"
                className="h-10"
              />
              {errors.dairyName && <p className="text-red-500 text-[10px] font-semibold">{errors.dairyName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Dairy Address *</Label>
              <Input 
                {...register("dairyAddress")} 
                placeholder="e.g. Near Main Market, Jaipur"
                className="h-10"
              />
              {errors.dairyAddress && <p className="text-red-500 text-[10px] font-semibold">{errors.dairyAddress.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number *</Label>
              <Input 
                {...register("dairyPhone")} 
                placeholder="e.g. 9876543210"
                className="h-10"
              />
              {errors.dairyPhone && <p className="text-red-500 text-[10px] font-semibold">{errors.dairyPhone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address (Optional)</Label>
              <Input 
                {...register("dairyEmail")} 
                type="email"
                placeholder="e.g. contact@krishnadairy.com"
                className="h-10"
              />
              {errors.dairyEmail && <p className="text-red-500 text-[10px] font-semibold">{errors.dairyEmail.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Pricing mode *</Label>
            <Select
              disabled={isSubmitting}
              onValueChange={(v) =>
                setValue("dairyMode", v as CreateDairyInput["dairyMode"], {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Select calculation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FAT_LR">FAT + LR Calculation Mode</SelectItem>
                <SelectItem value="MAWA">MAWA Flat Rate Mode</SelectItem>
              </SelectContent>
            </Select>
            {errors.dairyMode && <p className="text-red-500 text-[10px] font-semibold">{errors.dairyMode.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-border/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
              className="w-full h-10 cursor-pointer"
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting} className="w-full h-10 gap-2 cursor-pointer">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Create Dairy"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
