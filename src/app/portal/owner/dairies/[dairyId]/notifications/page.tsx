import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnedDairy } from "@/lib/owner-dairies";
import { OwnerNotificationsPanel } from "@/components/portal/owner-notifications-panel";
import { Button } from "@/components/ui/button";

interface DairyNotificationsPageProps {
  params: Promise<{ dairyId: string }>;
}

export default async function DairyNotificationsPage({
  params,
}: DairyNotificationsPageProps) {
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="space-y-3">
        <Button asChild type="button" variant="outline" className="w-full gap-2 sm:w-auto">
          <Link href={`/portal/owner/dairies/${dairy.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to {dairy.name}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{dairy.name} Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            Send and review notifications only for buyers and sellers in this dairy.
          </p>
        </div>
      </div>

      <OwnerNotificationsPanel dairyId={dairy.id} dairyName={dairy.name} hideHeader />
    </div>
  );
}
