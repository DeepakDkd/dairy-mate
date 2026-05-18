"use client";

import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

import { ModeToggle } from "@/components/theme/modeToggle";
import { Button } from "@/components/ui/button";

export function PortalAccountActions() {
  return (
    <div className="flex items-center gap-2">
      <ModeToggle />
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={() => {
          toast.loading("Signing out...", { id: "portal-signout" });
          signOut({ callbackUrl: "/auth/login" });
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
