"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const EditStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  status: z.enum(["active", "inactive"]),
  password: z.string().optional().or(z.literal("")),
  position: z.string().min(1, "Position is required"),
  staffRole: z.enum(["MILK_COLLECTOR", "SENIOR_MILK_COLLECTOR", "MILK_TESTER", "QUALITY_AUDITOR", "MANAGER", "HELPER"]),
  shift: z.enum(["MORNING", "EVENING", "FULL_DAY"]),
  salary: z.coerce.number().min(1, "Salary is required"),
  joinDate: z.string().min(1, "Join date is required"),
  emergencyContact: z.string().min(10, "Emergency contact must be at least 10 digits").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type EditStaffFormData = z.infer<typeof EditStaffSchema>;

interface EditStaffDialogProps {
  staffMember: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditStaffDialog({ staffMember, open, onOpenChange, onSuccess }: EditStaffDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditStaffFormData>({
    // @ts-ignore
    resolver: zodResolver(EditStaffSchema),
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
      staffRole: "HELPER",
      salary: 0,
      joinDate: "",
      emergencyContact: "",
      notes: "",
    }
  });

  // Pre-fill values when staffMember changes
  useEffect(() => {
    if (staffMember) {
      const joinDateStr = staffMember.staffProfile?.joinDate 
        ? new Date(staffMember.staffProfile.joinDate).toISOString().split("T")[0] 
        : "";

      reset({
        firstName: staffMember.firstName || "",
        lastName: staffMember.lastName || "",
        phone: staffMember.phone || "",
        email: staffMember.email || "",
        address: staffMember.address || "",
        password: "", // Keep password empty unless changing
        status: (staffMember.status?.toLowerCase() === "active" ? "active" : "inactive") as "active" | "inactive",
        position: staffMember.staffProfile?.position || "",
        staffRole: staffMember.staffProfile?.role || "HELPER",
        shift: staffMember.staffProfile?.shift || "FULL_DAY",
        salary: staffMember.staffProfile?.salary || 0,
        joinDate: joinDateStr,
        emergencyContact: staffMember.staffProfile?.emergencyContact || "",
        notes: staffMember.staffProfile?.notes || "",
      });
    }
  }, [staffMember, reset]);

  const onSubmit = async (formData: EditStaffFormData) => {
    if (isSubmitting || !staffMember) return;

    try {
      const finalData = {
        ...formData,
        // Only send password if it is provided and has length
        password: formData.password && formData.password.trim().length >= 6 ? formData.password : undefined,
      };

      await axios.put(`/api/staff/${staffMember.dairyId}/${staffMember.id}`, finalData);
      toast.success("Staff profile updated successfully.");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update staff profile.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold">Edit Staff Profile</DialogTitle>
          <DialogDescription className="text-xs">
            Modify employee info, system permissions, shift schedules, and salary parameters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label className="text-xs font-semibold">Password (Leave blank to keep current)</Label>
              <Input type="password" {...register("password")} placeholder="New password" className="h-10" />
              {errors.password && <p className="text-red-500 text-[10px] font-semibold">{errors.password.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input {...register("email")} placeholder="e.g. anil@gmail.com" className="h-10" />
              {errors.email && <p className="text-red-500 text-[10px] font-semibold">{errors.email.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Home Address *</Label>
            <Input {...register("address")} placeholder="e.g. Ward No. 3, Sanganer, Jaipur" className="h-10" />
            {errors.address && <p className="text-red-500 text-[10px] font-semibold">{errors.address.message}</p>}
          </div>

          {/* Status & Staff System Role */}
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
              <Label className="text-xs font-semibold">Staff System Role *</Label>
              <Controller
                control={control}
                name="staffRole"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Select system role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HELPER">Helper (General Staff)</SelectItem>
                      <SelectItem value="MILK_COLLECTOR">Milk Collector</SelectItem>
                      <SelectItem value="SENIOR_MILK_COLLECTOR">Senior Milk Collector</SelectItem>
                      <SelectItem value="MILK_TESTER">Milk Tester</SelectItem>
                      <SelectItem value="QUALITY_AUDITOR">Quality Auditor</SelectItem>
                      <SelectItem value="MANAGER">Manager (Admin Access)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.staffRole && <p className="text-red-500 text-[10px] font-semibold">{errors.staffRole.message}</p>}
            </div>
          </div>

          {/* Shift Schedule & Job Designation */}
          <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Job Designation / Position *</Label>
              <Input {...register("position")} placeholder="e.g. Milk Collector" className="h-10" />
              {errors.position && <p className="text-red-500 text-[10px] font-semibold">{errors.position.message}</p>}
            </div>
          </div>

          {/* Monthly Salary & Date of Joining */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Monthly Salary (INR) *</Label>
              <Input type="number" {...register("salary")} placeholder="e.g. 15000" className="h-10" />
              {errors.salary && <p className="text-red-500 text-[10px] font-semibold">{errors.salary.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Date of Joining *</Label>
              <Input type="date" {...register("joinDate")} className="h-10" />
              {errors.joinDate && <p className="text-red-500 text-[10px] font-semibold">{errors.joinDate.message}</p>}
            </div>
          </div>

          {/* Emergency Phone Number */}
          <div className="grid gap-4 sm:grid-cols-2">
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
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
