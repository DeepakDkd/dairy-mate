import { notFound, redirect } from "next/navigation";

import { PartyLedgerView } from "@/components/portal/party-ledger-view";
import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnedDairy } from "@/lib/owner-dairies";

interface SellerLedgerPageProps {
  params: Promise<{ dairyId: string; sellerId: string }>;
}

export default async function SellerLedgerPage({ params }: SellerLedgerPageProps) {
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

  const { dairyId, sellerId } = await params;
  const dairyIdNumber = Number(dairyId);
  const sellerIdNumber = Number(sellerId);

  if (Number.isNaN(dairyIdNumber) || Number.isNaN(sellerIdNumber)) {
    notFound();
  }

  const dairy = await getOwnedDairy(user.id, dairyIdNumber);
  if (!dairy) {
    notFound();
  }

  return (
    <PartyLedgerView
      apiUrl={`/api/dairies/${dairyIdNumber}/sellers/${sellerIdNumber}/ledger`}
      backHref={`/portal/owner/dairies/${dairyIdNumber}/sellers`}
      heading="Seller Account History"
      emptyLabel="No seller ledger entries found."
      partyKey="seller"
    />
  );
}
