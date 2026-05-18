"use client";

import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

import { ModeToggle } from "@/components/theme/modeToggle";
import { Button } from "@/components/ui/button";

export function PortalAccountActions() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <ModeToggle />
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={isSigningOut}
        onClick={() => {
          if (isSigningOut) return;
          setIsSigningOut(true);
          toast.loading("Signing out...", { id: "portal-signout" });
          signOut({ callbackUrl: "/auth/login" });
        }}
      >
        {isSigningOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        {isSigningOut ? "Signing out..." : "Logout"}
      </Button>
    </div>
  );
}
