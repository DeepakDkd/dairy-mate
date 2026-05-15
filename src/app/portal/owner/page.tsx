
import Link from "next/link";
import { redirect } from "next/navigation"; 
import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnerPortalOverview } from "@/lib/owner-dairies"; 
import OwnerOverview from "@/components/portal/owner-overview";

 
export default async function OwnerPortalPage() {
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

  const overview = await getOwnerPortalOverview(user.id);
  console.log("Fetched owner portal overview data on server:", overview);
 
 
 

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Owner Overview
          </h1>
          <p className="mt-1 text-muted-foreground">
            Overall information for every dairy connected to your owner account.
          </p>
        </div>
        <Link
          href="/portal/owner/dairies"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          View Dairies
        </Link>
      </div>

    {
      overview && 
      <OwnerOverview  overview={overview} />
    }
 
    </div>
  );
}
