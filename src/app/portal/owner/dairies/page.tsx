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
import { Badge } from "@/components/ui/badge";
import { CreateDairyButton } from "@/components/portal/create-dairy-button";

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Dairies</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and access all your registered dairy businesses.
            </p>
          </div>
          <CreateDairyButton />
        </div>
      </div>

      {dairies.length === 0 ? (
        <Card className="border border-dashed p-10 text-center">
          <CardHeader className="p-0">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg">No dairies yet</CardTitle>
            <CardDescription className="max-w-sm mx-auto mt-1">
              Create your first dairy profile here to start recording milk collections and viewing analytics.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dairies.map((dairy) => (
            <Link 
              key={dairy.id} 
              href={`/portal/owner/dairies/${dairy.id}`} 
              className="group block h-full"
            >
              <Card className="h-full border border-border/80 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/20 bg-card overflow-hidden flex flex-col justify-between cursor-pointer">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary border border-primary/15 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {dairy.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5 line-clamp-1">
                        {dairy.address || "Address not added yet"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {/* Metric Columns */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-2 text-center transition-colors group-hover:border-primary/10">
                      <div className="flex items-center justify-center gap-1 font-semibold text-muted-foreground mb-1">
                        <Milk className="h-3.5 w-3.5 text-blue-500" />
                        <span>Sellers</span>
                      </div>
                      <p className="text-lg font-extrabold text-foreground">{dairy.stats.sellers}</p>
                    </div>
                    
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-2 text-center transition-colors group-hover:border-primary/10">
                      <div className="flex items-center justify-center gap-1 font-semibold text-muted-foreground mb-1">
                        <Users className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Buyers</span>
                      </div>
                      <p className="text-lg font-extrabold text-foreground">{dairy.stats.buyers}</p>
                    </div>
                    
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-2 text-center transition-colors group-hover:border-primary/10">
                      <div className="flex items-center justify-center gap-1 font-semibold text-muted-foreground mb-1">
                        <UserStar className="h-3.5 w-3.5 text-purple-500" />
                        <span>Staff</span>
                      </div>
                      <p className="text-lg font-extrabold text-foreground">{dairy.stats.staff}</p>
                    </div>
                  </div>

                  {/* Card Footer Detail */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-border/20">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-medium">Pricing:</span>
                      <Badge 
                        variant="outline" 
                        className={
                          dairy.pricingMode === "FAT_LR" 
                            ? "border-blue-200 bg-blue-50 text-blue-600 font-semibold" 
                            : "border-amber-200 bg-amber-50 text-amber-600 font-semibold"
                        }
                      >
                        {dairy.pricingMode === "FAT_LR" ? "FAT + LR" : "MAWA"}
                      </Badge>
                    </div>
                    <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:text-primary/80 transition-colors">
                      Open Dairy <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
