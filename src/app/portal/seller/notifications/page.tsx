import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getServerActionUser } from "@/fetchers/user/action";
import { PortalAccountActions } from "@/components/portal/portal-account-actions";
import { UserNotificationsPanel } from "@/components/portal/user-notifications-panel";
import { Button } from "@/components/ui/button";

export default async function SellerNotificationsPage() {
  const user = await getServerActionUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "SELLER") {
    redirect("/portal/owner/dairies");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button asChild type="button" variant="outline" className="w-full gap-2 sm:w-auto">
            <Link href="/portal/seller">
              <ArrowLeft className="h-4 w-4" />
              Back to Seller Portal
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-muted-foreground">
              Review messages from your dairy owner and recent account updates in one place.
            </p>
          </div>
        </div>
        <PortalAccountActions />
      </div>

      <UserNotificationsPanel />
    </div>
  );
}
