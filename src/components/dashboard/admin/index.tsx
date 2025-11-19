"use client";
import { useGreeting } from "@/hooks/use-greeting";
import { useState } from "react";
import { TimeFilter } from "./time-filter";
import { OverviewCards } from "./overview-cards";
import { ChartsSection } from "./charts-section";
import { RecentTransactionsTable } from "./transactions-table";
import { AdminDashboardProps } from "@/types/admin-dashboard";




 function AdminDashboard({ user }: AdminDashboardProps) {
   const [timeFilter, setTimeFilter] = useState("This Month")
  const greeting = useGreeting(user)
  console.log("user in AdminDashboard:", user);
  return (
     <div className="p-6 space-y-6">
      {/* Greeting Section */}
      <div className="">
        <h1 className="text-3xl font-bold text-foreground">{greeting}</h1>
        <p className="text-muted-foreground mt-1 ">Here&apos;s your dairy summary.</p>
      </div>

      {/* Filter Section */}
      <TimeFilter value={timeFilter} onChange={setTimeFilter} />

      {/* Overview Cards */}
      <OverviewCards timeFilter={timeFilter} />

      {/* Charts Section */}
      <ChartsSection timeFilter={timeFilter} />

      {/* Recent Transactions */}
      <RecentTransactionsTable timeFilter={timeFilter} />
    </div>
  );
}

export default AdminDashboard;