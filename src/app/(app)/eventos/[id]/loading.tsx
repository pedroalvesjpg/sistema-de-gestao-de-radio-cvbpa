import { Skeleton } from "@/components/ui/skeleton";
import {
  FiltrosSkeleton,
  StatsSkeleton,
} from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-24" />

      <div className="border-b border-border pb-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <StatsSkeleton celulas={3} className="mt-6 grid-cols-3 sm:grid-cols-3" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>

        <div className="space-y-4">
          <FiltrosSkeleton abas={3} />
          <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-9 w-36" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
