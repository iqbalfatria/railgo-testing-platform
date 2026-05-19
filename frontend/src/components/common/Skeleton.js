const Skeleton = ({ className = '', width, height }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height }}
    data-testid="skeleton-loader"
    aria-label="Loading..."
  />
);

export const TicketCardSkeleton = () => (
  <div className="card space-y-4" data-testid="ticket-skeleton">
    <div className="flex justify-between">
      <Skeleton className="h-6 w-1/3 rounded-lg" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="flex items-center gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-1 flex-1" />
      <div className="space-y-2 text-right">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-10 w-28 rounded-xl" />
    </div>
  </div>
);

export const DashboardStatSkeleton = () => (
  <div className="card" data-testid="stat-skeleton">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export default Skeleton;
