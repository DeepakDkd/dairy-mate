import { OwnerPortalSidebar } from "@/components/portal/owner-sidebar";

interface OwnerPortalLayoutProps {
  children: React.ReactNode;
}

export default function OwnerPortalLayout({
  children,
}: OwnerPortalLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <OwnerPortalSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
