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
import { useSWRConfig } from "swr"
import { Loader } from "lucide-react"


interface AddSellerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: number | undefined
}

const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
}
const SellerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dairyId: z.number(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type SellerFormData = z.infer<typeof SellerSchema>

export default function AddSellerDialog({ open, onOpenChange, userId }: AddSellerDialogProps) {


  // const { mutate } = useSWRConfig()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<SellerFormData>({
    resolver: zodResolver(SellerSchema),
    defaultValues: {
      status: "active",
    }
  })


  const { data, error, isLoading } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  // if (isLoading) {
  //   console.log("Loading owned dairies...");
  //   return <div>Loading dairies...</div>;
  // }
  // console.log("ownedDairies:", data?.dairies);

  const onSubmit = async (data: SellerFormData) => {
    try {
      const finalData = {
        ...data,
        role: "SELLER", // auto
      }



      const res = await axios.post("/api/seller/create", {
        ...finalData
      });

      // mutate(`/api/owner/${userId}/sellers`);
      toast.success("Seller created successfully")
      reset()
      onOpenChange(false)
    } catch (error:any) {
      console.error(error)
      toast.error(error.response.data.message ||"Failed to create seller")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-montserrat">
        <DialogHeader>
          <DialogTitle>Add New Seller</DialogTitle>
          <DialogDescription>Enter seller details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input {...register("firstName")} />
              {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input {...register("lastName")} />
              {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input {...register("phone")} />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
          </div>
          <div className="space-y-2 w-full">
            <Label>Select Dairy</Label>

            {isLoading ? (
              <Loader />
            ) : (
              <Select
                onValueChange={(value) => setValue("dairyId", Number(value))}
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

          {/* Address */}
          <div className="space-y-2">
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>

          {/* Status / Password */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* STATUS */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue="active"
                onValueChange={(value: "active" | "inactive") => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" {...register("password")} />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full grid md:grid-cols-2 gap-5">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Seller"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
