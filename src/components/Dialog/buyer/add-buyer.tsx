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
import useSWR from "swr";
import { Loader2 } from "lucide-react"

interface AddBuyerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: number | undefined
}

const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
}

const BuyerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dairyId: z.number(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type BuyerFormData = z.infer<typeof BuyerSchema>

export default function AddBuyerDialog({ open, onOpenChange, userId }: AddBuyerDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<BuyerFormData>({
    resolver: zodResolver(BuyerSchema),
    defaultValues: {
      status: "active",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      password: "",
    }
  })

  const { data, isLoading } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const onSubmit = async (formData: BuyerFormData) => {
    if (isSubmitting) return;

    try {
      const finalData = {
        ...formData,
        role: "BUYER",
      }

      await axios.post(`/api/dairies/${formData.dairyId}/buyers/create`, finalData);
      toast.success("Buyer registered successfully")
      reset()
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to register buyer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95%] sm:max-w-lg rounded-2xl p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold">Add New Buyer</DialogTitle>
          <DialogDescription className="text-xs">
            Register a buyer client to track milk distribution billing and payments.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">First Name *</Label>
              <Input 
                {...register("firstName")} 
                placeholder="e.g. Suresh"
                className="h-10"
              />
              {errors.firstName && <p className="text-red-500 text-[10px] font-semibold">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Last Name *</Label>
              <Input 
                {...register("lastName")} 
                placeholder="e.g. Sharma"
                className="h-10"
              />
              {errors.lastName && <p className="text-red-500 text-[10px] font-semibold">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number *</Label>
              <Input 
                {...register("phone")} 
                placeholder="e.g. 9876543210"
                className="h-10"
              />
              {errors.phone && <p className="text-red-500 text-[10px] font-semibold">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input 
                {...register("email")} 
                type="email"
                placeholder="e.g. suresh@gmail.com"
                className="h-10"
              />
              {errors.email && <p className="text-red-500 text-[10px] font-semibold">{errors.email.message}</p>}
            </div>
          </div>

          {/* Select Dairy */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Select Dairy Business *</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 h-10 border rounded-lg px-3 bg-muted/20">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading dairies...</span>
              </div>
            ) : (
              <Select
                disabled={isSubmitting}
                onValueChange={(value) => setValue("dairyId", Number(value), { shouldValidate: true })}
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Choose a dairy profile" />
                </SelectTrigger>
                <SelectContent>
                  {data?.dairies?.map((dairy: { id: number, name: string }) => (
                    <SelectItem key={dairy.id} value={String(dairy.id)}>
                      {dairy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.dairyId && <p className="text-red-500 text-[10px] font-semibold">{errors.dairyId.message}</p>}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Home / Business Address</Label>
            <Input 
              {...register("address")} 
              placeholder="e.g. Plot 15, Vaishali Nagar, Jaipur"
              className="h-10"
            />
          </div>

          {/* Status & Password */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status *</Label>
              <Select
                disabled={isSubmitting}
                defaultValue="active"
                onValueChange={(value: "active" | "inactive") => setValue("status", value, { shouldValidate: true })}
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Billed normally)</SelectItem>
                  <SelectItem value="inactive">Inactive (Frozen)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Password *</Label>
              <Input 
                type="password" 
                {...register("password")} 
                placeholder="Min 6 characters"
                className="h-10"
              />
              {errors.password && <p className="text-red-500 text-[10px] font-semibold">{errors.password.message}</p>}
            </div>
          </div>

          {/* Dialog Action Buttons */}
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
                "Create Buyer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
