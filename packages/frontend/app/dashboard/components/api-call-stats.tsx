import NumberFlow from '@number-flow/react';
import { BarChart, Cpu, MessageSquare } from 'lucide-react';
import { useProjectCurrentPeriodStats } from '../hooks/use-api-call-stats';

const format = {
  notation: 'standard',
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
} as const;

const tokenFormat = {
  ...format,
  notation: 'compact',
} as const;

export function ApiCallStats({ projectId }: { projectId: string }) {
  const { totals, isLoading } = useProjectCurrentPeriodStats(projectId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-green-400/30 rounded">
        <Cpu className="w-5 h-5 text-gray-700 dark:text-green-400" />
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-green-400/70">API Calls</div>
          <div className="font-mono">
            <NumberFlow
              value={totals.proxyCount}
              format={format}
              className="font-semibold tabular-nums slashed-zero"
            />{' '}
            proxy
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-green-400/30 rounded">
        <MessageSquare className="w-5 h-5 text-gray-700 dark:text-green-400" />
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-green-400/70">LLM Usage</div>
          <div className="font-mono">
            <NumberFlow
              value={totals.llmCount}
              format={format}
              className="font-semibold tabular-nums slashed-zero"
            />{' '}
            calls
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-green-400/30 rounded">
        <BarChart className="w-5 h-5 text-gray-700 dark:text-green-400" />
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-green-400/70">Token Usage</div>
          <div className="font-mono">
            <NumberFlow
              value={totals.totalTokens}
              format={format}
              className="font-semibold tabular-nums slashed-zero"
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-green-400/50">
            <NumberFlow value={totals.promptTokens} format={format} /> prompt /{' '}
            <NumberFlow value={totals.completionTokens} format={format} /> completion
          </div>
        </div>
      </div>
    </div>
  );
}
