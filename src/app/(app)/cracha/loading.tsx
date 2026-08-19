import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="border-b border-border pb-6">
        <Skeleton className="h-9 w-56" />
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex justify-center">
          <div className="flex w-[20rem] flex-col items-center gap-5 rounded-md border border-border bg-background px-6 py-6">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-44 w-44 rounded-sm" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
}
