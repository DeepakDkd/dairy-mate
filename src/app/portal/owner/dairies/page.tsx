import Link from "next/link";
import { Building2, Milk, Users, UserStar } from "lucide-react";
import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnedDairies } from "@/lib/owner-dairies";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OwnerDairiesPage() {
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

  const dairies = await getOwnedDairies(user.id);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Owner Portal</h1>
        <p className="mt-1 text-muted-foreground">
          This route tree mirrors the new structure without touching your current dashboard pages.
        </p>
      </div>

      {dairies.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No dairies yet</CardTitle>
            <CardDescription>
              Create your first dairy from the existing dashboard flow, then it will appear here automatically.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dairies.map((dairy) => (
            <Card key={dairy.id} className="border shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{dairy.name}</CardTitle>
                    <CardDescription>
                      {dairy.address || "Address not added yet"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 font-medium">
                      <Milk className="h-4 w-4" />
                      Sellers
                    </div>
                    <p className="mt-1 text-xl font-bold">{dairy.stats.sellers}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 font-medium">
                      <Users className="h-4 w-4" />
                      Buyers
                    </div>
                    <p className="mt-1 text-xl font-bold">{dairy.stats.buyers}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 font-medium">
                      <UserStar className="h-4 w-4" />
                      Staff
                    </div>
                    <p className="mt-1 text-xl font-bold">{dairy.stats.staff}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Pricing mode: {dairy.pricingMode}
                  </span>
                  <Link
                    href={`/portal/owner/dairies/${dairy.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Open dairy
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
