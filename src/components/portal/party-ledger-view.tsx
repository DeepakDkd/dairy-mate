"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMonthValue } from "@/utils/month";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

const formatDateTime = (value: string | Date) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface PartyLedgerViewProps {
  apiUrl: string;
  backHref: string;
  heading: string;
  emptyLabel: string;
  partyKey: "seller" | "buyer";
}

export function PartyLedgerView({
  apiUrl,
  backHref,
  heading,
  emptyLabel,
  partyKey,
}: PartyLedgerViewProps) {
  const [month, setMonth] = useState(getMonthValue());
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams({
      month,
      page: String(page),
      pageSize: String(pageSize),
    });

    return `${apiUrl}?${params.toString()}`;
  }, [apiUrl, month, page]);

  const { data, error } = useSWR(requestUrl, fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load ${partyKey} ledger.`);
    }
  }, [error, partyKey]);

  const party = data?.[partyKey];
  const ledger = data?.ledger ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <Link href={backHref} className="inline-flex text-sm text-primary hover:underline">
        Back
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground">{heading}</h1>
        <p className="mt-1 text-muted-foreground">
          {party?.name ? `${party.name}'s account history` : `Loading ${partyKey} details...`}
        </p>
      </div>

      <Card className="shadow-sm border">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle>{party?.name || "Account History"}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.monthLabel ? `Showing ${data.monthLabel}` : "Choose a month to review history."}
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              <Label htmlFor={`${partyKey}-ledger-month`}>Month</Label>
              <Input
                id={`${partyKey}-ledger-month`}
                type="month"
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length > 0 ? (
                  ledger.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDateTime(item.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.type === "PAYMENT"
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {item.type === "PAYMENT" ? "Payment" : "Milk Entry"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs {Number(item.amount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.balanceAfter < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                          Rs {Number(item.balanceAfter).toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.note}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      {emptyLabel}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Page {data?.page ?? page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={(data?.page ?? page) <= 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((value) => Math.min(totalPages || 1, value + 1))}
                disabled={!totalPages || (data?.page ?? page) >= totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
