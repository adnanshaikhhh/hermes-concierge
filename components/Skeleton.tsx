import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton", className)}
      aria-hidden
      {...rest}
    />
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="hidden gap-4 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-5 md:flex">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function BriefScorerSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-4">
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>
      ))}
    </div>
  );
}

export function DeliverableSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 lg:p-8">
      <Skeleton className="h-3 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/6" />
      </div>
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}
