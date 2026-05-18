import { notFound, redirect } from "next/navigation";

import { PartyLedgerView } from "@/components/portal/party-ledger-view";
import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnedDairy } from "@/lib/owner-dairies";

interface BuyerLedgerPageProps {
  params: Promise<{ dairyId: string; buyerId: string }>;
}

export default async function BuyerLedgerPage({ params }: BuyerLedgerPageProps) {
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

  const { dairyId, buyerId } = await params;
  const dairyIdNumber = Number(dairyId);
  const buyerIdNumber = Number(buyerId);

  if (Number.isNaN(dairyIdNumber) || Number.isNaN(buyerIdNumber)) {
    notFound();
  }

  const dairy = await getOwnedDairy(user.id, dairyIdNumber);
  if (!dairy) {
    notFound();
  }

  return (
    <PartyLedgerView
      apiUrl={`/api/dairies/${dairyIdNumber}/buyers/${buyerIdNumber}/ledger`}
      backHref={`/portal/owner/dairies/${dairyIdNumber}/buyers`}
      heading="Buyer Account History"
      emptyLabel="No buyer ledger entries found."
      partyKey="buyer"
    />
  );
}
