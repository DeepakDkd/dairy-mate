"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import useSWR from "swr";

// ------------------ ZOD SCHEMA ------------------

const StaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dairyId: z.number(),
  address: z.string().min(1, "Address is required"),
  status: z.enum(["active", "inactive"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
  position: z.string().min(1, "Position is required"),
  shift: z.enum(["MORNING", "EVENING", "FULL_DAY"]),
  salary: z.coerce.number().min(1, "Salary is required"),
  joinDate: z.string().min(1, "Join date is required"),
  emergencyContact: z.string().min(10, "Emergency contact must be at least 10 digits").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type StaffFormData = z.infer<typeof StaffSchema>;

// ------------------ FETCHER ------------------
const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

interface AddStaffDialogProps {
  userId: number | undefined;
}

export function AddStaffDialog({ userId }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    // @ts-ignore
    resolver: zodResolver(StaffSchema),
    defaultValues: {
      status: "active",
      shift: "FULL_DAY",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      password: "",
      position: "",
      salary: 0,
      joinDate: "",
      emergencyContact: "",
      notes: "",
    }
  });

  const onSubmit = async (formData: StaffFormData) => {
    if (isSubmitting) return;

    try {
      const finalData = {
        ...formData,
        role: "STAFF",
      };
      
      await axios.post("/api/staff/create", finalData);
      toast.success("Staff profile created successfully.");
      reset();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create staff profile.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 cursor-pointer">
          <Plus size={18} />
          Add Staff
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95%] max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold">Add New Staff Member</DialogTitle>
          <DialogDescription className="text-xs">
            Enter payroll, shift schedule, and contact details to onboard a new employee.
          </DialogDescription>
        </DialogHeader>

        <form 
          // @ts-ignore
          onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Names */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">First Name *</Label>
              <Input {...register("firstName")} placeholder="e.g. Anil" className="h-10" />
              {errors.firstName && <p className="text-red-500 text-[10px] font-semibold">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Last Name *</Label>
              <Input {...register("lastName")} placeholder="e.g. Verma" className="h-10" />
              {errors.lastName && <p className="text-red-500 text-[10px] font-semibold">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number *</Label>
              <Input {...register("phone")} placeholder="e.g. 9876543210" className="h-10" />
              {errors.phone && <p className="text-red-500 text-[10px] font-semibold">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Password *</Label>
              <Input type="password" {...register("password")} placeholder="Min 6 characters" className="h-10" />
              {errors.password && <p className="text-red-500 text-[10px] font-semibold">{errors.password.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input {...register("email")} placeholder="e.g. anil@gmail.com" className="h-10" />
              {errors.email && <p className="text-red-500 text-[10px] font-semibold">{errors.email.message}</p>}
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
                <Controller
                  control={control}
                  name="dairyId"
                  render={({ field }) => (
                    <Select
                      disabled={isSubmitting}
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Choose a dairy profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.dairies?.map((d: { id: number; name: string }) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {errors.dairyId && <p className="text-red-500 text-[10px] font-semibold">{errors.dairyId.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Home Address *</Label>
            <Input {...register("address")} placeholder="e.g. Ward No. 3, Sanganer, Jaipur" className="h-10" />
            {errors.address && <p className="text-red-500 text-[10px] font-semibold">{errors.address.message}</p>}
          </div>

          {/* Status & Shift */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status *</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Onboarded)</SelectItem>
                      <SelectItem value="inactive">Inactive (Relieved)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-red-500 text-[10px] font-semibold">{errors.status.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Shift Schedule *</Label>
              <Controller
                control={control}
                name="shift"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Select shift schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning Shift (5 AM - 1 PM)</SelectItem>
                      <SelectItem value="EVENING">Evening Shift (1 PM - 9 PM)</SelectItem>
                      <SelectItem value="FULL_DAY">Full Day (Split hours)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.shift && <p className="text-red-500 text-[10px] font-semibold">{errors.shift.message}</p>}
            </div>
          </div>

          {/* Position & Salary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Job Designation / Position *</Label>
              <Input {...register("position")} placeholder="e.g. Milk Collector" className="h-10" />
              {errors.position && <p className="text-red-500 text-[10px] font-semibold">{errors.position.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Monthly Salary (INR) *</Label>
              <Input type="number" {...register("salary")} placeholder="e.g. 15000" className="h-10" />
              {errors.salary && <p className="text-red-500 text-[10px] font-semibold">{errors.salary.message}</p>}
            </div>
          </div>

          {/* Join Date & Emergency Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Date of Joining *</Label>
              <Input type="date" {...register("joinDate")} className="h-10" />
              {errors.joinDate && <p className="text-red-500 text-[10px] font-semibold">{errors.joinDate.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Emergency Phone Number</Label>
              <Input {...register("emergencyContact")} placeholder="e.g. 9876543211" className="h-10" />
              {errors.emergencyContact && <p className="text-red-500 text-[10px] font-semibold">{errors.emergencyContact.message}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Additional Notes (Optional)</Label>
            <Textarea {...register("notes")} placeholder="Enter background details or terms..." rows={2} className="resize-none" />
          </div>

          {/* Dialog Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="w-full h-10 cursor-pointer"
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting} className="w-full h-10 gap-2 cursor-pointer">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Staff Member"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
