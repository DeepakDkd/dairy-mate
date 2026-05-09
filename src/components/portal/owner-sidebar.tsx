"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Milk,
  NotebookPen,
  UserCircle2,
  Store,
  UserStar,
  Users,
  X,
} from "lucide-react";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OwnerPortalSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const currentDairyBasePath = useMemo(() => {
    const match = pathname.match(/^\/portal\/owner\/dairies\/([^/]+)/);
    if (!match) return null;
    return `/portal/owner/dairies/${match[1]}`;
  }, [pathname]);

  const primaryItems = [
    {
      label: "Portal Home",
      icon: LayoutDashboard,
      href: "/portal",
    },
    {
      label: "All Dairies",
      icon: Store,
      href: "/portal/owner/dairies",
    },
    // {
    //   label: "Legacy Dashboard",
    //   icon: Building2,
    //   href: "/dashboard",
    // },
  ];

  const dairyItems = currentDairyBasePath
    ? [
        {
          label: "Dairy Overview",
          icon: Store,
          href: currentDairyBasePath,
        },
        {
          label: "Sellers",
          icon: Milk,
          href: `${currentDairyBasePath}/sellers`,
        },
        {
          label: "Buyers",
          icon: Users,
          href: `${currentDairyBasePath}/buyers`,
        },
        {
          label: "Staff",
          icon: UserStar,
          href: `${currentDairyBasePath}/staff`,
        },
        {
          label: "Seller Entry",
          icon: NotebookPen,
          href: `${currentDairyBasePath}/sellers/create-entry`,
        },
        {
          label: "Buyer Entry",
          icon: NotebookPen,
          href: `${currentDairyBasePath}/buyers/create-entry`,
        },
      ]
    : [];

  const accountItems = [
    {
      label: "Profile",
      icon: UserCircle2,
      href: "/portal/owner/profile",
    },
  ];

  const renderLink = (
    item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> },
    collapsed: boolean
  ) => {
    const Icon = item.icon;
    const isActive = isActivePath(pathname, item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-muted"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const renderNavContent = (collapsed: boolean) => (
    <>
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <div className="space-y-2">
          {!collapsed && (
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              General
            </p>
          )}

          {primaryItems.map((item) => renderLink(item, collapsed))}
        </div>

        {dairyItems.length > 0 && (
          <div className="space-y-2">
            {!collapsed && (
              <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current Dairy
              </p>
            )}

            {dairyItems.map((item) => renderLink(item, collapsed))}
          </div>
        )}
      </nav>

      <div className="space-y-2 border-t p-4">
        {!collapsed && (
          <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Account
          </p>
        )}

        {accountItems.map((item) => renderLink(item, collapsed))}

        <button
          type="button"
          onClick={() => {
            toast.loading("Signing out...", { id: "portal-signout" });
            signOut({ callbackUrl: "/auth/login" });
          }}
          title={collapsed ? "Logout" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Owner Portal</p>
              <p className="text-xs text-muted-foreground">New route tree</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-md p-2 transition-colors hover:bg-muted"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-r bg-card shadow-xl lg:hidden">
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Owner Portal</p>
                  <p className="text-xs text-muted-foreground">New route tree</p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md p-1 transition-colors hover:bg-muted"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderNavContent(false)}
          </aside>
        </>
      )}

      <aside
        className={`sticky top-0 hidden h-screen flex-col border-r bg-card transition-all duration-300 lg:flex ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Owner Portal</p>
                <p className="text-xs text-muted-foreground">New route tree</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed((value) => !value)}
            className="rounded-md p-1 transition-colors hover:bg-muted"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {renderNavContent(isCollapsed)}
      </aside>
    </>
  );
}
