"use client"

import useSWR from "swr";
import axios from "axios";
import type React from "react"
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface AddMilkEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const fetcher = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
}

export function AddBuyerMilkEntryDialog({ open, onOpenChange }: AddMilkEntryDialogProps) {

  const router = useRouter();

  const session = useSession();

  const userId = session.data?.user?.id;
  const { data, error, isLoading } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-montserrat">Add New Milk Entry</DialogTitle>
          <DialogDescription>Record a new milk collection entry</DialogDescription>
        </DialogHeader>
          <div className="space-y-2 w-full">
            <Label>Select Dairy</Label>

            {isLoading ? (
              <Loader />
            ) : (
              <Select
                onValueChange={(value) => router.push(`/dashboard/buyer/${value}/create-entry`)}
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
      </DialogContent>
    </Dialog>
  )
}
