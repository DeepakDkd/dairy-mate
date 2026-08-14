"use client"

import Link from "next/link"
import { useState } from "react"
import { User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight, ReceiptText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function BuyerRosterTable({
  buyer,
  setPage,
  page,
  totalPages,
  getLedgerHref,
}: {
  buyer: User[],
  setPage: React.Dispatch<React.SetStateAction<number>>,
  page: number,
  totalPages: number,
  getLedgerHref?: (buyerId: number) => string,
}) {
  const [sortBy, setSortBy] = useState<"name" | "status" | "joinDate">("name")

  if (!buyer || buyer.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
        No buyers registered under this dairy business yet.
      </div>
    );
  }

  const sortedBuyer = [...buyer]?.sort((a: any, b: any) => {
    if (sortBy === "name") return a.firstName.localeCompare(b.firstName)
    if (sortBy === "status") return a.status.localeCompare(b.status)
    if (sortBy === "joinDate") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return 0
  })

  // Format Balance Helper for Buyers
  const formatBalanceCell = (balance: number) => {
    if (balance == null) return <span className="text-muted-foreground font-medium text-xs">--</span>;
    if (balance > 0) {
      // Positive balance: Buyer owes money to dairy (Receivable Asset)
      return (
        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
          Rs {Math.round(balance).toLocaleString("en-IN")} <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500/80">Receivable</span>
        </span>
      );
    }
    if (balance < 0) {
      // Negative balance: Buyer has paid extra in advance (Advance Credit)
      return (
        <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
          Rs {Math.round(Math.abs(balance)).toLocaleString("en-IN")} <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500/80">Advance</span>
        </span>
      );
    }
    return <span className="text-muted-foreground font-semibold text-xs">Settled</span>;
  };

  return (
    <div className="space-y-4">
      {/* Sorting Pill Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Sort by:</span>
        {(["name", "status", "joinDate"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSortBy(mode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
              sortBy === mode
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground bg-background"
            }`}
          >
            {mode === "name" ? "Name" : mode === "status" ? "Status" : "Join Date"}
          </button>
        ))}
      </div>

      <div className="border border-border/80 rounded-xl overflow-hidden shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-bold text-xs uppercase tracking-wider">Buyer & Contact</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Join Date</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider">Balance</TableHead>
              <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBuyer?.length > 0 && sortedBuyer.map((member: any) => {
              const balance = member?.accountBalance?.currentBalance;

              return (
                <TableRow key={member.id} className="hover:bg-muted/20 transition-colors">
                  {/* Name and Contact details combined */}
                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground text-sm capitalize leading-none">
                        {member?.firstName} {member?.lastName}
                      </p>
                      <div className="flex flex-col gap-0.5 pt-0.5 text-[11px] text-muted-foreground font-medium">
                        {member.phone && <span>Ph: {member.phone}</span>}
                        {member.email && <span>Email: {member.email}</span>}
                      </div>
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`font-semibold capitalize text-[10px] px-2.5 py-0.5 ${
                        member.status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "border-destructive/20 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>

                  {/* Join Date */}
                  <TableCell className="text-xs font-semibold text-muted-foreground">
                    {new Date(member?.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  {/* Format Balance dynamic rendering */}
                  <TableCell>
                    {formatBalanceCell(balance)}
                  </TableCell>

                  {/* Dropdown Menu actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="cursor-pointer hover:bg-muted" >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-lg">
                        {getLedgerHref && (
                          <DropdownMenuItem asChild>
                            <Link href={getLedgerHref(member.id)} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                              <ReceiptText size={14} className="text-muted-foreground" />
                              <span>View History Ledger</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                          <Edit2 size={14} className="text-muted-foreground" />
                          <span>Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer text-xs font-semibold hover:bg-destructive/10">
                          <Trash2 size={14} />
                          <span>Remove Buyer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Table Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between w-full p-3 border-t border-border/40 bg-muted/10">
            <span className="text-xs text-muted-foreground font-semibold">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="gap-1 cursor-pointer text-xs h-8"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="gap-1 cursor-pointer text-xs h-8"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
