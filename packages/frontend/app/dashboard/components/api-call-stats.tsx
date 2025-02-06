import NumberFlow from "@number-flow/react";
import { BarChart } from "lucide-react";
import { useApiCallStats } from "../hooks/use-api-call-stats";

const format = {
  notation: "standard",
  useGrouping: true,
} as const;

export function ApiCallStats({ projectId }: { projectId: string }) {
  const { totalCalls, isLoading } = useApiCallStats(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <BarChart size={20} className="text-gray-700 dark:text-green-400" />
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <BarChart size={20} className="text-gray-700 dark:text-green-400" />
      <span>
        API Calls:{" "}
        <NumberFlow
          value={totalCalls}
          format={format}
          className="font-semibold tabular-nums slashed-zero"
        />
      </span>
    </div>
  );
}
