import { notFound, redirect } from "next/navigation";

import OwnerSellerDashboard from "@/components/dashboard/seller/owner-seller-dashboard";
import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnedDairy } from "@/lib/owner-dairies";

interface OwnerSellerPageProps {
  params: Promise<{ dairyId: string }>;
}

export default async function OwnerSellerPage({
  params,
}: OwnerSellerPageProps) {
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
    <OwnerSellerDashboard
      dairyId={dairy.id}
      basePath="/portal/owner/dairies"
    />
  );
}
