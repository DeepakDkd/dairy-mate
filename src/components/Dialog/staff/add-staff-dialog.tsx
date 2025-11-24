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
import { Loader, Plus } from "lucide-react";
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
  phone: z.string().min(10, "Phone must be 10 digits"),
  email: z.string().email().optional(),
  dairyId: z.number("Dairy is required"),
  address: z.string().min(1, "Address is required"),
  status: z.enum(["active", "inactive"], { error: "Status is required" }),
  password: z.string().min(6, "Password must be at least 6 chars"),
  position: z.string().min(1, "Position is required"),
  shift: z.enum(["MORNING", "EVENING", "FULL_DAY"], {
    error: "Shift is required",
  }),
  salary: z.coerce.number().min(1, "Salary is required"),
  joinDate: z.coerce.date(),
  emergencyContact: z
    .string()
    .min(10, "Phone must be 10 digits")
    .optional(),
  notes: z.string().optional(),
});

type StaffFormData = z.infer<typeof StaffSchema>;

// ------------------ FETCHER ------------------
const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

// ------------------ COMPONENT ------------------

interface AddStaffDialogProps {
  onStaffAdded: (staff: any) => void;
  userId: number | undefined;
}

export function AddStaffDialog({ onStaffAdded, userId }: AddStaffDialogProps) {
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
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    //@ts-ignore
    resolver: zodResolver(StaffSchema),
  });

  const onSubmit = async (formData: StaffFormData) => {
    console.log("Final form data:", formData);

    try {
      const finalData = {
        ...formData,
        role: "STAFF",//auto
      }
      const res = await axios.post(`api/staff/create`, {
        ...finalData
      })
      toast.success("Staff is created successfully.");

      reset();
      setOpen(false);
    } catch (err) {
      console.log("Submit error:", err);
      toast.error("Failed to create staff.");
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

      {/* RESPONSIVE DIALOG */}
      <DialogContent className="w-[95%] max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Fill in the staff details correctly.
          </DialogDescription>
        </DialogHeader>

        <form
          // @ts-ignore
          onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ==== Names ==== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name*</Label>
              <Input {...register("firstName")} />
              {errors.firstName && (
                <p className="text-red-500 text-xs">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Last Name*</Label>
              <Input {...register("lastName")} />
              {errors.lastName && (
                <p className="text-red-500 text-xs">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* ==== Contact + Password ==== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input {...register("phone")} />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" {...register("password")} />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("email")} />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Dairy Select */}
            <div className="space-y-2">
              <Label>Select Dairy</Label>

              {isLoading ? (
                <Loader />
              ) : (
                <Controller
                  control={control}
                  name="dairyId"
                  render={({ field }) => (
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dairy" />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.dairies?.map(
                          (dairy: { id: number; name: string }) => (
                            <SelectItem key={dairy.id} value={String(dairy.id)}>
                              {dairy.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}

              {errors.dairyId && (
                <p className="text-red-500 text-xs">{errors.dairyId.message}</p>
              )}
            </div>
          </div>

          {/* ==== Address ==== */}
          <div className="space-y-2">
            <Label>Address</Label>
            <Input {...register("address")} />
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address.message}</p>
            )}
          </div>

          {/* ==== Status + Shift ==== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500 text-xs">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Shift</Label>
              <Controller
                control={control}
                name="shift"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning</SelectItem>
                      <SelectItem value="EVENING">Evening</SelectItem>
                      <SelectItem value="FULL_DAY">Full Day</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.shift && (
                <p className="text-red-500 text-xs">{errors.shift.message}</p>
              )}
            </div>
          </div>

          {/* ==== Position ==== */}
          <div className="space-y-2">
            <Label>Position*</Label>
            <Input {...register("position")} />
            {errors.position && (
              <p className="text-red-500 text-xs">{errors.position.message}</p>
            )}
          </div>

          {/* ==== Salary ==== */}
          <div className="space-y-2">
            <Label>Monthly Salary</Label>
            <Input type="number" {...register("salary")} />
            {errors.salary && (
              <p className="text-red-500 text-xs">{errors.salary.message}</p>
            )}
          </div>

          {/* ==== Join Date ==== */}
          <div className="space-y-2">
            <Label>Join Date</Label>
            <Input type="date" {...register("joinDate")} />
            {errors.joinDate && (
              <p className="text-red-500 text-xs">{errors.joinDate.message}</p>
            )}
          </div>

          {/* ==== Emergency Contact ==== */}
          <div className="space-y-2">
            <Label>Emergency Contact</Label>
            <Input {...register("emergencyContact")} />
            {errors.emergencyContact && (
              <p className="text-red-500 text-xs">
                {errors.emergencyContact.message}
              </p>
            )}
          </div>

          {/* ==== Notes ==== */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input {...register("notes")} />
          </div>

          {/* ==== Buttons ==== */}
          <div className="grid md:grid-cols-2 gap-4 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Add Staff Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

