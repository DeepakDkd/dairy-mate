import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Payment {
  id: string
  date: string
  paymentAmount: number
  balanceAfter: number
  remarks: string
  status: "Completed" | "Pending"
}

export function BuyerPaymentsTable() {
  // Mock data - sorted newest first
  const payments: Payment[] = [
    {
      id: "1",
      date: "2024-11-07",
      paymentAmount: 5000,
      balanceAfter: -10000,
      remarks: "Partial Payment",
      status: "Completed",
    },
    {
      id: "2",
      date: "2024-11-05",
      paymentAmount: 10000,
      balanceAfter: -5000,
      remarks: "Monthly Settlement",
      status: "Completed",
    },
    {
      id: "3",
      date: "2024-10-30",
      paymentAmount: 8000,
      balanceAfter: 5000,
      remarks: "Advance Paid",
      status: "Completed",
    },
    {
      id: "4",
      date: "2024-10-25",
      paymentAmount: 7500,
      balanceAfter: 13000,
      remarks: "Initial Advance",
      status: "Completed",
    },
  ]

  return (
    <Card className="bg-white shadow-md rounded-2xl border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Payment History</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Recent payments</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Amount (₹)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Balance (₹)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="text-sm text-foreground">
                    {new Date(payment.date).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-foreground font-medium">
                    ₹{payment.paymentAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${payment.balanceAfter < 0 ? "text-red-600" : "text-green-600"}`}>
                      ₹{payment.balanceAfter.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        payment.status === "Completed"
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                          : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50"
                      }`}
                      variant="outline"
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
