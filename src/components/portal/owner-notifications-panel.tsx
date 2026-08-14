"use client";

import axios from "axios";
import { Bell, Loader2, Plus, Send, Trash2, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
import { getMonthValue } from "@/utils/month";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

type NotificationType = "PAYMENT_RECEIVED" | "PAYMENT_SENT" | "MONTH_CLOSE" | "CUSTOM";
type PersonOption = {
  id: number;
  name: string;
  role: "BUYER" | "SELLER";
};
type NotificationReadFilter = "ALL" | "UNREAD" | "READ";

interface OwnerNotificationsPanelProps {
  dairyId?: number;
  dairyName?: string;
  hideHeader?: boolean;
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

function getTypeBadge(type: NotificationType) {
  switch (type) {
    case "PAYMENT_RECEIVED":
      return (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
          Payment Received
        </Badge>
      );
    case "PAYMENT_SENT":
      return (
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50">
          Payment Sent
        </Badge>
      );
    case "MONTH_CLOSE":
      return (
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
          Month Closed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 font-semibold dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800/50">
          Custom
        </Badge>
      );
  }
}

// Helpers for Month Navigation
const getPreviousMonthString = (monthString: string): string => {
  if (!monthString || !monthString.includes("-")) return getMonthValue();
  const [year, month] = monthString.split("-").map(Number);
  const date = new Date(year, month - 2, 1);
  const prevYear = date.getFullYear();
  const prevMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${prevYear}-${prevMonth}`;
};

const getNextMonthString = (monthString: string): string => {
  if (!monthString || !monthString.includes("-")) return getMonthValue();
  const [year, month] = monthString.split("-").map(Number);
  const date = new Date(year, month, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
};

export function OwnerNotificationsPanel({
  dairyId,
  dairyName,
  hideHeader = false,
}: OwnerNotificationsPanelProps) {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Local Filtering & Pagination States
  const defaultMonth = getMonthValue();
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientSearchQuery, setRecipientSearchQuery] = useState("");
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | NotificationType>("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "BUYER" | "SELLER">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    if (selectedMonth) {
      params.set("month", selectedMonth);
    }
    return `/api/notifications${params.toString() ? `?${params.toString()}` : ""}`;
  }, [dairyId, selectedMonth]);

  const { data, error, mutate, isLoading } = useSWR(notificationsUrl, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
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

  // Reset pagination index to page 1 whenever filters adjust
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, readFilter, typeFilter, roleFilter, selectedMonth]);

  const notifications = data?.notifications ?? [];
  const dairies = dairiesData?.dairies ?? [];
  const people = [
    ...(optionsData?.buyers ?? []).map((person: any) => ({ ...person, role: "BUYER" })),
    ...(optionsData?.sellers ?? []).map((person: any) => ({ ...person, role: "SELLER" })),
  ] as PersonOption[];
  const buyers = people.filter((person) => person.role === "BUYER");
  const sellers = people.filter((person) => person.role === "SELLER");
  
  const filteredBuyers = useMemo(() => {
    const normalizedQuery = recipientSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) return buyers;
    return buyers.filter((buyer) => buyer.name.toLowerCase().includes(normalizedQuery));
  }, [buyers, recipientSearchQuery]);

  const filteredSellers = useMemo(() => {
    const normalizedQuery = recipientSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) return sellers;
    return sellers.filter((seller) => seller.name.toLowerCase().includes(normalizedQuery));
  }, [recipientSearchQuery, sellers]);

  const selectedCount = form.userIds.length;
  const unreadCount = notifications.filter((notification: any) => !notification.isRead).length;
  const readCount = notifications.length - unreadCount;

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return notifications.filter((notification: any) => {
      const fullName = `${notification.user.firstName} ${notification.user.lastName}`.toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        notification.title?.toLowerCase().includes(normalizedQuery) ||
        notification.message?.toLowerCase().includes(normalizedQuery) ||
        notification.dairy?.name?.toLowerCase().includes(normalizedQuery) ||
        fullName.includes(normalizedQuery);

      const matchesReadFilter =
        readFilter === "ALL" ||
        (readFilter === "READ" && notification.isRead) ||
        (readFilter === "UNREAD" && !notification.isRead);

      const matchesTypeFilter =
        typeFilter === "ALL" || notification.type === typeFilter;

      const matchesRoleFilter =
        roleFilter === "ALL" || notification.user.role === roleFilter;

      return matchesQuery && matchesReadFilter && matchesTypeFilter && matchesRoleFilter;
    });
  }, [notifications, readFilter, searchQuery, typeFilter, roleFilter]);

  // Client Side Pagination Slice
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const isFiltered = searchQuery || readFilter !== "ALL" || typeFilter !== "ALL" || roleFilter !== "ALL" || selectedMonth !== defaultMonth;

  const resetForm = () => {
    setForm({
      dairyId: dairyId ? String(dairyId) : "",
      userIds: [],
      type: "CUSTOM",
      title: "",
      message: "",
    });
    setRecipientSearchQuery("");
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

    if (isSubmitting) return;

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
      const emailedCount = Number(response.data?.emailedCount ?? 0);
      const emailSkippedCount = Number(response.data?.emailSkippedCount ?? 0);
      const emailFailedCount = Number(response.data?.emailFailedCount ?? 0);
      const notificationLabel =
        sentCount === 1 ? "Notification sent to 1 user." : `Notifications sent to ${sentCount} users.`;
      const emailParts = [];

      if (emailedCount > 0) emailParts.push(`emailed ${emailedCount}`);
      if (emailSkippedCount > 0) emailParts.push(`${emailSkippedCount} without email`);
      if (emailFailedCount > 0) emailParts.push(`${emailFailedCount} email failed`);

      toast.success(
        emailParts.length > 0 ? `${notificationLabel} ${emailParts.join(", ")}.` : notificationLabel
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
    if (deletingId) return;

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
    <Card className="border border-border/80 shadow-sm bg-card">
      {!hideHeader ? (
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">
              {dairyId ? `${dairyName ?? "Dairy"} Notifications` : "User Notifications"}
            </CardTitle>
            <CardDescription className="text-xs">
              Send portal notifications to buyers and sellers and review recent messages.
            </CardDescription>
          </div>
          <Button
            type="button"
            className="w-full gap-2 sm:w-auto cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Send Notification
          </Button>
        </CardHeader>
      ) : (
        <CardHeader className="pb-0">
          <div className="flex justify-end">
            <Button
              type="button"
              className="w-full gap-2 sm:w-auto cursor-pointer"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Send Notification
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="pt-6">
        {isLoading && !data ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Loading notifications...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Metric Status Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Sent
                </p>
                <p className="mt-1 text-2xl font-black text-foreground">{notifications.length}</p>
              </div>
              <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Unread
                </p>
                <p className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-300">{unreadCount}</p>
              </div>
              <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/20 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Read
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-300">{readCount}</p>
              </div>
            </div>

            {/* Filter Section & Listings */}
            <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
              <div className="space-y-4 border-b border-border/40 px-4 py-4 bg-muted/20">
                <div>
                  <p className="font-bold text-foreground text-sm">All Notifications</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Filter notifications by month, search terms, categories, read status, or roles.
                  </p>
                </div>

                {/* 5-Column Filter Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="notification-month" className="text-xs">Month</Label>
                    <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-1.5 h-10 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setSelectedMonth(getPreviousMonthString(selectedMonth))}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Previous Month"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <Input
                        id="notification-month"
                        type="month"
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full h-full p-0 text-center font-semibold text-xs cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedMonth(getNextMonthString(selectedMonth))}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Next Month"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notification-search" className="text-xs">Search</Label>
                    <Input
                      id="notification-search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Title, text, name..."
                      className="bg-background h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={typeFilter}
                      onValueChange={(value) => setTypeFilter(value as "ALL" | NotificationType)}
                    >
                      <SelectTrigger className="bg-background h-10">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All categories</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                        <SelectItem value="PAYMENT_RECEIVED">Payment Received</SelectItem>
                        <SelectItem value="PAYMENT_SENT">Payment Sent</SelectItem>
                        <SelectItem value="MONTH_CLOSE">Month Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Read Status</Label>
                    <Select
                      value={readFilter}
                      onValueChange={(value) => setReadFilter(value as NotificationReadFilter)}
                    >
                      <SelectTrigger className="bg-background h-10">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        <SelectItem value="UNREAD">Unread</SelectItem>
                        <SelectItem value="READ">Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Recipient Role</Label>
                    <Select
                      value={roleFilter}
                      onValueChange={(value) => setRoleFilter(value as "ALL" | "BUYER" | "SELLER")}
                    >
                      <SelectTrigger className="bg-background h-10">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All roles</SelectItem>
                        <SelectItem value="BUYER">Buyers Only</SelectItem>
                        <SelectItem value="SELLER">Sellers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing {filteredNotifications.length} of {notifications.length} notifications
                  </p>
                  {isFiltered ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto h-7 text-xs font-semibold cursor-pointer hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSearchQuery("");
                        setReadFilter("ALL");
                        setTypeFilter("ALL");
                        setRoleFilter("ALL");
                        setSelectedMonth(defaultMonth);
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Items List mapping paginated subset */}
              <div className="space-y-3 p-4">
                {paginatedNotifications.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 bg-background/50 px-4 py-8 text-center text-xs text-muted-foreground">
                    No notifications match the current filters.
                  </div>
                ) : (
                  paginatedNotifications.map((notification: any) => {
                    return (
                      <div key={notification.id} className="rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="break-words font-bold text-foreground text-sm">
                                {notification.title}
                              </h4>
                              {getTypeBadge(notification.type)}
                              {!dairyId ? (
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-400">
                                  {notification.dairy.name}
                                </Badge>
                              ) : null}
                              <Badge
                                variant="outline"
                                className={
                                  notification.isRead
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/40 dark:text-emerald-400"
                                    : "border-amber-200 bg-amber-50 text-amber-700 font-semibold dark:bg-amber-950/40 dark:text-amber-400"
                                }
                              >
                                {notification.isRead ? "Read" : "Unread"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              Sent to <strong className="text-foreground">{notification.user.firstName} {notification.user.lastName}</strong> ({notification.user.role}) | {formatDateTime(notification.createdAt)}
                            </p>
                            {notification.message ? (
                              <p className="break-words text-sm text-foreground/80 pt-1 leading-relaxed">{notification.message}</p>
                            ) : null}
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 sm:w-auto shrink-0 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
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
                  })
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border/20 pt-4 px-1 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1 cursor-pointer h-9 px-3 text-xs"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-xs text-muted-foreground font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1 cursor-pointer h-9 px-3 text-xs"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Send Notification Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Send Notification</DialogTitle>
            <DialogDescription className="text-xs">
              Send a portal notification message and optional alert to one or more buyers and sellers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            {!dairyId ? (
              <div className="space-y-2">
                <Label>Dairy Business</Label>
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
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Choose dairy business" />
                  </SelectTrigger>
                  <SelectContent>
                    {dairies.map((d: any) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Notification Category</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    type: value as NotificationType,
                  }))
                }
              >
                <SelectTrigger className="h-10 rounded-lg">
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOM">Custom Notification</SelectItem>
                  <SelectItem value="PAYMENT_RECEIVED">Payment Received Confirmation</SelectItem>
                  <SelectItem value="PAYMENT_SENT">Payment Sent Receipt</SelectItem>
                  <SelectItem value="MONTH_CLOSE">Month Close Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Selection Segment */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <Label className="font-semibold">Target Recipients</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Choose who receives this message in their portal view.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="h-7 px-2 font-bold bg-primary/10 text-primary border-primary/20">
                    {selectedCount === 1 ? "1 Selected" : `${selectedCount} Selected`}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs font-semibold cursor-pointer"
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
                    className="h-7 text-xs font-semibold cursor-pointer"
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
                    className="h-7 text-xs font-semibold text-destructive cursor-pointer hover:bg-destructive/10"
                    disabled={selectedCount === 0}
                    onClick={() => replaceRecipients([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recipient-search" className="text-xs">Search Roster</Label>
                <Input
                  id="recipient-search"
                  value={recipientSearchQuery}
                  onChange={(event) => setRecipientSearchQuery(event.target.value)}
                  placeholder="Type name to search..."
                  className="h-9"
                />
              </div>

              {!selectedDairyId ? (
                <div className="rounded-lg border border-dashed px-4 py-4 text-center text-xs text-muted-foreground bg-muted/10">
                  Select a dairy first to pull your roster list.
                </div>
              ) : people.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-4 text-center text-xs text-muted-foreground bg-muted/10">
                  No buyers or sellers found under this dairy.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Buyers</p>
                    <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border/80 p-2 bg-background/50">
                      {buyers.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-1">No buyers found.</p>
                      ) : filteredBuyers.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-1">No matches.</p>
                      ) : (
                        filteredBuyers.map((buyer) => {
                          const value = String(buyer.id);
                          const isSelected = form.userIds.includes(value);

                          return (
                            <Button
                              key={`buyer-${buyer.id}`}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className={`w-full justify-between items-center h-9 text-xs px-2.5 font-medium transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-primary text-primary-foreground hover:bg-primary/95" 
                                  : "hover:bg-muted bg-background border-border/75"
                              }`}
                              onClick={() => toggleRecipient(value)}
                            >
                              <span className="truncate pr-2">{buyer.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-primary-foreground" />}
                            </Button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sellers</p>
                    <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border/80 p-2 bg-background/50">
                      {sellers.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-1">No sellers found.</p>
                      ) : filteredSellers.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-1">No matches.</p>
                      ) : (
                        filteredSellers.map((seller) => {
                          const value = String(seller.id);
                          const isSelected = form.userIds.includes(value);

                          return (
                            <Button
                              key={`seller-${seller.id}`}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              className={`w-full justify-between items-center h-9 text-xs px-2.5 font-medium transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-primary text-primary-foreground hover:bg-primary/95" 
                                  : "hover:bg-muted bg-background border-border/75"
                              }`}
                              onClick={() => toggleRecipient(value)}
                            >
                              <span className="truncate pr-2">{seller.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-primary-foreground" />}
                            </Button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-border/30">
              <Label htmlFor="notification-title">Message Title</Label>
              <Input
                id="notification-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Daily Milk Delivery Receipt"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-message">Message Content (Optional)</Label>
              <Textarea
                id="notification-message"
                rows={4}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Add the notification details (e.g. quantity, fat rate, total amount details)"
                className="resize-none"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 border-t border-border/30 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 sm:w-auto cursor-pointer"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full h-10 gap-2 sm:w-auto cursor-pointer">
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
