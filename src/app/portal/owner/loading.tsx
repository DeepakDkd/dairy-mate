import {
  PortalDairyRailSkeleton,
  PortalHeaderSkeleton,
  PortalStatsSkeleton,
  PortalTableSkeleton,
} from "@/components/portal/portal-skeletons";

export default function OwnerPortalLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <PortalHeaderSkeleton />
      <PortalDairyRailSkeleton />
      <PortalStatsSkeleton count={4} />
      <PortalTableSkeleton rows={5} columns={5} />
    </div>
  );
}
