import NumberFlow from '@number-flow/react';
import { BarChart, Cpu, DollarSign, MessageSquare } from 'lucide-react';
import { formatEther } from 'viem';
import { useBalance } from 'wagmi';
import { useProjectCurrentPeriodStats } from '../hooks/use-api-call-stats';
import { MiniLineChart } from './charts/mini-line-chart';
import { DistributionPieChart } from './charts/distribution-pie-chart';
import { CustomBarChart } from './charts/bar-chart';

const format = {
  notation: 'standard',
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
} as const;

const gweiFormat = {
  notation: 'standard',
  useGrouping: true,
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
} as const;

const usdFormat = {
  notation: 'standard',
  useGrouping: true,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  style: 'currency',
  currency: 'USD',
} as const;

const percentFormat = {
  notation: 'standard',
  useGrouping: true,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const;

export function ApiCallStats({ projectId }: { projectId: string }) {
  const { totals, hourly, isLoading } = useProjectCurrentPeriodStats(projectId);
  const { data: projectBalance, isLoading: isBalanceLoading } = useBalance({
    address: projectId as `0x${string}`,
    query: {
      refetchInterval: 5000,
    },
  });

  if (isLoading || isBalanceLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Convert GWEI to ETH for display
  const costInEth = totals.cost ? parseFloat(formatEther(BigInt(totals.cost))) : 0;
  const projectBalanceValue = projectBalance ? parseFloat(formatEther(projectBalance.value)) : 0;
  const remainingBalance = projectBalanceValue - costInEth;

  // Dummy data for visualization
  const dummyDistributionData = [
    { name: 'Period Cost', value: 0.05 },
    { name: 'Remaining Balance', value: 0.95 },
  ];

  const dummyDailySpendData = [
    { name: 'Mon', spend: 0.012 },
    { name: 'Tue', spend: 0.008 },
    { name: 'Wed', spend: 0.015 },
    { name: 'Thu', spend: 0.005 },
    { name: 'Fri', spend: 0.004 },
    { name: 'Sat', spend: 0.002 },
    { name: 'Sun', spend: 0.004 },
  ];

  // Format hourly data for each chart
  const proxyData = hourly?.map((h) => ({ value: h.proxyCount }));
  const llmData = hourly?.map((h) => ({ value: h.llmCount }));
  const tokenData = hourly?.map((h) => ({ value: h.totalTokens }));
  const costData = hourly?.map((h) => ({ value: h.cost }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <CustomBarChart
            data={dummyDailySpendData}
            title="Daily Spend"
            description="Cost breakdown by day"
            bars={[{ key: 'spend', color: '#22c55e' }]}
            height={100}
          />
        </div>
        <div className="col-span-1">
          <DistributionPieChart
            data={dummyDistributionData}
            title="Balance Distribution"
            description="Breakdown of period cost vs remaining balance"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-green-400/30 rounded">
          <Cpu className="w-5 h-5 text-gray-700 dark:text-green-400" />
          <div className="space-y-0.5 flex-1">
            <div className="text-sm text-gray-500 dark:text-green-400/70">API Calls</div>
            <div className="font-mono">
              <NumberFlow
                value={totals?.proxyCount}
                format={format}
                className="font-semibold tabular-nums slashed-zero"
              />{' '}
              proxy
            </div>
            <div className="flex justify-end">
              <MiniLineChart data={proxyData} />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-green-400/30 rounded">
          <MessageSquare className="w-5 h-5 text-gray-700 dark:text-green-400" />
          <div className="space-y-0.5 flex-1">
            <div className="text-sm text-gray-500 dark:text-green-400/70">LLM Usage</div>
            <div className="font-mono">
              <NumberFlow
                value={totals?.llmCount}
                format={format}
                className="font-semibold tabular-nums slashed-zero"
              />{' '}
              calls
            </div>
            <div className="flex justify-end">
              <MiniLineChart data={llmData} />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-green-400/30 rounded">
          <BarChart className="w-5 h-5 text-gray-700 dark:text-green-400" />
          <div className="space-y-0.5 flex-1">
            <div className="text-sm text-gray-500 dark:text-green-400/70">Token Usage</div>
            <div className="font-mono">
              <NumberFlow
                value={totals?.totalTokens}
                format={format}
                className="font-semibold tabular-nums slashed-zero"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-green-400/50">
              <NumberFlow value={totals?.promptTokens} format={format} /> prompt /{' '}
              <NumberFlow value={totals?.completionTokens} format={format} /> completion
            </div>
            <div className="flex justify-end">
              <MiniLineChart data={tokenData} />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-green-400/30 rounded">
          <DollarSign className="w-5 h-5 text-gray-700 dark:text-green-400" />
          <div className="space-y-0.5 flex-1">
            <div className="text-sm text-gray-500 dark:text-green-400/70">Period Cost</div>
            <div className="font-mono">
              <NumberFlow
                value={costInEth}
                format={gweiFormat}
                className="font-semibold tabular-nums slashed-zero"
              />{' '}
              ETH
            </div>
            <div className="text-xs text-gray-500 dark:text-green-400/50">
              <NumberFlow value={totals?.costInUsd || 0} format={usdFormat} />
              {' · '}
              <NumberFlow value={totals?.costPercentage} format={percentFormat} />% of balance
            </div>
            <div className="flex justify-end">
              <MiniLineChart data={costData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
