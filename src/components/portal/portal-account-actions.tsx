"use client";

import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { Bell, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/theme/modeToggle";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

type PortalNotificationsResponse = {
  unreadCount?: number;
};

export function PortalAccountActions({
  notificationsTargetId = "portal-notifications",
}: {
  notificationsTargetId?: string;
}) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data, isLoading } = useSWR<PortalNotificationsResponse>(
    "/api/portal/notifications",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const unreadCount = data?.unreadCount ?? 0;
  const unreadBadgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const unreadButtonLabel =
    unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications";

  const handleNotificationsClick = () => {
    const target = document.getElementById(notificationsTargetId);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.focus({ preventScroll: true });
  };

  return (
    <div className="flex items-center gap-2">
      <ModeToggle />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="relative"
        aria-label={unreadButtonLabel}
        title={unreadButtonLabel}
        onClick={handleNotificationsClick}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {unreadCount > 0 ? (
          <Badge className="absolute -right-2 -top-2 min-w-5 px-1.5 py-0 text-[10px] leading-none">
            {unreadBadgeLabel}
          </Badge>
        ) : null}
      </Button>
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
