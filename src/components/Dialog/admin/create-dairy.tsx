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
    if (isSubmitting) {
      return;
    }

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
              disabled={isSubmitting}
              onValueChange={(v) =>
                setValue("dairyMode", v as CreateDairyInput["dairyMode"], {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
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
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
