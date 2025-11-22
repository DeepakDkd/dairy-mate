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

interface AddStaffDialogProps {
  onStaffAdded: (staff: any) => void
}

export function AddStaffDialog({ onStaffAdded }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    salary: "",
    joinDate: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newStaff = {
      id: Math.random(),
      ...formData,
      salary: Number.parseInt(formData.salary),
      status: "Active",
      attendance: 100,
    }
    onStaffAdded(newStaff)
    setFormData({ name: "", role: "", email: "", phone: "", salary: "", joinDate: "" })
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
          <DialogDescription>Fill in the details to add a new staff member</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Milk Collector">Milk Collector</SelectItem>
                <SelectItem value="Senior Milk Collector">Senior Milk Collector</SelectItem>
                <SelectItem value="Milk Tester">Milk Tester</SelectItem>
                <SelectItem value="Quality Auditor">Quality Auditor</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Monthly Salary</Label>
            <Input
              id="salary"
              type="number"
              placeholder="Enter salary amount"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
            />
          </div>

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

          <Button type="submit" className="w-full">
            Add Staff Member
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
