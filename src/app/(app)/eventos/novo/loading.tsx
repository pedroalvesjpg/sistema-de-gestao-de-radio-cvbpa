import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton } from "@/components/skeletons/page-skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Skeleton className="h-4 w-24" />
      <div className="border-b border-border pb-6">
        <Skeleton className="h-9 w-48" />
      </div>
      <FormSkeleton campos={3} />
    </div>
  );
}
