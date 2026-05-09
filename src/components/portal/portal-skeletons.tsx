import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PortalHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-8 w-56 sm:w-72" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </div>
  );
}

export function PortalStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PortalDairyRailSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="w-44 shrink-0 sm:w-48">
          <CardContent className="space-y-3 px-4 py-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PortalTableSkeleton({
  rows = 5,
  columns = 5,
  framed = true,
}: {
  rows?: number;
  columns?: number;
  framed?: boolean;
}) {
  const content = (
    <>
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton key={columnIndex} className="h-10 w-full" />
            ))}
          </div>
        ))}
      </div>
    </>
  );

  if (!framed) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Card>
      <CardHeader />
      <CardContent className="space-y-4">{content}</CardContent>
    </Card>
  );
}
