"use client";

import Link from "next/link";
import { useEffect } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const { data, error } = useSWR(apiUrl, fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load ${partyKey} ledger.`);
    }
  }, [error, partyKey]);

  const party = data?.[partyKey];
  const ledger = data?.ledger ?? [];

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
          <CardTitle>{party?.name || "Account History"}</CardTitle>
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
        </CardContent>
      </Card>
    </div>
  );
}
