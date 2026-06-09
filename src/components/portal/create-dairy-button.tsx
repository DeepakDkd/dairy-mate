"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import CreateDairyDialog from "@/components/Dialog/admin/create-dairy";
import { Button } from "@/components/ui/button";

type CreateDairyButtonProps = {
  label?: string;
};

export function CreateDairyButton({
  label = "Create Dairy",
}: CreateDairyButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      <CreateDairyDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
