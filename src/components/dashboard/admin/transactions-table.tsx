import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
  id: string
  customerName: string
  type: "Buyer" | "Seller"
  milkTaken: number
  amount: number
  paymentStatus: "Paid" | "Pending"
  date: string
}

interface TransactionsTableProps {
  timeFilter: string
}

export function RecentTransactionsTable({ timeFilter }: TransactionsTableProps) {
  const transactions: Transaction[] = [
    {
      id: "1",
      customerName: "Raj Kumar",
      type: "Seller",
      milkTaken: 50,
      amount: 2500,
      paymentStatus: "Paid",
      date: "2024-11-01",
    },
    {
      id: "2",
      customerName: "Sweet Dairy Co.",
      type: "Buyer",
      milkTaken: 100,
      amount: 5000,
      paymentStatus: "Pending",
      date: "2024-10-31",
    },
    {
      id: "3",
      customerName: "Priya Sharma",
      type: "Seller",
      milkTaken: 75,
      amount: 3750,
      paymentStatus: "Paid",
      date: "2024-10-30",
    },
    {
      id: "4",
      customerName: "Fresh Dairy Ltd",
      type: "Buyer",
      milkTaken: 150,
      amount: 7500,
      paymentStatus: "Paid",
      date: "2024-10-29",
    },
    {
      id: "5",
      customerName: "Arjun Singh",
      type: "Seller",
      milkTaken: 60,
      amount: 3000,
      paymentStatus: "Pending",
      date: "2024-10-28",
    },
  ]

  return (
    <Card className="bg-white--- shadow-md rounded-2xl border border-gray-100---">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200--- hover:bg-transparent---">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Customer Name</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Type</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Milk Taken (L)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Amount (₹)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-b border-gray-100--- hover:bg-gray-50--- transition-colors">
                  <TableCell className="font-medium text-foreground">{transaction.customerName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        transaction.type === "Buyer"
                          ? "bg-blue-50 text-[#008ED6] border-blue-200"
                          : "bg-yellow-50 text-[#F6BD26] border-yellow-200"
                      }`}
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-foreground">{transaction.milkTaken}L</TableCell>
                  <TableCell className="text-right text-foreground font-medium">
                    ₹{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        transaction.paymentStatus === "Paid"
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                          : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50"
                      }`}
                      variant="outline"
                    >
                      {transaction.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(transaction.date).toLocaleDateString("en-IN")}
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
