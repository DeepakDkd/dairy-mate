import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { OwnerNotificationsPanel } from "@/components/portal/owner-notifications-panel";
import { Button } from "@/components/ui/button";

export default async function OwnerNotificationsPage() {
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="space-y-3">
        <Button asChild type="button" variant="outline" className="w-full gap-2 sm:w-auto">
          <Link href="/portal/owner">
            <ArrowLeft className="h-4 w-4" />
            Back to Owner Overview
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">User Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            Send portal notifications to buyers and sellers and review recent delivery activity in one place.
          </p>
        </div>
      </div>

      <OwnerNotificationsPanel hideHeader />
    </div>
  );
}
