import Link from "next/link";
import { Building2, Milk, NotebookPen, UserStar, Users } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnedDairy } from "@/lib/owner-dairies";

interface DairyOverviewPageProps {
  params: Promise<{ dairyId: string }>;
}

export default async function DairyOverviewPage({
  params,
}: DairyOverviewPageProps) {
  const user = await getServerActionUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role === "SELLER") {
    redirect("/portal/seller");
  }

  if (user.role === "BUYER") {
    redirect("/portal/buyer");
  }

  const { dairyId } = await params;
  const dairyIdNumber = Number(dairyId);

  if (Number.isNaN(dairyIdNumber)) {
    notFound();
  }

  const dairy = await getOwnedDairy(user.id, dairyIdNumber);

  if (!dairy) {
    notFound();
  }

  const sections = [
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
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <Link
        href="/portal/owner/dairies"
        className="inline-flex text-sm text-primary hover:underline"
      >
        Back to dairies
      </Link>

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
    </div>
  );
}
