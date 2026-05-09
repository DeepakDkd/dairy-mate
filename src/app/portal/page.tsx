import { redirect } from "next/navigation";

import { getServerActionUser } from "@/fetchers/user/action";

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

  redirect("/portal/owner/dairies");
}
