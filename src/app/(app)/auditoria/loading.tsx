import { Skeleton } from "@/components/ui/skeleton";
import { TabelaSkeleton } from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-4 border-b border-border pb-6">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-8" />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full sm:w-44" />
        <Skeleton className="h-9 w-full sm:w-40" />
        <Skeleton className="h-9 w-full sm:w-24" />
      </div>

      <TabelaSkeleton colunas={4} linhas={8} />
    </div>
  );
}
