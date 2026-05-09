import { notFound, redirect } from "next/navigation";

import OwnerBuyerDashboard from "@/components/dashboard/buyer/owner-buyer-dashboard";
import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnedDairy } from "@/lib/owner-dairies";

interface OwnerBuyerPageProps {
  params: Promise<{ dairyId: string }>;
}

export default async function OwnerBuyerPage({
  params,
}: OwnerBuyerPageProps) {
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
    <OwnerBuyerDashboard
      dairyId={dairy.id}
      basePath="/portal/owner/dairies"
    />
  );
}
