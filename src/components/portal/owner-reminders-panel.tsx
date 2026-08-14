"use client";

import axios from "axios";
import { BellRing, CheckCircle2, Clock3, Plus, RotateCcw, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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

type ReminderType = "BUYER_PAYMENT" | "SELLER_PAYMENT" | "MONTH_CLOSE" | "CUSTOM";
type ReminderStatus = "PENDING" | "DONE" | "DISMISSED";

type ReminderRow = {
  id: number;
  dairyId: number;
  type: ReminderType;
  status: ReminderStatus;
  title: string;
  message: string | null;
  dueDate: string;
  doneAt: string | null;
  dairy: {
    id: number;
    name: string;
  };
  targetUser: {
    id: number;
    firstName: string;
    lastName: string;
    role: "BUYER" | "SELLER" | "OWNER" | "STAFF";
  } | null;
};

type PartyOption = {
  id: number;
  name: string;
};

type DairyOption = {
  id: number;
  name: string;
};

interface OwnerRemindersPanelProps {
  dairyId?: number;
  dairyName?: string;
  hideHeader?: boolean;
}

function getTodayWindow() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function formatDueDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTypeBadge(type: ReminderType) {
  switch (type) {
    case "BUYER_PAYMENT":
      return (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
          Buyer Payment
        </Badge>
      );
    case "SELLER_PAYMENT":
      return (
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50">
          Seller Payment
        </Badge>
      );
    case "MONTH_CLOSE":
      return (
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-semibold dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
          Month Close
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

// Helpers for Month navigation
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

export function OwnerRemindersPanel({
  dairyId,
  dairyName,
  hideHeader = false,
}: OwnerRemindersPanelProps) {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionReminderId, setActionReminderId] = useState<number | null>(null);

  // Filters & Pagination States
  const defaultMonth = getMonthValue();
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | ReminderType>("ALL");
  const [activeTab, setActiveTab] = useState<"TODAY" | "OVERDUE" | "UPCOMING" | "DONE">("TODAY");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    dairyId: dairyId ? String(dairyId) : "",
    type: "CUSTOM" as ReminderType,
    targetUserId: "",
    dueDate: "",
    title: "",
    message: "",
  });

  const reminderUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (dairyId) {
      params.set("dairyId", String(dairyId));
    }
    if (selectedMonth) {
      params.set("month", selectedMonth);
    }
    return `/api/reminders${params.toString() ? `?${params.toString()}` : ""}`;
  }, [dairyId, selectedMonth]);

  const { data, error, mutate, isLoading } = useSWR(reminderUrl, fetcher, {
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
  const reminderOptionsUrl = selectedDairyId
    ? `/api/dairies/${selectedDairyId}/reminder-options`
    : null;
  const { data: reminderOptions } = useSWR(reminderOptionsUrl, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load reminders.");
    }
  }, [error]);

  useEffect(() => {
    if (dairyId) {
      setForm((current) => ({ ...current, dairyId: String(dairyId) }));
    }
  }, [dairyId]);

  // Reset pagination index when filters adapt
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, activeTab, selectedMonth]);

  const reminders: ReminderRow[] = data?.reminders ?? [];
  const dairies: DairyOption[] =
    dairiesData?.dairies?.map((item: any) => ({
      id: item.id,
      name: item.name,
    })) ?? [];

  const availablePeople: PartyOption[] = useMemo(() => {
    if (form.type === "BUYER_PAYMENT") {
      return reminderOptions?.buyers ?? [];
    }
    if (form.type === "SELLER_PAYMENT") {
      return reminderOptions?.sellers ?? [];
    }
    return [
      ...(reminderOptions?.buyers ?? []),
      ...(reminderOptions?.sellers ?? []),
    ];
  }, [form.type, reminderOptions]);

  // Group fetched list locally based on dates and status
  const groupedReminders = useMemo(() => {
    const { start, end } = getTodayWindow();

    return reminders.reduce(
      (groups, reminder) => {
        const dueDate = new Date(reminder.dueDate);

        // Apply Search & Type filters
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesQuery =
          normalizedQuery.length === 0 ||
          reminder.title?.toLowerCase().includes(normalizedQuery) ||
          reminder.message?.toLowerCase().includes(normalizedQuery) ||
          reminder.dairy?.name?.toLowerCase().includes(normalizedQuery) ||
          (reminder.targetUser &&
            `${reminder.targetUser.firstName} ${reminder.targetUser.lastName}`
              .toLowerCase()
              .includes(normalizedQuery));

        const matchesType = typeFilter === "ALL" || reminder.type === typeFilter;

        if (!matchesQuery || !matchesType) {
          return groups;
        }

        if (reminder.status === "DONE") {
          groups.done.push(reminder);
          return groups;
        }

        if (reminder.status === "DISMISSED") {
          return groups;
        }

        if (dueDate < start) {
          groups.overdue.push(reminder);
        } else if (dueDate >= start && dueDate < end) {
          groups.today.push(reminder);
        } else {
          groups.upcoming.push(reminder);
        }

        return groups;
      },
      {
        overdue: [] as ReminderRow[],
        today: [] as ReminderRow[],
        upcoming: [] as ReminderRow[],
        done: [] as ReminderRow[],
      }
    );
  }, [reminders, searchQuery, typeFilter]);

  // Set default tab based on items availability
  useEffect(() => {
    if (groupedReminders.today.length > 0) {
      setActiveTab("TODAY");
    } else if (groupedReminders.overdue.length > 0) {
      setActiveTab("OVERDUE");
    } else if (groupedReminders.upcoming.length > 0) {
      setActiveTab("UPCOMING");
    }
  }, [reminders]);

  const activeRemindersList = useMemo(() => {
    switch (activeTab) {
      case "OVERDUE":
        return groupedReminders.overdue;
      case "UPCOMING":
        return groupedReminders.upcoming;
      case "DONE":
        return groupedReminders.done;
      default:
        return groupedReminders.today;
    }
  }, [activeTab, groupedReminders]);

  // Pagination Slice
  const totalPages = Math.ceil(activeRemindersList.length / itemsPerPage);
  const paginatedReminders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return activeRemindersList.slice(startIndex, startIndex + itemsPerPage);
  }, [activeRemindersList, currentPage]);

  const isFiltered = searchQuery || typeFilter !== "ALL" || selectedMonth !== defaultMonth;

  const resetForm = () => {
    setForm({
      dairyId: dairyId ? String(dairyId) : "",
      type: "CUSTOM",
      targetUserId: "",
      dueDate: "",
      title: "",
      message: "",
    });
  };

  const handleCreateReminder = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!form.dairyId || !form.dueDate || !form.title.trim()) {
      toast.error("Dairy, title, and due date are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post("/api/reminders", {
        dairyId: Number(form.dairyId),
        type: form.type,
        targetUserId: form.targetUserId ? Number(form.targetUserId) : undefined,
        dueDate: `${form.dueDate}T12:00:00`,
        title: form.title,
        message: form.message,
      });
      toast.success("Reminder created.");
      resetForm();
      setIsDialogOpen(false);
      await mutate();
    } catch (requestError: any) {
      console.error("Failed to create reminder:", requestError);
      toast.error(requestError?.response?.data?.message ?? "Failed to create reminder.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReminderAction = async (
    reminderId: number,
    action: "done" | "reopen" | "snooze" | "delete"
  ) => {
    if (actionReminderId) return;

    try {
      setActionReminderId(reminderId);

      if (action === "delete") {
        await axios.delete(`/api/reminders/${reminderId}`);
        toast.success("Reminder deleted.");
      } else if (action === "done") {
        await axios.patch(`/api/reminders/${reminderId}`, {
          status: "DONE",
        });
        toast.success("Reminder marked as done.");
      } else if (action === "reopen") {
        await axios.patch(`/api/reminders/${reminderId}`, {
          status: "PENDING",
        });
        toast.success("Reminder reopened.");
      } else if (action === "snooze") {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(12, 0, 0, 0);

        await axios.patch(`/api/reminders/${reminderId}`, {
          status: "PENDING",
          dueDate: nextDate.toISOString(),
        });
        toast.success("Reminder snoozed to tomorrow.");
      }

      await mutate();
    } catch (requestError: any) {
      console.error("Failed to update reminder:", requestError);
      toast.error(requestError?.response?.data?.message ?? "Failed to update reminder.");
    } finally {
      setActionReminderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      {!hideHeader ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {dairyId ? `${dairyName ?? "Dairy"} Reminders` : "Owner Reminders"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track upcoming payment follow-ups, month-close work, and manual notes.
            </p>
          </div>
          <Button type="button" className="gap-2 cursor-pointer" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button type="button" className="gap-2 cursor-pointer" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        </div>
      )}

      {/* Main Content Workspace Card */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardContent className="pt-6 space-y-6">
          
          {/* SWR Loading Indicator */}
          {isLoading && !data ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Loading reminders...</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Header Filters block */}
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-4">
                <div>
                  <p className="font-bold text-foreground text-sm">Filters & Directory</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Isolate reminders by scheduled due month, type categories, or key text searches.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Month Navigation */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reminder-month" className="text-xs">Due Month</Label>
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
                        id="reminder-month"
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

                  {/* Text Search */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reminder-search" className="text-xs">Search Text</Label>
                    <Input
                      id="reminder-search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search title, name, message..."
                      className="bg-background h-10"
                    />
                  </div>

                  {/* Category Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={typeFilter}
                      onValueChange={(value) => setTypeFilter(value as "ALL" | ReminderType)}
                    >
                      <SelectTrigger className="bg-background h-10">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All categories</SelectItem>
                        <SelectItem value="BUYER_PAYMENT">Buyer Payments</SelectItem>
                        <SelectItem value="SELLER_PAYMENT">Seller Payments</SelectItem>
                        <SelectItem value="MONTH_CLOSE">Month Close Work</SelectItem>
                        <SelectItem value="CUSTOM">Custom Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between pt-1">
                  <p>
                    Showing {activeRemindersList.length} reminders under current status
                  </p>
                  {isFiltered ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto h-7 text-xs font-semibold cursor-pointer hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSearchQuery("");
                        setTypeFilter("ALL");
                        setSelectedMonth(defaultMonth);
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Status Tab list Selector */}
              <div className="flex flex-wrap gap-2 border-b border-border/40 pb-1">
                {(["TODAY", "OVERDUE", "UPCOMING", "DONE"] as const).map((tab) => {
                  const itemsCount =
                    tab === "OVERDUE"
                      ? groupedReminders.overdue.length
                      : tab === "UPCOMING"
                        ? groupedReminders.upcoming.length
                        : tab === "DONE"
                          ? groupedReminders.done.length
                          : groupedReminders.today.length;

                  const isSelected = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {tab === "TODAY"
                        ? `Today (${itemsCount})`
                        : tab === "OVERDUE"
                          ? `Overdue (${itemsCount})`
                          : tab === "UPCOMING"
                            ? `Upcoming (${itemsCount})`
                            : `Completed (${itemsCount})`}
                    </button>
                  );
                })}
              </div>

              {/* Reminders List rendering Paginated Slice */}
              <div className="space-y-3">
                {paginatedReminders.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground bg-muted/5">
                    {activeTab === "OVERDUE"
                      ? "No overdue reminders found."
                      : activeTab === "UPCOMING"
                        ? "No upcoming reminders found."
                        : activeTab === "DONE"
                          ? "No completed reminders found."
                          : "No reminders due today."}
                  </div>
                ) : (
                  paginatedReminders.map((reminder) => {
                    const isBusy = actionReminderId === reminder.id;
                    const targetName = reminder.targetUser
                      ? `${reminder.targetUser.firstName} ${reminder.targetUser.lastName}`
                      : null;

                    return (
                      <div
                        key={reminder.id}
                        className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md bg-card ${
                          activeTab === "OVERDUE"
                            ? "border-destructive/20 bg-destructive/5 dark:bg-destructive/10"
                            : "border-border/50"
                        }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-foreground text-sm">{reminder.title}</h4>
                              {getTypeBadge(reminder.type)}
                              {!dairyId ? (
                                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-400">
                                  {reminder.dairy.name}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              Due <strong className="text-foreground">{formatDueDate(reminder.dueDate)}</strong>
                              {targetName ? ` | Context: ${targetName} (${reminder.targetUser?.role})` : ""}
                            </p>
                            {reminder.message ? (
                              <p className="break-words text-sm text-foreground/80 pt-1 leading-relaxed">{reminder.message}</p>
                            ) : null}
                          </div>
                          
                          {/* Item Operations Panel */}
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            {reminder.status === "DONE" ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs h-8 cursor-pointer"
                                disabled={isBusy}
                                onClick={() => handleReminderAction(reminder.id, "reopen")}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reopen
                              </Button>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 text-xs h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer"
                                  disabled={isBusy}
                                  onClick={() => handleReminderAction(reminder.id, "done")}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  Done
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 text-xs h-8 text-amber-700 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/20 cursor-pointer"
                                  disabled={isBusy}
                                  onClick={() => handleReminderAction(reminder.id, "snooze")}
                                >
                                  <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                                  Snooze
                                </Button>
                              </>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-xs h-8 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
                              disabled={isBusy}
                              onClick={() => handleReminderAction(reminder.id, "delete")}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Pagination Triggers */}
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
          )}

        </CardContent>
      </Card>

      {/* Creation Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Reminder</DialogTitle>
            <DialogDescription className="text-xs">
              Add a manual in-app reminder task for your dairy operations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReminder} className="space-y-4">
            {!dairyId ? (
              <div className="space-y-2">
                <Label>Dairy Business</Label>
                <Select
                  value={form.dairyId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      dairyId: value,
                      targetUserId: "",
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Choose dairy business" />
                  </SelectTrigger>
                  <SelectContent>
                    {dairies.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      type: value as ReminderType,
                      targetUserId: "",
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOM">Custom Note</SelectItem>
                    <SelectItem value="BUYER_PAYMENT">Buyer Payment Alert</SelectItem>
                    <SelectItem value="SELLER_PAYMENT">Seller Payment Alert</SelectItem>
                    <SelectItem value="MONTH_CLOSE">Month Close Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-dueDate">Due Date</Label>
                <Input
                  id="reminder-dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>
            </div>

            {selectedDairyId ? (
              <div className="space-y-2">
                <Label>Linked Party (Optional)</Label>
                <Select
                  value={form.targetUserId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      targetUserId: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="No linked buyer or seller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No linked buyer or seller</SelectItem>
                    {availablePeople.map((person) => (
                      <SelectItem key={person.id} value={String(person.id)}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="reminder-title">Reminder Title</Label>
              <Input
                id="reminder-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Settle outstanding bill for August"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-message">Details / Notes (Optional)</Label>
              <Textarea
                id="reminder-message"
                rows={3}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                placeholder="Describe what needs to be checked or completed..."
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
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isSubmitting ? "Creating..." : "Create Reminder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
