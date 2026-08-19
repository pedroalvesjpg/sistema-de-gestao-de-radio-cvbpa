import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton } from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="border-b border-border pb-6">
        <Skeleton className="h-9 w-48" />
      </div>

      <section className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-9 w-36" />
        </div>
      </section>

      <section className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-background">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <FormSkeleton campos={3} />
      </section>
    </div>
  );
}
