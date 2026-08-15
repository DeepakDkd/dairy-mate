import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";
import { prisma } from "@/lib/db";

export default async function PortalPage() {
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

  if (user.role === "STAFF") {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { dairyId: true },
    });
    if (dbUser?.dairyId) {
      redirect(`/portal/owner/dairies/${dbUser.dairyId}`);
    }
  }

  redirect("/portal/owner");
}
