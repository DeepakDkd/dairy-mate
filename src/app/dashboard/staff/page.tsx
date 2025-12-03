"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddStaffDialog } from "@/components/Dialog/staff/add-staff-dialog"
import { StaffOverviewCards } from "@/components/dashboard/staff/overview-cards"
import { StaffRosterTable } from "@/components/dashboard/staff/staff-roster-table"
import { AttendanceChart } from "@/components/dashboard/staff/attendance-chart"
import { PayrollTable } from "@/components/dashboard/staff/payroll-table"
import { useSession } from "next-auth/react"
import useSWR, { useSWRConfig } from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StaffDashboard() {
  // const [staffData, setStaffData] = useState([
  //   {
  //     id: 1,
  //     name: "Rajesh Kumar",
  //     role: "Senior Milk Collector",
  //     email: "rajesh@dairymate.com",
  //     phone: "+91 9876543210",
  //     status: "Active",
  //     salary: 15000,
  //     joinDate: "2023-01-15",
  //     attendance: 92,
  //   },
  //   {
  //     id: 2,
  //     name: "Priya Singh",
  //     role: "Milk Tester",
  //     email: "priya@dairymate.com",
  //     phone: "+91 9876543211",
  //     status: "Active",
  //     salary: 12000,
  //     joinDate: "2023-03-20",
  //     attendance: 88,
  //   },
  //   {
  //     id: 3,
  //     name: "Amit Patel",
  //     role: "Milk Collector",
  //     email: "amit@dairymate.com",
  //     phone: "+91 9876543212",
  //     status: "Active",
  //     salary: 10000,
  //     joinDate: "2023-06-10",
  //     attendance: 95,
  //   },
  //   {
  //     id: 4,
  //     name: "Neha Sharma",
  //     role: "Quality Auditor",
  //     email: "neha@dairymate.com",
  //     phone: "+91 9876543213",
  //     status: "Inactive",
  //     salary: 13000,
  //     joinDate: "2023-02-05",
  //     attendance: 0,
  //   },
  // ])

  const [payrollData] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "Senior Milk Collector",
      baseSalary: 15000,
      bonus: 2000,
      deductions: 1500,
      netSalary: 15500,
      paymentStatus: "Paid",
      paymentDate: "2024-11-30",
    },
    {
      id: 2,
      name: "Priya Singh",
      role: "Milk Tester",
      baseSalary: 12000,
      bonus: 1500,
      deductions: 1000,
      netSalary: 12500,
      paymentStatus: "Pending",
      paymentDate: "2024-12-05",
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Milk Collector",
      baseSalary: 10000,
      bonus: 1000,
      deductions: 800,
      netSalary: 10200,
      paymentStatus: "Paid",
      paymentDate: "2024-11-30",
    },
  ])


  const { mutate: globalMutate } = useSWRConfig();

  const session = useSession();
  const [selectedDairyId, setSelectedDairyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("name_asc");
  // try {
  const userId = session?.data?.user?.id;
  const { data: dairiesData, error: dairiesError, isLoading: dairiesLoading } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  console.log("Dairies Data:", dairiesData);
  useEffect(() => {
    if (dairiesData?.dairies?.length > 0 && !selectedDairyId) {
      setSelectedDairyId(dairiesData.dairies[0].id);
    }
  }, [dairiesData, selectedDairyId]);

  const staffKey =
    selectedDairyId &&
    `/api/staff/${selectedDairyId}?page=${page}&limit=${limit}&sort=${sort}`;


  const { data: staffData, isLoading, error, mutate: staffMutate } = useSWR(staffKey ? staffKey : null, fetcher, { revalidateOnFocus: false, dedupingInterval: 2000, });
  console.log("Staff Data from SWR:", staffData);

  const refreshBuyers = () => {
    if (staffKey) {
      staffMutate();
      globalMutate(staffKey);
    }
  };

  const handleSelectDairy = (id: number) => {
    setSelectedDairyId(id);
    setPage(1);
    refreshBuyers();
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage employees, track attendance, and handle payroll</p>
        </div>

        {/* <AddStaffDialog onStaffAdded={(newStaff) => setStaffData([...staffData, newStaff])} userId={session?.data?.user?.id} /> */}



      </div>

      {/* Overview Cards */}
      {/* <StaffOverviewCards staffData={staffData} /> */}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {dairiesData?.dairies?.map((d: any) => (
          <div
            key={d.id}
            onClick={() => handleSelectDairy(d.id)}
            className={`p-4 border rounded-lg cursor-pointer w-48
                ${selectedDairyId === d.id ? "border-blue-500 bg-blue-50---" : "border-gray-300---"}
            `}
          >
            <h3 className="font-semibold">{d.name}</h3>
            <p className="text-xs text-gray-500---">{d.address || "No address"}</p>
            <p className="text-xs mt-1">
              Staff: {d.users?.filter(
                (u: any) => u.role === "STAFF"
              ).length || 0
              }
            </p>
          </div>
        ))}
      </div>

      {/* Main Content - Tabs */}
      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="roster">Staff Roster</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        {/* Staff Roster Tab */}
        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>Manage all staff members and their information</CardDescription>
            </CardHeader>
            <CardContent>
              <StaffRosterTable staff={staffData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Staff attendance rates and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceChart staff={staffData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Management</CardTitle>
              <CardDescription>Monthly salary and payment tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <PayrollTable payroll={payrollData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
