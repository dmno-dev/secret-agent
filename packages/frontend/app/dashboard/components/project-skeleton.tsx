export function ProjectSkeleton() {
  return (
    <div className="flex space-x-6 h-[calc(100%-4rem)]">
      {/* Projects List Skeleton */}
      <div className="w-64 border border-green-400 rounded p-4 bg-white dark:bg-black space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3 border border-gray-200 dark:border-gray-800 rounded space-y-2"
          >
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Details Panel Skeleton */}
      <div className="flex-1 border border-green-400 rounded p-4 bg-white dark:bg-black">
        <div className="space-y-4">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-8" />
        </div>
      </div>
    </div>
  );
}
