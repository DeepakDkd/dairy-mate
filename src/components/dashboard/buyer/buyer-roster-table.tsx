"use client"

import { useState } from "react"
import { User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, MoreVertical } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"





export function BuyerRosterTable({ buyer }: { buyer: User[] }) {
  const [sortBy, setSortBy] = useState<"name" | "status" | "joinDate">("name")


  if (!buyer || buyer.length === 0) {
    return <div>No staff data available.</div>
  }

  const sortedBuyer = [...buyer]?.sort((a: any, b: any) => {
    if (sortBy === "name") return a.firstName.localeCompare(b.firstName)
    if (sortBy === "status") return a.status.localeCompare(b.status)
    // if (sortBy === "joinDate") return new Date(b?.staffProfile?.joinDate).getTime() - new Date(a?.staffProfile?.joinDate).getTime()
    return 0
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={sortBy === "name" ? "default" : "outline"}
          onClick={() => setSortBy("name")}
          className="text-xs"
        >
          Sort by Name
        </Button>
        <Button
          variant={sortBy === "status" ? "default" : "outline"}
          onClick={() => setSortBy("status")}
          className="text-xs"
        >
          Sort by Status
        </Button>
        <Button
          variant={sortBy === "joinDate" ? "default" : "outline"}
          onClick={() => setSortBy("joinDate")}
          className="text-xs"
        >
          Sort by Join Date
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Join Date</TableHead>

              {/* <TableHead>Attendance</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBuyer?.length > 0 && sortedBuyer.map((member: any) => (
              <TableRow key={member.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{member?.firstName} {member?.lastName}</TableCell>
                <TableCell className="text-sm">{member.role}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{member.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      member.status === "active"
                        ? "default"
                        : "destructive"
                    }
                  >{member.status}</Badge>
                </TableCell>
                {/* <TableCell className="font-medium">₹{member?.buyerProfile?.balance.toLocaleString()}</TableCell> */}
                <TableCell className="font-medium">{member?.accountBalance?.currentBalance}</TableCell>
                <TableCell className="text-sm">{new Date(member?.createdAt).toLocaleDateString("en-IN")}</TableCell>
                {/* <TableCell>
                  <div className="flex items-center gap-1">
                    {/* <span className="font-medium">{member.attendance}%</span> */}
                {/* <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        // className={`h-full ${member.attendance >= 90 ? "bg-green-500" : member.attendance >= 75 ? "bg-yellow-500" : "bg-red-500"}`}
                        // style={{ width: `${member.attendance}%` }}
                      />
                    </div>
                  </div>
                </TableCell> */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="cursor-pointer" >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive flex items-center gap-2">
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
