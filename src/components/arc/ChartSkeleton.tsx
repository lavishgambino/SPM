import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  type?: "line" | "bar" | "area" | "pie" | "horizontal-bar";
  height?: string;
  className?: string;
}

export function ChartSkeleton({ type = "bar", height = "260px", className }: ChartSkeletonProps) {
  return (
    <div className={cn("relative animate-pulse", className)} style={{ height }}>
      {type === "pie" ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-[110px] w-[110px] rounded-full bg-card" />
            </div>
          </div>
        </div>
      ) : type === "horizontal-bar" ? (
        <div className="h-full flex flex-col justify-center gap-3 py-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 rounded-r-md" style={{ width: `${40 + (i * 7) % 50}%` }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full flex items-end justify-between gap-2 pb-8 pt-8 px-4">
          {[...Array(type === "line" || type === "area" ? 8 : 6)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="w-full rounded-t-md" style={{ height: `${30 + (i * 13) % 60}%` }} />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function useChartLoading(delay = 400) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return isLoading;
}
