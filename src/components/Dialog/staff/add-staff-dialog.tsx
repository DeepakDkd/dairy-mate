"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import useSWR from "swr"
import { SWRConfig } from "swr"

interface AddStaffDialogProps {
  onStaffAdded: (staff: any) => void
  userId: string
}

const fetcher = async (url: string) => {
  const response = await axios.post(url);
  console.log("axios fetcher response", response)
  return response.data;
}

const StaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dairyId: z.string(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // role: z.enum(["MILK_COLLECTOR", "SENIOR_MILK_COLLECTOR", "MILK_TESTER", "QUALITY_AUDITOR", "MANAGER", "HELPER"]),
  position: z.string().min(1, "Staff position/role is required"),
  salary: z.int().min(1, "Salary is required"),
  joinDate: z.date(),
  // joinDate: z.coerce.date(),

  emergencyContact: z.string().min(10, "Phone number must be at least 10 digits"),
  notes: z.string().optional()

})
type StaffFormData = z.infer<typeof StaffSchema>


export function AddStaffDialog({ onStaffAdded, userId }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false)

  const { data, error, isLoading } = useSWR(userId ? `/api/owner/${userId}/dairies` : null, fetcher, {
    revalidateOnFocus: false
  })

const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = 
  useForm<StaffFormData>({
    resolver: zodResolver(StaffSchema),
    defaultValues: {
      status: "active"
    }
  })


  const [formData, setFormData] = useState({
    role: "",
    position: "",
    salary: "",
    joinDate: "",
    emergencyContact: "",
    notes: "",
  })

  const handleSubmitF = (e: React.FormEvent) => {
    e.preventDefault()

    const newStaff = {
      id: Math.random(),

      // required by schema
      role: formData.role,
      position: formData.position || null,
      salary: formData.salary ? Number(formData.salary) : null,
      joinDate: formData.joinDate ? new Date(formData.joinDate) : null,
      emergencyContact: formData.emergencyContact || null,
      notes: formData.notes || null,

      // fields added on backend after linking
      shift: "FULL_DAY",
    }

    onStaffAdded(newStaff)

    setFormData({
      role: "",
      position: "",
      salary: "",
      joinDate: "",
      emergencyContact: "",
      notes: "",
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={18} />
          Add Staff
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>Fill in the details according to the schema</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitF} className="space-y-4">

          {/* Position and role both are same use as need */}
          {/* Role */}
          {/* <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MILK_COLLECTOR">Milk Collector</SelectItem>
                <SelectItem value="SENIOR_MILK_COLLECTOR">Senior Milk Collector</SelectItem>
                <SelectItem value="MILK_TESTER">Milk Tester</SelectItem>
                <SelectItem value="QUALITY_AUDITOR">Quality Auditor</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="HELPER">Helper</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position">Position (optional)</Label>
            <Input
              id="position"
              placeholder="e.g. Senior Operator"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Monthly Salary</Label>
            <Input
              id="salary"
              type="number"
              placeholder="Enter salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
            />
          </div>

          {/* Join Date */}
          <div className="space-y-2">
            <Label htmlFor="joinDate">Join Date</Label>
            <Input
              id="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              required
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact (optional)</Label>
            <Input
              id="emergencyContact"
              placeholder="Enter phone number"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />
          </div>


          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Any notes about staff"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Staff Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
