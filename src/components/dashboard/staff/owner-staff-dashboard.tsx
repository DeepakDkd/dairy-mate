"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import useSWR from "swr";

import { AddStaffDialog } from "@/components/Dialog/staff/add-staff-dialog";
import {
  PortalDairyRailSkeleton,
  PortalStatsSkeleton,
  PortalTableSkeleton,
} from "@/components/portal/portal-skeletons";
import { StaffOverviewCards } from "@/components/dashboard/staff/overview-cards";
import { StaffRosterTable } from "@/components/dashboard/staff/staff-roster-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

interface OwnerStaffDashboardProps {
  dairyId: number;
  basePath: string;
}

export default function OwnerStaffDashboard({
  dairyId,
  basePath,
}: OwnerStaffDashboardProps) {
  const router = useRouter();
  const session = useSession();
  const userId = session.data?.user?.id;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort] = useState("name_asc");

  useEffect(() => {
    setPage(1);
  }, [dairyId]);

  const {
    data: dairiesData,
    error: dairiesError,
    isLoading: dairiesLoading,
  } = useSWR(
    userId ? `/api/owner/${userId}/dairies` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const staffKey = `/api/staff/${dairyId}?page=${page}&limit=${limit}&sort=${sort}`;

  const { data: staffData, error: staffDataError, isLoading } = useSWR(staffKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  const totalPages = staffData?.totalStaff
    ? Math.ceil(staffData.totalStaff / limit)
    : 0;

  useEffect(() => {
    if (dairiesError) {
      toast.error("Failed to load dairies.");
    }
  }, [dairiesError]);

  useEffect(() => {
    if (staffDataError) {
      toast.error("Failed to load staff data.");
    }
  }, [staffDataError]);

  const handleSelectDairy = (id: number) => {
    if (id === dairyId) return;
    router.push(`${basePath}/${id}/staff`);
  };

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <Link
        href={`${basePath}/${dairyId}`}
        className="inline-flex text-sm text-primary hover:underline"
      >
        Back to dairy overview
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage employees, track attendance, and handle payroll
          </p>
        </div>
        <AddStaffDialog userId={userId} />
      </div>

      {dairiesLoading ? (
        <PortalDairyRailSkeleton />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dairiesData?.dairies?.map((dairy: any) => (
            <div
              key={dairy.id}
              onClick={() => handleSelectDairy(dairy.id)}
              className={`w-44 shrink-0 cursor-pointer rounded-lg border p-4 sm:w-48 ${
                dairyId === dairy.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
            >
              <h3 className="font-semibold">{dairy.name}</h3>
              <p className="text-xs text-muted-foreground">
                {dairy.address || "No address"}
              </p>
              <p className="mt-1 text-xs">Staff: {dairy.stats?.staff ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <PortalStatsSkeleton count={4} />
      ) : (
        <StaffOverviewCards
          staffData={{
            activeStaff: staffData?.activeStaff,
            inactiveStaff: staffData?.inactiveStaff,
            totalMonthlySalary: staffData?.totalMonthlySalary,
          }}
          totalStaff={staffData?.totalStaff}
        />
      )}

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="roster">Staff Roster</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>
                Manage all staff members and their information
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {isLoading ? (
                <PortalTableSkeleton rows={5} columns={7} framed={false} />
              ) : (
                <StaffRosterTable
                  staff={staffData?.staff}
                  setPage={setPage}
                  page={page}
                  totalPages={totalPages}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Staff attendance rates and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Attendance reporting can plug into this section without changing the new route structure.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Management</CardTitle>
              <CardDescription>
                Monthly salary and payment tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Payroll tools can stay in this section while the dairy-specific route remains stable.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
