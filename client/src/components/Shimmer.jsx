function ShimmerBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />;
}

export function FullPageShimmer() {
  return (
    <div className="p-6 space-y-4">
      <ShimmerBlock className="h-8 w-56" />
      <ShimmerBlock className="h-24 w-full" />
      <ShimmerBlock className="h-24 w-full" />
      <ShimmerBlock className="h-24 w-full" />
    </div>
  );
}

export function DashboardShimmer() {
  return (
    <div className="p-6 space-y-6">
      <ShimmerBlock className="h-8 w-72" />
      <ShimmerBlock className="h-12 w-full md:w-[420px]" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <ShimmerBlock className="h-28 w-full" />
        <ShimmerBlock className="h-28 w-full" />
        <ShimmerBlock className="h-28 w-full" />
        <ShimmerBlock className="h-28 w-full" />
        <ShimmerBlock className="h-28 w-full" />
        <ShimmerBlock className="h-28 w-full" />
      </div>
      <ShimmerBlock className="h-80 w-full" />
    </div>
  );
}

export function TablePageShimmer() {
  return (
    <div className="p-6 space-y-4">
      <ShimmerBlock className="h-8 w-64" />
      <ShimmerBlock className="h-12 w-full" />
      <ShimmerBlock className="h-12 w-full" />
      <ShimmerBlock className="h-12 w-full" />
      <ShimmerBlock className="h-12 w-full" />
    </div>
  );
}

export function TimelineShimmer() {
  return (
    <div className="space-y-3">
      <ShimmerBlock className="h-6 w-40" />
      <ShimmerBlock className="h-24 w-full" />
      <ShimmerBlock className="h-24 w-full" />
    </div>
  );
}

