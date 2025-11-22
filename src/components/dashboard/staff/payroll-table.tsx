"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"

interface Payroll {
  id: number
  name: string
  role: string
  baseSalary: number
  bonus: number
  deductions: number
  netSalary: number
  paymentStatus: string
  paymentDate: string
}

interface PayrollTableProps {
  payroll: Payroll[]
}

export function PayrollTable({ payroll }: PayrollTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Base Salary</TableHead>
            <TableHead className="text-right">Bonus</TableHead>
            <TableHead className="text-right">Deductions</TableHead>
            <TableHead className="text-right">Net Salary</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payroll.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{record.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{record.role}</TableCell>
              <TableCell className="text-right font-medium">₹{record.baseSalary.toLocaleString()}</TableCell>
              <TableCell className="text-right text-green-600">+₹{record.bonus.toLocaleString()}</TableCell>
              <TableCell className="text-right text-red-600">-₹{record.deductions.toLocaleString()}</TableCell>
              <TableCell className="text-right font-bold text-primary">₹{record.netSalary.toLocaleString()}</TableCell>
              <TableCell>
                <Badge
                  variant={record.paymentStatus === "Paid" ? "default" : "secondary"}
                  className={record.paymentStatus === "Paid" ? "bg-green-600" : "bg-yellow-600"}
                >
                  {record.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{new Date(record.paymentDate).toLocaleDateString("en-IN")}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
