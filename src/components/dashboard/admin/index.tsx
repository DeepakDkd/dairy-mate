"use client";
import { useGreeting } from "@/hooks/use-greeting";
import { useState } from "react";
import { TimeFilter } from "./time-filter";
import { OverviewCards } from "./overview-cards";
import { ChartsSection } from "./charts-section";
import { RecentTransactionsTable } from "./transactions-table";
import { AdminDashboardProps } from "@/types/admin-dashboard";
import useSWR from "swr";



const fecher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}


function AdminDashboard({ user }: AdminDashboardProps) {
  const [timeFilter, setTimeFilter] = useState("This Month")
  const greeting = useGreeting(user)
  console.log("user in AdminDashboard:", user);


  const { data } = useSWR(`/api/owner/${user?.id}/milk-collection`, fecher, { revalidateOnFocus: false });
  console.log("Admin dashboard milk collection data:", data);
  


  return (
    <div className="p-6 space-y-6">
      {/* Greeting Section */}
      <div className=" flex justify-between items-center" >
        <div className="">
          <h1 className="text-3xl font-bold text-foreground">{greeting}</h1>
          <p className="text-muted-foreground mt-1 ">Here&apos;s your dairy summary.</p>
        </div>
      </div>

      {/* Filter Section */}
      {/* <TimeFilter value={timeFilter} onChange={setTimeFilter} /> */}

      {/* Overview Cards */}
      <OverviewCards timeFilter={timeFilter} />

      {/* Charts Section */}
      <ChartsSection data={data?.last7Days} />

      {/* Recent Transactions */}
      <RecentTransactionsTable timeFilter={timeFilter} />
    </div>
  );
}

export default AdminDashboard;
