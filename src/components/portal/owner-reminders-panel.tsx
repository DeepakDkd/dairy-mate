"use client";

import axios from "axios";
import { BellRing, CheckCircle2, Clock3, Plus, RotateCcw, Trash2 } from "lucide-react";
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
}

function getTodayWindow() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function getDueDateValue(value: string) {
  const date = new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDueDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTypeLabel(type: ReminderType) {
  switch (type) {
    case "BUYER_PAYMENT":
      return "Buyer Payment";
    case "SELLER_PAYMENT":
      return "Seller Payment";
    case "MONTH_CLOSE":
      return "Month Close";
    default:
      return "Custom";
  }
}

export function OwnerRemindersPanel({
  dairyId,
  dairyName,
}: OwnerRemindersPanelProps) {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionReminderId, setActionReminderId] = useState<number | null>(null);
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

    return `/api/reminders${params.toString() ? `?${params.toString()}` : ""}`;
  }, [dairyId]);

  const { data, error, mutate } = useSWR(reminderUrl, fetcher, {
    revalidateOnFocus: false,
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

  const groupedReminders = useMemo(() => {
    const { start, end } = getTodayWindow();

    return reminders.reduce(
      (groups, reminder) => {
        const dueDate = new Date(reminder.dueDate);

        if (reminder.status === "DONE") {
          groups.done.push(reminder);
          return groups;
        }

        if (reminder.status === "DISMISSED") {
          groups.dismissed.push(reminder);
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
        dismissed: [] as ReminderRow[],
      }
    );
  }, [reminders]);

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

    if (isSubmitting) {
      return;
    }

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
    if (actionReminderId) {
      return;
    }

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

  const renderGroup = (
    title: string,
    description: string,
    items: ReminderRow[],
    emptyText: string
  ) => (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((reminder) => {
              const isBusy = actionReminderId === reminder.id;
              const targetName = reminder.targetUser
                ? `${reminder.targetUser.firstName} ${reminder.targetUser.lastName}`
                : null;

              return (
                <div
                  key={reminder.id}
                  className="rounded-xl border bg-card px-4 py-3 shadow-sm"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-foreground">{reminder.title}</h4>
                        <Badge variant="outline">{getTypeLabel(reminder.type)}</Badge>
                        {!dairyId ? (
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                            {reminder.dairy.name}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due {formatDueDate(reminder.dueDate)}
                        {targetName ? ` | ${targetName}` : ""}
                      </p>
                      {reminder.message ? (
                        <p className="text-sm text-foreground/90">{reminder.message}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {reminder.status === "DONE" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={isBusy}
                          onClick={() => handleReminderAction(reminder.id, "reopen")}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reopen
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={isBusy}
                            onClick={() => handleReminderAction(reminder.id, "done")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Done
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={isBusy}
                            onClick={() => handleReminderAction(reminder.id, "snooze")}
                          >
                            <Clock3 className="h-4 w-4" />
                            Snooze
                          </Button>
                        </>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={isBusy}
                        onClick={() => handleReminderAction(reminder.id, "delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {dairyId ? `${dairyName ?? "Dairy"} Reminders` : "Owner Reminders"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Track upcoming payment follow-ups, month-close work, and manual notes.
          </p>
        </div>
        <Button type="button" className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {renderGroup(
          "Due Today",
          "Reminders that need attention today.",
          groupedReminders.today,
          "No reminders due today."
        )}
        {renderGroup(
          "Overdue",
          "Pending reminders whose due date has already passed.",
          groupedReminders.overdue,
          "No overdue reminders."
        )}
        {renderGroup(
          "Upcoming",
          "Scheduled reminders for the coming days.",
          groupedReminders.upcoming,
          "No upcoming reminders."
        )}
        {renderGroup(
          "Done",
          "Completed reminders kept for quick reference.",
          groupedReminders.done,
          "No completed reminders yet."
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Reminder</DialogTitle>
            <DialogDescription>
              Add a manual in-app reminder for this dairy workflow.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReminder} className="space-y-4">
            {!dairyId ? (
              <div className="space-y-2">
                <Label>Dairy</Label>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Choose dairy" />
                  </SelectTrigger>
                  <SelectContent>
                    {dairies.map((dairy) => (
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
                <Label>Reminder Type</Label>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Choose reminder type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUYER_PAYMENT">Buyer Payment</SelectItem>
                    <SelectItem value="SELLER_PAYMENT">Seller Payment</SelectItem>
                    <SelectItem value="MONTH_CLOSE">Month Close</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {form.type !== "MONTH_CLOSE" ? (
              <div className="space-y-2">
                <Label>Related Person (Optional)</Label>
                <Select
                  value={form.targetUserId || "__none__"}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      targetUserId: value === "__none__" ? "" : value,
                    }))
                  }
                  disabled={!selectedDairyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose buyer or seller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No linked person</SelectItem>
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
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Collect May payment from Rakesh"
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
                placeholder="Add any follow-up details or notes"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <BellRing className="h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Reminder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
