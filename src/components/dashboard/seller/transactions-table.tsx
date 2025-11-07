"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function SellerTransactionsTable() {
  // Mock data
  const transactions = [
    {
      id: 1,
      date: "Nov 7, 2025",
      type: "MILK_ENTRY",
      paidAmount: null,
      totalAmount: 85,
      balanceAfter: 125000,
      note: "Evening milk collection - 40L",
    },
    {
      id: 2,
      date: "Nov 6, 2025",
      type: "PAYMENT",
      paidAmount: 50000,
      totalAmount: 50000,
      balanceAfter: 125085,
      note: "Weekly payment received",
    },
    {
      id: 3,
      date: "Nov 6, 2025",
      type: "MILK_ENTRY",
      paidAmount: null,
      totalAmount: 92,
      balanceAfter: 75085,
      note: "Morning milk collection - 45L",
    },
    {
      id: 4,
      date: "Nov 5, 2025",
      type: "MILK_ENTRY",
      paidAmount: null,
      totalAmount: 84,
      balanceAfter: 74993,
      note: "Evening milk collection",
    },
  ]

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="text-right font-semibold">Paid Amount</TableHead>
                <TableHead className="text-right font-semibold">Total Amount</TableHead>
                <TableHead className="text-right font-semibold">Balance After</TableHead>
                <TableHead className="font-semibold">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-secondary/50">
                  <TableCell className="font-medium">{transaction.date}</TableCell>
                  <TableCell>
                    {transaction.type === "PAYMENT" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Payment</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Milk Entry</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.paidAmount ? `₹${transaction.paidAmount}` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{transaction.totalAmount}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">₹{transaction.balanceAfter}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{transaction.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
