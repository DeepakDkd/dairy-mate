"use client";

import Link from "next/link";
import axios from "axios";
import useSWR from "swr";
import { Building2, Milk, NotebookPen, UserStar, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DairyOverviewData = {
  id: number;
  name: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  pricingMode: "FAT_LR" | "MAWA";
  mawaPricePerKg: number | null;
  stats: {
    sellers: number;
    buyers: number;
    staff: number;
  };
};

type DairyOverviewProps = {
  dairyId: number;
  initialDairy: DairyOverviewData;
};

const fetcher = async ([url]: [string]) => {
  const response = await axios.get(url);
  return response.data.dairy as DairyOverviewData;
};

export function DairyOverview({ dairyId, initialDairy }: DairyOverviewProps) {
  const { data: dairy, error } = useSWR(
    [`/api/portal/dairies/${dairyId}/overview`],
    fetcher,
    {
      fallbackData: initialDairy,
      revalidateOnFocus: false,
    }
  );

  if (!dairy) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-6 text-sm text-muted-foreground">
          {error ? "Failed to load dairy overview." : "Loading dairy overview..."}
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      title: "Notifications",
      description: "Open the dairy-specific notifications workspace for this dairy.",
      href: `/portal/owner/dairies/${dairy.id}/notifications`,
      icon: NotebookPen,
      value: "Messages",
    },
    {
      title: "Reminders",
      description: "Open the dairy-specific reminders workspace for this dairy.",
      href: `/portal/owner/dairies/${dairy.id}/reminders`,
      icon: NotebookPen,
      value: "Tasks",
    },
    {
      title: "Sellers",
      description: "Manage seller roster, balances, and recent milk collections.",
      href: `/portal/owner/dairies/${dairy.id}/sellers`,
      icon: Milk,
      value: dairy.stats.sellers,
    },
    {
      title: "Buyers",
      description: "Track buyer accounts, consumption, and payment history.",
      href: `/portal/owner/dairies/${dairy.id}/buyers`,
      icon: Users,
      value: dairy.stats.buyers,
    },
    {
      title: "Staff",
      description: "Review staff roster, payroll, and attendance sections.",
      href: `/portal/owner/dairies/${dairy.id}/staff`,
      icon: UserStar,
      value: dairy.stats.staff,
    },
    {
      title: "Seller Entry",
      description: "Record new seller-side milk collections for this dairy.",
      href: `/portal/owner/dairies/${dairy.id}/sellers/create-entry`,
      icon: NotebookPen,
      value: dairy.pricingMode,
    },
    {
      title: "Buyer Entry",
      description: "Record milk supplied to buyers for this dairy.",
      href: `/portal/owner/dairies/${dairy.id}/buyers/create-entry`,
      icon: NotebookPen,
      value: dairy.pricingMode,
    },
  ];

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>{dairy.name}</CardTitle>
              <CardDescription>
                {dairy.address || "Address not added yet"}
              </CardDescription>
              <p className="text-sm text-muted-foreground">
                Pricing mode: {dairy.pricingMode}
                {dairy.pricingMode === "MAWA" && dairy.mawaPricePerKg
                  ? ` | Mawa price per kg: Rs ${dairy.mawaPricePerKg}`
                  : ""}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Card key={section.href} className="border shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {section.value}
                </span>
                <Link
                  href={section.href}
                  className="font-medium text-primary hover:underline"
                >
                  Open
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
