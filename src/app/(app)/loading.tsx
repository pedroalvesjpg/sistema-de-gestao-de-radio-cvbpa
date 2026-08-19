import { Skeleton } from "@/components/ui/skeleton";
import { FiltrosSkeleton } from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <Skeleton className="h-9 w-64" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>

        <div className="space-y-5">
          <FiltrosSkeleton abas={3} />
          <ul className="overflow-hidden rounded-md border border-border bg-background">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-4 border-t border-border px-5 py-6 first:border-t-0 sm:gap-6 sm:px-7"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="flex shrink-0 items-center gap-5 sm:gap-7">
                  <div className="space-y-1 text-right">
                    <Skeleton className="ml-auto h-7 w-8" />
                    <Skeleton className="ml-auto h-3 w-12" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
