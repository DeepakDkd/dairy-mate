import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OwnerProfilePage() {
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

  const owner = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      ownedDairies: {
        select: {
          id: true,
          name: true,
          pricingMode: true,
        },
      },
    },
  });

  if (!owner) {
    redirect("/portal");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your owner account details for the new portal area.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {owner.firstName} {owner.lastName}
            </CardTitle>
            <CardDescription>{owner.role}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="break-all font-medium">{owner.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="break-all font-medium">{owner.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="break-words font-medium">{owner.address || "Not added"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-medium">
                {new Date(owner.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Quick owner account snapshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Owned dairies</p>
              <p className="text-2xl font-bold">{owner.ownedDairies.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{owner.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Dairies</CardTitle>
          <CardDescription>
            Dairies currently linked to your owner account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {owner.ownedDairies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dairies found.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {owner.ownedDairies.map((dairy) => (
                <div key={dairy.id} className="rounded-lg border p-4">
                  <p className="font-semibold">{dairy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Pricing mode: {dairy.pricingMode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
