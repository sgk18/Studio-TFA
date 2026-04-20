import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-12 md:px-12">
      {/* Editorial Header Skeleton */}
      <div className="mb-16 flex flex-col items-center text-center space-y-6">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-20 w-full max-w-2xl" />
        <Skeleton className="h-6 w-full max-w-lg" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
        {/* Sidebar Filters Skeleton */}
        <div className="hidden lg:block space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <div className="lg:col-span-3">
          <div className="mb-8 flex justify-between">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-48 rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
