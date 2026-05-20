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
    if (updatingId) {
      return;
    }

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

  return (
    <Card id={sectionId} tabIndex={-1} className="scroll-mt-24">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Updates from your dairy owner and account activity alerts.
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className={
            unreadCount > 0
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }
        >
          {unreadLabel}
        </Badge>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification: any) => (
              <div key={notification.id} className="rounded-xl border bg-card px-4 py-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-foreground">{notification.title}</h4>
                      <Badge
                        variant="outline"
                        className={
                          notification.isRead
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                        }
                      >
                        {notification.isRead ? "Read" : "New"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notification.dairy?.name ? `${notification.dairy.name} | ` : ""}
                      {formatDateTime(notification.createdAt)}
                    </p>
                    {notification.message ? (
                      <p className="text-sm text-foreground/90">{notification.message}</p>
                    ) : null}
                  </div>
                  {!notification.isRead ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={updatingId === notification.id}
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      {updatingId === notification.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
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
