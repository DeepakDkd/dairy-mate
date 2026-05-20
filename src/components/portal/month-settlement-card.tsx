"use client";

import axios from "axios";
import { Lock, RotateCcw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MonthSettlementCardProps {
  dairyId: number;
  month: string;
  monthLabel?: string;
  isClosed?: boolean;
  closedAt?: string | Date | null;
  onChanged?: () => void;
}

const formatDateTime = (value: string | Date) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function MonthSettlementCard({
  dairyId,
  month,
  monthLabel = "Selected month",
  isClosed = false,
  closedAt,
  onChanged,
}: MonthSettlementCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCloseMonth = async () => {
    if (!window.confirm(`Close ${monthLabel}? Entries and payments dated in this month will be locked until reopened.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`/api/dairies/${dairyId}/settlement`, { month });
      toast.success(`${monthLabel} closed.`);
      onChanged?.();
    } catch (error: any) {
      console.error("Failed to close month:", error);
      toast.error(error?.response?.data?.message ?? "Failed to close month.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenMonth = async () => {
    if (!window.confirm(`Reopen ${monthLabel}? This will allow edits and deletes in that month again.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.delete(`/api/dairies/${dairyId}/settlement?month=${month}`);
      toast.success(`${monthLabel} reopened.`);
      onChanged?.();
    } catch (error: any) {
      console.error("Failed to reopen month:", error);
      toast.error(error?.response?.data?.message ?? "Failed to reopen month.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`border shadow-sm ${isClosed ? "border-amber-200 bg-amber-50/60" : "border-emerald-200 bg-emerald-50/60 dark:border-emerald-700/40 dark:bg-emerald-900/20"}`}>
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Month Status</h3>
            <Badge
              variant="outline"
              className={
                isClosed
                  ? "border-amber-300 bg-amber-100 text-amber-800"
                  : "border-emerald-300 bg-emerald-100 text-emerald-800"
              }
            >
              {isClosed ? "Closed" : "Open"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isClosed
              ? `${monthLabel} is locked. Entries and payments dated in this month cannot be changed.`
              : `${monthLabel} is still open. Close it when you want to freeze the month for accounting.`}
          </p>
          {isClosed && closedAt ? (
            <p className="text-xs text-muted-foreground">
              Closed on {formatDateTime(closedAt)}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant={isClosed ? "outline" : "default"}
          onClick={isClosed ? handleReopenMonth : handleCloseMonth}
          disabled={isSubmitting}
          className="gap-2"
        >
          {isClosed ? <RotateCcw className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isSubmitting ? "Saving..." : isClosed ? "Reopen Month" : "Close Month"}
        </Button>
      </CardContent>
    </Card>
  );
}
