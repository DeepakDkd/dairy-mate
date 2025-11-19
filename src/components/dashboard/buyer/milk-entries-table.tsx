import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MilkEntry {
  id: string
  date: string
  shift: "Morning" | "Evening"
  quantity: number
  ratePerLitre: number
  totalAmount: number
  remarks: string
}

export function BuyerMilkEntriesTable() {
  // Mock data - sorted newest first
  const milkEntries: MilkEntry[] = [
    {
      id: "1",
      date: "2024-11-08",
      shift: "Morning",
      quantity: 42,
      ratePerLitre: 35,
      totalAmount: 1470,
      remarks: "Fresh Quality",
    },
    {
      id: "2",
      date: "2024-11-07",
      shift: "Evening",
      quantity: 50,
      ratePerLitre: 35,
      totalAmount: 1750,
      remarks: "",
    },
    {
      id: "3",
      date: "2024-11-07",
      shift: "Morning",
      quantity: 45,
      ratePerLitre: 35,
      totalAmount: 1575,
      remarks: "Cold Storage Used",
    },
    {
      id: "4",
      date: "2024-11-06",
      shift: "Evening",
      quantity: 48,
      ratePerLitre: 35,
      totalAmount: 1680,
      remarks: "",
    },
    {
      id: "5",
      date: "2024-11-06",
      shift: "Morning",
      quantity: 40,
      ratePerLitre: 35,
      totalAmount: 1400,
      remarks: "Standard Quality",
    },
    {
      id: "6",
      date: "2024-11-05",
      shift: "Evening",
      quantity: 42,
      ratePerLitre: 35,
      totalAmount: 1470,
      remarks: "",
    },
    {
      id: "7",
      date: "2024-11-05",
      shift: "Morning",
      quantity: 38,
      ratePerLitre: 35,
      totalAmount: 1330,
      remarks: "Collected Early",
    },
    {
      id: "8",
      date: "2024-11-04",
      shift: "Evening",
      quantity: 45,
      ratePerLitre: 35,
      totalAmount: 1575,
      remarks: "",
    },
    {
      id: "9",
      date: "2024-11-04",
      shift: "Morning",
      quantity: 40,
      ratePerLitre: 35,
      totalAmount: 1400,
      remarks: "Premium Quality",
    },
    {
      id: "10",
      date: "2024-11-03",
      shift: "Evening",
      quantity: 38,
      ratePerLitre: 35,
      totalAmount: 1330,
      remarks: "",
    },
  ]

  return (
    <Card className="bg-white--- shadow-md rounded-2xl border border-gray-100---">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Milk Entries</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Last 10 entries (newest first)</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200--- hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Date</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Shift</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Quantity (L)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Rate (₹/L)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase text-right">
                  Amount (₹)
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milkEntries.map((entry) => (
                <TableRow key={entry.id} className="border-b border-gray-100--- hover:bg-gray-50--- transition-colors">
                  <TableCell className="text-sm text-foreground">
                    {new Date(entry.date).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        entry.shift === "Morning"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {entry.shift}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-foreground font-medium">{entry.quantity}L</TableCell>
                  <TableCell className="text-right text-foreground">₹{entry.ratePerLitre}</TableCell>
                  <TableCell className="text-right text-foreground font-medium">
                    ₹{entry.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.remarks || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
