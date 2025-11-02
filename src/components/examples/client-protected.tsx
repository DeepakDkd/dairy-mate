"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ClientProtectedPage() {
  // Get session on client side
  const { data: session, status } = useSession();

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Example of using session data
  return (
    <div>
      <h1>Welcome {session?.user?.name}</h1>
      {session?.user?.role === "ADMIN" && (
        <div>This content is only visible to admins</div>
      )}
      <div>Your balance: ₹{session?.user?.balanceAmount}</div>
    </div>
  );
}