"use client"

import { useState } from "react"
import { User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { useSWRConfig } from "swr"
import axios from "axios"
import toast from "react-hot-toast"
import { EditStaffDialog } from "@/components/Dialog/staff/edit-staff-dialog"

export function StaffRosterTable({ staff, setPage, page, totalPages }: { staff: User[], setPage: React.Dispatch<React.SetStateAction<number>>, page: number, totalPages: number }) {
  const [sortBy, setSortBy] = useState<"name" | "status" | "joinDate">("name")
  const { data: session } = useSession()
  const { mutate } = useSWRConfig()
  
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)

  console.log("Staff Roster Table Staff Prop:", staff);

  if (!staff || staff.length === 0) {
    return <div>No staff data available.</div>
  }

  const isOwner = session?.user?.role === "OWNER"
  const isManager = session?.user?.role === "STAFF" && session?.user?.staffRole === "MANAGER"
  const canModify = isOwner || isManager

  const handleRefresh = () => {
    mutate((key) => typeof key === "string" && key.startsWith("/api/staff"))
  }

  const handleDelete = async (member: any) => {
    if (!window.confirm(`Are you sure you want to delete staff member ${member.firstName} ${member.lastName}?`)) {
      return
    }

    try {
      await axios.delete(`/api/staff/${member.dairyId}/${member.id}`)
      toast.success("Staff profile deleted successfully.")
      handleRefresh()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to delete staff member.")
    }
  }

  const sortedStaff = [...staff].sort((a: any, b: any) => {
    if (sortBy === "name") return a.firstName.localeCompare(b.firstName)
    if (sortBy === "status") return a.status.localeCompare(b.status)
    if (sortBy === "joinDate") return new Date(b?.staffProfile?.joinDate).getTime() - new Date(a?.staffProfile?.joinDate).getTime()
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
              <TableHead>Salary</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff?.length > 0 && sortedStaff.map((member: any) => {
              const isSelf = session?.user?.id === member.id
              const showActions = canModify && !isSelf

              return (
                <TableRow key={member.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium capitalize">{member?.firstName} {member?.lastName}</TableCell>
                  <TableCell className="text-sm ">{member.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.phone}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "Active" || member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">₹{member?.staffProfile?.salary.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{new Date(member?.staffProfile?.joinDate).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell className="capitalize">
                    {member?.staffProfile?.position}
                  </TableCell>
                  <TableCell className="text-right">
                    {showActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="cursor-pointer" >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setSelectedStaff(member)
                              setEditOpen(true)
                            }}
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive flex items-center gap-2 cursor-pointer"
                            onClick={() => handleDelete(member)}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        
        <div className="flex items-center justify-between   w-full p-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <EditStaffDialog 
        open={editOpen}
        onOpenChange={setEditOpen}
        staffMember={selectedStaff}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
