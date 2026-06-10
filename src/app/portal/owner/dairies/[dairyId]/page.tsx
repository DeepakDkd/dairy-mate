import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { getOwnedDairy } from "@/lib/owner-dairies";
import { DairyOverview } from "@/components/portal/dairy-overview";

interface DairyOverviewPageProps {
  params: Promise<{ dairyId: string }>;
}

export default async function DairyOverviewPage({
  params,
}: DairyOverviewPageProps) {
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
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <Link
        href="/portal/owner/dairies"
        className="inline-flex text-sm text-primary hover:underline"
      >
        Back to dairies
      </Link>
      <DairyOverview dairyId={dairyIdNumber} initialDairy={dairy} />
    </div>
  );
}
