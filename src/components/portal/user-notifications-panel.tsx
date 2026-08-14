"use client";

import axios from "axios";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UserNotificationsPanel({
  sectionId = "portal-notifications",
}: {
  sectionId?: string;
}) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { data, error, mutate } = useSWR("/api/portal/notifications", fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load notifications.");
    }
  }, [error]);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const unreadLabel = useMemo(() => {
    if (unreadCount === 0) return "All caught up";
    if (unreadCount === 1) return "1 unread";
    return `${unreadCount} unread`;
  }, [unreadCount]);

  const handleMarkRead = async (notificationId: number) => {
    if (updatingId) return;

    try {
      setUpdatingId(notificationId);
      await axios.patch(`/api/portal/notifications/${notificationId}`);
      await mutate();
    } catch (requestError: any) {
      console.error("Failed to mark notification as read:", requestError);
      toast.error(requestError?.response?.data?.message ?? "Failed to update notification.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper mapping notification categories to styled type tags
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PAYMENT_RECEIVED":
        return (
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold text-[10px]">
            Payment Received
          </Badge>
        );
      case "PAYMENT_SENT":
        return (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-semibold text-[10px]">
            Payment Remitted
          </Badge>
        );
      case "MONTH_CLOSE":
        return (
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-semibold text-[10px]">
            Settlement Closed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 font-semibold text-[10px]">
            General Notification
          </Badge>
        );
    }
  };

  return (
    <Card id={sectionId} tabIndex={-1} className="scroll-mt-24 border border-border/80 shadow-sm rounded-2xl overflow-hidden bg-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 bg-muted/10">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Bell className="h-5 w-5 text-primary" />
            Inbox Updates
          </CardTitle>
          <CardDescription className="text-xs">
            Direct messages from your dairy owner and automated account alerts.
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className={`w-full justify-center sm:w-auto font-bold text-[10px] px-3 py-1 ${
            unreadCount > 0
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
          }`}
        >
          {unreadLabel}
        </Badge>
      </CardHeader>
      
      <CardContent className="pt-4">
        {notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-xs text-muted-foreground bg-muted/5">
            Inbox is empty. No notifications received.
          </div>
        ) : (
          <div className="space-y-3.5">
            {notifications.map((notification: any) => (
              <div 
                key={notification.id} 
                className={`rounded-xl border px-3.5 py-3.5 shadow-sm transition-colors ${
                  notification.isRead 
                    ? "border-border/60 bg-background/50 opacity-80" 
                    : "border-primary/20 bg-primary/[0.01]"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="break-words font-bold text-foreground text-sm">{notification.title}</h4>
                      {getTypeBadge(notification.type)}
                      {!notification.isRead && (
                        <Badge variant="default" className="text-[9px] font-black uppercase tracking-wider h-4 flex items-center px-1.5 bg-blue-500 hover:bg-blue-500 text-white">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {notification.dairy?.name ? `${notification.dairy.name} | ` : ""}
                      {formatDateTime(notification.createdAt)}
                    </p>
                    {notification.message ? (
                      <p className="break-words text-xs text-foreground/90 font-medium leading-relaxed">{notification.message}</p>
                    ) : null}
                  </div>
                  
                  {!notification.isRead ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 sm:w-auto h-8 text-xs cursor-pointer hover:bg-muted font-bold"
                      disabled={updatingId === notification.id}
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      {updatingId === notification.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                      Mark Read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
