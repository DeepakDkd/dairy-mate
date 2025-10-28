"use client";

import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}</h1>
          <p className="text-muted-foreground">
            {session?.user?.role === "ADMIN"
              ? "Admin Dashboard"
              : session?.user?.customerType === "SELLER"
              ? "Seller Dashboard"
              : "Buyer Dashboard"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
        >
          Sign out
        </Button>
      </div>

      {session?.user?.role === "ADMIN" ? (
        <AdminDashboard />
      ) : session?.user?.customerType === "SELLER" ? (
        <SellerDashboard />
      ) : (
        <BuyerDashboard />
      )}
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Total Users"
        value="Loading..."
        link="/admin/users"
      />
      <DashboardCard
        title="Today's Milk Collection"
        value="Loading..."
        link="/admin/milk-entries"
      />
      <DashboardCard
        title="Today's Transactions"
        value="Loading..."
        link="/admin/transactions"
      />
    </div>
  );
}

function SellerDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Today's Milk Entry"
        value="Loading..."
        link="/dashboard/milk-entry"
      />
      <DashboardCard
        title="Balance Amount"
        value="Loading..."
        link="/dashboard/transactions"
      />
      <DashboardCard
        title="Recent Transactions"
        value="View All"
        link="/dashboard/transactions"
      />
    </div>
  );
}

function BuyerDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard
        title="Today's Milk Entry"
        value="Loading..."
        link="/dashboard/milk-entry"
      />
      <DashboardCard
        title="Balance Amount"
        value="Loading..."
        link="/dashboard/transactions"
      />
      <DashboardCard
        title="Recent Transactions"
        value="View All"
        link="/dashboard/transactions"
      />
    </div>
  );
}

function DashboardCard({
  title,
  value,
  link,
}: {
  title: string;
  value: string;
  link: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-medium">{title}</h3>
      <p className="mb-4 text-2xl font-bold">{value}</p>
      <Button variant="outline" asChild className="w-full">
        <a href={link}>View Details</a>
      </Button>
    </div>
  );
}