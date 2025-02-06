export function ProjectSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse" />
        <div className="h-10 w-36 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-black/5 dark:bg-white/5 rounded-lg space-y-3">
            <div className="h-6 w-3/4 bg-black/10 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-black/10 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-black/10 dark:bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
