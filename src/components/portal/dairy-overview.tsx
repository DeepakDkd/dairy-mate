"use client";

import Link from "next/link";
import axios from "axios";
import useSWR from "swr";
import { 
  Building2, 
  Milk, 
  UserStar, 
  Users, 
  Bell, 
  CalendarDays, 
  PlusCircle, 
  ClipboardList 
} from "lucide-react";

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
      icon: Bell,
      value: "Messages",
      colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Reminders",
      description: "Open the dairy-specific reminders workspace for this dairy.",
      href: `/portal/owner/dairies/${dairy.id}/reminders`,
      icon: CalendarDays,
      value: "Tasks",
      colorClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Sellers",
      description: "Manage seller roster, balances, and recent milk collections.",
      href: `/portal/owner/dairies/${dairy.id}/sellers`,
      icon: Milk,
      value: `${dairy.stats.sellers} Sellers`,
      colorClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
    {
      title: "Buyers",
      description: "Track buyer accounts, consumption, and payment history.",
      href: `/portal/owner/dairies/${dairy.id}/buyers`,
      icon: Users,
      value: `${dairy.stats.buyers} Buyers`,
      colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Staff",
      description: "Review staff roster, payroll, and attendance sections.",
      href: `/portal/owner/dairies/${dairy.id}/staff`,
      icon: UserStar,
      value: `${dairy.stats.staff} Staff Members`,
      colorClass: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    },
    {
      title: "Seller Entry",
      description: "Record new seller-side milk collections for this dairy.",
      href: `/portal/owner/dairies/${dairy.id}/sellers/create-entry`,
      icon: PlusCircle,
      value: `Mode: ${dairy.pricingMode}`,
      colorClass: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
    },
    {
      title: "Buyer Entry",
      description: "Record milk supplied to buyers for this dairy.",
      href: `/portal/owner/dairies/${dairy.id}/buyers/create-entry`,
      icon: ClipboardList,
      value: `Mode: ${dairy.pricingMode}`,
      colorClass: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/40 dark:text-fuchsia-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dairy Top Header Card */}
      <Card className="border shadow-sm bg-gradient-to-r from-card to-muted/10">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary border border-primary/15 shadow-sm">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">{dairy.name}</CardTitle>
              <CardDescription className="text-sm font-medium">
                {dairy.address || "Address not added yet"}
              </CardDescription>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
                  Pricing mode: <strong className="ml-1 text-foreground">{dairy.pricingMode}</strong>
                </span>
                {dairy.pricingMode === "MAWA" && dairy.mawaPricePerKg && (
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                    Mawa Price / Kg: <strong className="ml-1 text-foreground">Rs {dairy.mawaPricePerKg}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sections Grid Workspace */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link 
              key={section.href} 
              href={section.href}
              className="group block"
            >
              <Card className="h-full border border-border/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 bg-card">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2.5 border border-transparent shrink-0 shadow-sm ${section.colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-2 border-t border-border/20">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {section.value}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:text-primary/80 transition-colors">
                    Open <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
