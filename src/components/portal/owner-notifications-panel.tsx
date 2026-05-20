"use client";

import axios from "axios";
import { Bell, ChevronDown, ChevronUp, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
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

const fetcher = (url: string) => fetch(url).then((response) => response.json());
const DEFAULT_VISIBLE_NOTIFICATIONS = 3;

type NotificationType = "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "MONTH_CLOSE" | "CUSTOM";
type PersonOption = {
  id: number;
  name: string;
  role: "BUYER" | "SELLER";
};

interface OwnerNotificationsPanelProps {
  dairyId?: number;
  dairyName?: string;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeLabel(type: NotificationType) {
  switch (type) {
    case "PAYMENT_RECEIVED":
      return "Payment Received";
    case "PAYMENT_SENT":
      return "Payment Sent";
    case "MONTH_CLOSE":
      return "Month Closed";
    default:
      return "Custom";
  }
}

export function OwnerNotificationsPanel({
  dairyId,
  dairyName,
}: OwnerNotificationsPanelProps) {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNotificationsExpanded, setIsNotificationsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    dairyId: dairyId ? String(dairyId) : "",
    userIds: [] as string[],
    type: "CUSTOM" as NotificationType,
    title: "",
    message: "",
  });

  const notificationsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (dairyId) {
      params.set("dairyId", String(dairyId));
    }

    return `/api/notifications${params.toString() ? `?${params.toString()}` : ""}`;
  }, [dairyId]);

  const { data, error, mutate } = useSWR(notificationsUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const dairiesUrl = session?.user?.id && !dairyId
    ? `/api/owner/${session.user.id}/dairies`
    : null;
  const { data: dairiesData } = useSWR(dairiesUrl, fetcher, {
    revalidateOnFocus: false,
  });

  const selectedDairyId = Number(form.dairyId || dairyId || 0);
  const optionsUrl = selectedDairyId
    ? `/api/dairies/${selectedDairyId}/reminder-options`
    : null;
  const { data: optionsData } = useSWR(optionsUrl, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load notifications.");
    }
  }, [error]);

  useEffect(() => {
    if (dairyId) {
      setForm((current) => ({ ...current, dairyId: String(dairyId) }));
    }
  }, [dairyId]);

  const notifications = data?.notifications ?? [];
  const dairies = dairiesData?.dairies ?? [];
  const people = [
    ...(optionsData?.buyers ?? []).map((person: any) => ({ ...person, role: "BUYER" })),
    ...(optionsData?.sellers ?? []).map((person: any) => ({ ...person, role: "SELLER" })),
  ] as PersonOption[];
  const buyers = people.filter((person) => person.role === "BUYER");
  const sellers = people.filter((person) => person.role === "SELLER");
  const selectedCount = form.userIds.length;
  const unreadCount = notifications.filter((notification: any) => !notification.isRead).length;
  const readCount = notifications.length - unreadCount;
  const visibleNotifications = isNotificationsExpanded
    ? notifications.slice(0, 8)
    : notifications.slice(0, DEFAULT_VISIBLE_NOTIFICATIONS);
  const hiddenNotificationsCount = Math.max(
    0,
    Math.min(notifications.length, 8) - DEFAULT_VISIBLE_NOTIFICATIONS
  );

  const resetForm = () => {
    setForm({
      dairyId: dairyId ? String(dairyId) : "",
      userIds: [],
      type: "CUSTOM",
      title: "",
      message: "",
    });
  };

  const toggleRecipient = (userId: string) => {
    setForm((current) => ({
      ...current,
      userIds: current.userIds.includes(userId)
        ? current.userIds.filter((value) => value !== userId)
        : [...current.userIds, userId],
    }));
  };

  const replaceRecipients = (nextUserIds: string[]) => {
    setForm((current) => ({
      ...current,
      userIds: Array.from(new Set(nextUserIds)),
    }));
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!form.dairyId || form.userIds.length === 0 || !form.title.trim()) {
      toast.error("Dairy, at least one recipient, and title are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/notifications", {
        dairyId: Number(form.dairyId),
        userIds: form.userIds.map((value) => Number(value)),
        type: form.type,
        title: form.title,
        message: form.message,
      });
      const sentCount = Number(response.data?.sentCount ?? form.userIds.length);
      toast.success(
        sentCount === 1 ? "Notification sent to 1 user." : `Notifications sent to ${sentCount} users.`
      );
      resetForm();
      setIsDialogOpen(false);
      await mutate();
    } catch (requestError: any) {
      console.error("Failed to create notification:", requestError);
      toast.error(requestError?.response?.data?.message ?? "Failed to send notification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (deletingId) {
      return;
    }

    try {
      setDeletingId(notificationId);
      await axios.delete(`/api/notifications/${notificationId}`);
      toast.success("Notification deleted.");
      await mutate();
    } catch (requestError: any) {
      console.error("Failed to delete notification:", requestError);
      toast.error(requestError?.response?.data?.message ?? "Failed to delete notification.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>
            {dairyId ? `${dairyName ?? "Dairy"} Notifications` : "User Notifications"}
          </CardTitle>
          <CardDescription>
            Send portal notifications to buyers and sellers and review recent messages.
          </CardDescription>
        </div>
        <Button type="button" className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Send Notification
        </Button>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            No notifications sent yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-muted/30 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total Sent
                </p>
                <p className="mt-1 text-xl font-semibold text-foreground">{notifications.length}</p>
              </div>
              <div className="rounded-xl border bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  Unread
                </p>
                <p className="mt-1 text-xl font-semibold text-amber-800">{unreadCount}</p>
              </div>
              <div className="rounded-xl border bg-emerald-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  Read
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-800">{readCount}</p>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20">
              <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">Recent Activity</p>
                  <p className="text-sm text-muted-foreground">
                    Newest first. Showing the latest updates without stretching the page.
                  </p>
                </div>
                {notifications.length > DEFAULT_VISIBLE_NOTIFICATIONS ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsNotificationsExpanded((current) => !current)}
                  >
                    {isNotificationsExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        View {hiddenNotificationsCount} More
                      </>
                    )}
                  </Button>
                ) : null}
              </div>

              <div
                className={
                  isNotificationsExpanded
                    ? "max-h-[28rem] space-y-3 overflow-y-auto p-4"
                    : "space-y-3 p-4"
                }
              >
                {visibleNotifications.map((notification: any) => {
                  const compactMessage =
                    notification.message && notification.message.length > 120
                      ? `${notification.message.slice(0, 120)}...`
                      : notification.message;

                  return (
                    <div key={notification.id} className="rounded-xl border bg-card px-4 py-3 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium text-foreground">{notification.title}</h4>
                            <Badge variant="outline">{getTypeLabel(notification.type)}</Badge>
                            {!dairyId ? (
                              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                                {notification.dairy.name}
                              </Badge>
                            ) : null}
                            <Badge
                              variant="outline"
                              className={
                                notification.isRead
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                              }
                            >
                              {notification.isRead ? "Read" : "Unread"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.user.firstName} {notification.user.lastName} | {formatDateTime(notification.createdAt)}
                          </p>
                          {notification.message ? (
                            <p className="text-sm text-foreground/90">
                              {isNotificationsExpanded ? notification.message : compactMessage}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={deletingId === notification.id}
                          onClick={() => handleDelete(notification.id)}
                        >
                          {deletingId === notification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send one portal message to one or more buyers and sellers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            {!dairyId ? (
              <div className="space-y-2">
                <Label>Dairy</Label>
                <Select
                  value={form.dairyId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      dairyId: value,
                      userIds: [],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose dairy" />
                  </SelectTrigger>
                  <SelectContent>
                    {dairies.map((dairy: any) => (
                      <SelectItem key={dairy.id} value={String(dairy.id)}>
                        {dairy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      type: value as NotificationType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                    <SelectItem value="PAYMENT_RECEIVED">Payment Received</SelectItem>
                    <SelectItem value="PAYMENT_SENT">Payment Sent</SelectItem>
                    <SelectItem value="MONTH_CLOSE">Month Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label>Recipients</Label>
                  <p className="text-xs text-muted-foreground">
                    Choose one or more buyers and sellers for this message.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {selectedCount === 1 ? "1 recipient selected" : `${selectedCount} recipients selected`}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!buyers.length}
                    onClick={() =>
                      replaceRecipients([
                        ...form.userIds.filter((userId) =>
                          sellers.some((seller) => String(seller.id) === userId)
                        ),
                        ...buyers.map((buyer) => String(buyer.id)),
                      ])
                    }
                  >
                    All Buyers
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!sellers.length}
                    onClick={() =>
                      replaceRecipients([
                        ...form.userIds.filter((userId) =>
                          buyers.some((buyer) => String(buyer.id) === userId)
                        ),
                        ...sellers.map((seller) => String(seller.id)),
                      ])
                    }
                  >
                    All Sellers
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={selectedCount === 0}
                    onClick={() => replaceRecipients([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {!selectedDairyId ? (
                <div className="rounded-lg border border-dashed px-4 py-4 text-sm text-muted-foreground">
                  Choose a dairy first to load buyers and sellers.
                </div>
              ) : people.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-4 text-sm text-muted-foreground">
                  No buyers or sellers found for this dairy yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Buyers</p>
                    <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border p-3">
                      {buyers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No buyers found.</p>
                      ) : (
                        buyers.map((buyer) => {
                          const value = String(buyer.id);
                          const isSelected = form.userIds.includes(value);

                          return (
                            <Button
                              key={`buyer-${buyer.id}`}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => toggleRecipient(value)}
                            >
                              {buyer.name}
                            </Button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Sellers</p>
                    <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border p-3">
                      {sellers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sellers found.</p>
                      ) : (
                        sellers.map((seller) => {
                          const value = String(seller.id);
                          const isSelected = form.userIds.includes(value);

                          return (
                            <Button
                              key={`seller-${seller.id}`}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => toggleRecipient(value)}
                            >
                              {seller.name}
                            </Button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Payment recorded for your account"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Add the notification details"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSubmitting ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
